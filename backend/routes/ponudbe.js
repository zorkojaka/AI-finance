import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Ponudba } from '../models/Ponudba.js';
import { Client } from '../models/Client.js';
import { PricelistItem } from '../models/PricelistItem.js';
import generateOfferPdf from '../utils/generatePdf.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../output/ponudbe');

const safeIdentifier = (value = '') => value.replace(/[\\/]/g, '-');

function cleanupStevilka(base = '') {
  return base.replace(/\/v\d+$/i, '');
}

function buildVersionStevilka(base, verzija) {
  const sanitized = cleanupStevilka(base);
  return verzija > 1 ? `${sanitized}/v${verzija}` : sanitized;
}

async function ensureOutputDir() {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
}

async function resolveStranka(strankaId) {
  const stranka = await Client.findById(strankaId);
  if (!stranka) {
    throw new Error('Stranka ne obstaja.');
  }
  return stranka;
}

async function resolveArtikliPayload(artikliInput = []) {
  if (!Array.isArray(artikliInput) || artikliInput.length === 0) {
    throw new Error('Vsaj en artikel je obvezen.');
  }

  const artikliData = [];
  for (const { artikelId, kolicina } of artikliInput) {
    if (!artikelId || !kolicina || Number(kolicina) <= 0) {
      throw new Error('Artikel in količina sta obvezna.');
    }
    const artikel = await PricelistItem.findById(artikelId);
    if (!artikel) {
      throw new Error(`Artikel z ID ${artikelId} ne obstaja.`);
    }

    const qty = Number(kolicina);
    const cenaBrezDDV = artikel.prodajnaCena * qty;
    const ddvStopnja = artikel.davcnaStopnja ?? 22;
    const znesekZDDV = cenaBrezDDV * (1 + ddvStopnja / 100);

    artikliData.push({
      artikelId: artikel._id,
      naziv: artikel.naziv,
      enota: artikel.enota,
      kolicina: qty,
      cenaNaEnoto: artikel.prodajnaCena,
      cenaSkupaj: cenaBrezDDV,
      ddv: ddvStopnja,
      znesekZDDV
    });
  }

  const vsotaBrezDDV = artikliData.reduce((sum, i) => sum + i.cenaSkupaj, 0);
  const vsotaZDDV = artikliData.reduce((sum, i) => sum + i.znesekZDDV, 0);
  const ddvZnesek = vsotaZDDV - vsotaBrezDDV;

  return { artikliData, totals: { vsotaBrezDDV, vsotaZDDV, ddvZnesek } };
}

async function generatePdf(ponudbaDoc, artikliData, totals, stranka) {
  await ensureOutputDir();
  const filename = `${safeIdentifier(ponudbaDoc.stevilka)}.pdf`;
  const pdfPath = path.join(OUTPUT_DIR, filename);
  const skupnoSPopustom = totals.vsotaZDDV * (1 - (ponudbaDoc.popust ?? 0));

  await generateOfferPdf(
    {
      stevilka: ponudbaDoc.stevilka,
      datum: new Date().toLocaleDateString('sl-SI'),
      stranka: {
        ime: stranka.name,
        naslov: stranka.address ?? '',
        davcna: stranka.taxNumber ?? ''
      },
      artikli: artikliData,
      vsotaBrezDDV: totals.vsotaBrezDDV,
      ddvZnesek: totals.ddvZnesek,
      skupaj: skupnoSPopustom
    },
    pdfPath
  );

  ponudbaDoc.pdfPot = path.relative(path.resolve(__dirname, '..'), pdfPath);
  await ponudbaDoc.save();
}

