import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.resolve(__dirname, '../config/offerTemplateSettings.json');

let cachedSettings = null;
let cachedMtime = null;

async function statSafe(filePath) {
  try {
    return await fs.promises.stat(filePath);
  } catch {
    return null;
  }
}

function buildDefaultSettings() {
  return {
    company: {
      name: 'Inteligent d.o.o.',
      tagline: 'Celovite rešitve avtomatizacije in digitalizacije',
      address: 'Tržaška cesta 99, 1000 Ljubljana',
      taxId: 'SI12345678',
      registration: '8765432',
      email: 'info@inteligent.si',
      phone: '+386 40 123 456',
      website: 'www.inteligent.si',
      logoUrl: 'https://dummyimage.com/220x60/2563eb/ffffff&text=INTELIGENT'
    },
    note:
      'Ponudba velja 30 dni od datuma izdaje. Montaža in konfiguracija niso vključene, razen če je drugače navedeno.',
    preview: {
      stevilka: 'P-2025/0012',
      datum: new Date().toISOString().slice(0, 10),
      client: {
        ime: 'Kovinarstvo Novak d.o.o.',
        naslov: 'Podutiška cesta 15, 1000 Ljubljana',
        davcna: 'SI12345678'
      },
      items: [
        { naziv: 'Industrijski krmilnik X200', enota: 'kos', kolicina: 2, cenaNaEnoto: 3450, ddv: 22 },
        { naziv: 'IoT senzor paket', enota: 'kos', kolicina: 10, cenaNaEnoto: 180, ddv: 22 },
        { naziv: 'Implementacija in konfiguracija', enota: 'storitev', kolicina: 1, cenaNaEnoto: 3800, ddv: 22 }
      ]
    }
  };
}

export async function getOfferTemplateSettings() {
  const stats = await statSafe(SETTINGS_PATH);
  if (cachedSettings && stats && cachedMtime && cachedMtime >= stats.mtimeMs) {
    return cachedSettings;
  }

  let settings = buildDefaultSettings();
  if (stats) {
    try {
      const raw = await fs.promises.readFile(SETTINGS_PATH, 'utf-8');
      settings = JSON.parse(raw);
    } catch (error) {
      console.warn('[settings] Failed to read offer template settings, using defaults.', error);
    }
  } else {
    await writeOfferTemplateSettings(settings);
  }

  cachedSettings = settings;
  cachedMtime = stats ? stats.mtimeMs : Date.now();
  return settings;
}

export async function writeOfferTemplateSettings(nextSettings) {
  const payload = JSON.stringify(nextSettings, null, 2);
  await fs.promises.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.promises.writeFile(SETTINGS_PATH, payload, 'utf-8');
  cachedSettings = nextSettings;
  cachedMtime = Date.now();
  return nextSettings;
}

export function computePreviewTotals(items = []) {
  return items.reduce(
    (acc, item) => {
      const qty = Number(item.kolicina) || 0;
      const pricePerUnit = Number(item.cenaNaEnoto) || 0;
      const ddv = Number(item.ddv ?? 22);
      const brez = pricePerUnit * qty;
      const znesekZDDV = brez * (1 + ddv / 100);

      acc.items.push({
        naziv: item.naziv,
        enota: item.enota,
        kolicina: qty,
        cenaNaEnoto: pricePerUnit,
        cenaSkupaj: brez,
        ddv,
        znesekZDDV
      });
      acc.vsotaBrezDDV += brez;
      acc.ddvZnesek += znesekZDDV - brez;
      acc.skupaj += znesekZDDV;
      return acc;
    },
    { items: [], vsotaBrezDDV: 0, ddvZnesek: 0, skupaj: 0 }
  );
}
