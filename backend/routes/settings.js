import { Router } from 'express';
import generateOfferPdf from '../utils/generatePdf.js';
import {
  computePreviewTotals,
  getOfferTemplateSettings,
  writeOfferTemplateSettings
} from '../utils/templateSettings.js';

const router = Router();

const sanitizeString = (value, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const sanitizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

function normalizeSettings(payload = {}) {
  const company = payload.company ?? {};
  const preview = payload.preview ?? {};
  const previewClient = preview.client ?? {};

  return {
    company: {
      name: sanitizeString(company.name, 'Inteligent d.o.o.'),
      tagline: sanitizeString(
        company.tagline,
        'Celovite rešitve avtomatizacije in digitalizacije'
      ),
      address: sanitizeString(company.address, 'Tržaška cesta 99, 1000 Ljubljana'),
      taxId: sanitizeString(company.taxId, 'SI12345678'),
      registration: sanitizeString(company.registration, '8765432'),
      email: sanitizeString(company.email, 'info@inteligent.si'),
      phone: sanitizeString(company.phone, '+386 40 123 456'),
      website: sanitizeString(company.website, 'www.inteligent.si'),
      logoUrl: sanitizeString(
        company.logoUrl,
        'https://dummyimage.com/220x60/2563eb/ffffff&text=INTELIGENT'
      )
    },
    note:
      sanitizeString(
        payload.note,
        'Ponudba velja 30 dni od datuma izdaje. Montaža in konfiguracija niso vključene, razen če je drugače navedeno.'
      ) ?? '',
    preview: {
      stevilka: sanitizeString(preview.stevilka, 'P-2025/0012'),
      datum: sanitizeString(preview.datum, new Date().toISOString().slice(0, 10)),
      client: {
        ime: sanitizeString(previewClient.ime, 'Kovinarstvo Novak d.o.o.'),
        naslov: sanitizeString(previewClient.naslov, 'Podutiška cesta 15, 1000 Ljubljana'),
        davcna: sanitizeString(previewClient.davcna, 'SI12345678')
      },
      items: Array.isArray(preview.items)
        ? preview.items.map((item) => ({
            naziv: sanitizeString(item.naziv),
            enota: sanitizeString(item.enota, 'kos'),
            kolicina: sanitizeNumber(item.kolicina, 1),
            cenaNaEnoto: sanitizeNumber(item.cenaNaEnoto, 0),
            ddv: sanitizeNumber(item.ddv, 22)
          }))
        : []
    }
  };
}

router.get('/offer-template', async (req, res, next) => {
  try {
    const settings = await getOfferTemplateSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/offer-template', async (req, res, next) => {
  try {
    const normalized = normalizeSettings(req.body);
    await writeOfferTemplateSettings(normalized);
    res.json(normalized);
  } catch (error) {
    next(error);
  }
});

router.get('/offer-template/preview', async (req, res, next) => {
  try {
    const settings = await getOfferTemplateSettings();
    const totals = computePreviewTotals(settings.preview?.items ?? []);
    const buffer = await generateOfferPdf({
      stevilka: settings.preview?.stevilka ?? 'P-2025/0012',
      datum: settings.preview?.datum
        ? new Date(settings.preview.datum).toLocaleDateString('sl-SI')
        : new Date().toLocaleDateString('sl-SI'),
      stranka: settings.preview?.client ?? {},
      artikli: totals.items,
      vsotaBrezDDV: totals.vsotaBrezDDV,
      ddvZnesek: totals.ddvZnesek,
      skupaj: totals.skupaj,
      note: settings.note
    });

    res.type('application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="ponudba-preview.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