router.post('/', async (req, res, next) => {
  try {
    const { strankaId, artikli, popust = 0 } = req.body ?? {};
    const stranka = await resolveStranka(strankaId);
    const { artikliData, totals } = await resolveArtikliPayload(artikli);

    const stevilka = generateStevilka();
    const ponudba = await Ponudba.create({
      strankaId,
      artikli,
      popust,
      stevilka,
      verzija: 1,
      aktivna: true
    });

    await generatePdf(ponudba, artikliData, totals, stranka);

    res.status(201).json({
      stevilka,
      stranka,
      artikli: artikliData,
      vsotaZDDV: totals.vsotaZDDV.toFixed(2),
      skupnoSPopustom: (totals.vsotaZDDV * (1 - popust)).toFixed(2),
      pdfUrl: `/api/ponudbe/${ponudba._id}/pdf`
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 100));
    const ponudbe = await Ponudba.find({ aktivna: { $ne: false } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('strankaId', 'name company email');

    res.json(
      ponudbe.map((ponudba) => ({
        id: ponudba._id,
        stevilka: ponudba.stevilka,
        verzija: ponudba.verzija ?? 1,
        datum: ponudba.updatedAt ?? ponudba.createdAt,
        stranka: ponudba.strankaId
          ? {
              id: ponudba.strankaId._id,
              name: ponudba.strankaId.name,
              company: ponudba.strankaId.company,
              email: ponudba.strankaId.email
            }
          : null,
        pdfUrl: ponudba.pdfPot ? `/api/ponudbe/${ponudba._id}/pdf` : null
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ponudba = await Ponudba.findById(req.params.id).populate('strankaId', 'name email address taxNumber');
    if (!ponudba) {
      return res.status(404).json({ error: 'Ponudba ni najdena.' });
    }

    const { artikliData, totals } = await resolveArtikliPayload(ponudba.artikli);

    res.json({
      id: ponudba._id,
      stevilka: ponudba.stevilka,
      verzija: ponudba.verzija ?? 1,
      aktivna: ponudba.aktivna !== false,
      stranka: ponudba.strankaId,
      artikli: artikliData.map((item) => ({
        ...item,
        artikelId: item.artikelId
      })),
      popust: ponudba.popust,
      vsotaZDDV: totals.vsotaZDDV.toFixed(2),
      vsotaBrezDDV: totals.vsotaBrezDDV.toFixed(2),
      ddvZnesek: totals.ddvZnesek.toFixed(2)
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { strankaId, artikli, popust = 0 } = req.body ?? {};
    const ponudba = await Ponudba.findById(req.params.id);
    if (!ponudba) {
      return res.status(404).json({ error: 'Ponudba ne obstaja.' });
    }

    const stranka = await resolveStranka(strankaId);
    const { artikliData, totals } = await resolveArtikliPayload(artikli);

    ponudba.strankaId = strankaId;
    ponudba.artikli = artikli;
    ponudba.popust = popust;
    await ponudba.save();
    await generatePdf(ponudba, artikliData, totals, stranka);

    res.json({ message: 'Ponudba posodobljena.' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ponudba = await Ponudba.findById(req.params.id);
    if (!ponudba) {
      return res.status(404).json({ error: 'Ponudba ne obstaja.' });
    }
    ponudba.aktivna = false;
    await ponudba.save();
    res.json({ message: 'Ponudba je deaktivirana.' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/verzija', async (req, res, next) => {
  try {
    const basePonudba = await Ponudba.findById(req.params.id);
    if (!basePonudba) {
      return res.status(404).json({ error: 'Ponudba ne obstaja.' });
    }

    const chainId = basePonudba.originalId ?? basePonudba._id;
    const latest = await Ponudba.findOne({
      $or: [{ _id: chainId }, { originalId: chainId }]
    })
      .sort({ verzija: -1 })
      .lean();

    const nextVerzija = (latest?.verzija ?? basePonudba.verzija ?? 1) + 1;
    const newStevilka = buildVersionStevilka(latest?.stevilka ?? basePonudba.stevilka, nextVerzija);

    const clone = await Ponudba.create({
      strankaId: basePonudba.strankaId,
      artikli: basePonudba.artikli,
      popust: basePonudba.popust,
      stevilka: newStevilka,
      verzija: nextVerzija,
      originalId: chainId,
      aktivna: true
    });

    const stranka = await resolveStranka(basePonudba.strankaId);
    const { artikliData, totals } = await resolveArtikliPayload(basePonudba.artikli);
    await generatePdf(clone, artikliData, totals, stranka);

    res.status(201).json({
      id: clone._id,
      stevilka: clone.stevilka,
      verzija: clone.verzija,
      pdfUrl: `/api/ponudbe/${clone._id}/pdf`
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const ponudba = await Ponudba.findById(req.params.id);
    if (!ponudba || !ponudba.pdfPot) {
      return res.status(404).json({ error: 'PDF ponudba ni najdena.' });
    }

    const absolutePath = path.resolve(__dirname, '..', ponudba.pdfPot);
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
});

function generateStevilka() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `P-${random}/${year}`;
}

export default router;
