import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import generateOfferPdf from '../utils/generatePdf.js';
import { computePreviewTotals, getOfferTemplateSettings } from '../utils/templateSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../output/preview');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'ponudba-preview.pdf');

async function buildSampleData() {
  const settings = await getOfferTemplateSettings();
  const totals = computePreviewTotals(settings.preview?.items ?? []);

  return {
    stevilka: settings.preview?.stevilka ?? 'P-2025/0012',
    datum: settings.preview?.datum
      ? new Date(settings.preview.datum).toLocaleDateString('sl-SI')
      : new Date().toLocaleDateString('sl-SI'),
    stranka: settings.preview?.client ?? {
      ime: 'Kovinarstvo Novak d.o.o.',
      naslov: 'Podutiška cesta 15, 1000 Ljubljana',
      davcna: 'SI12345678'
    },
    artikli: totals.items,
    vsotaBrezDDV: totals.vsotaBrezDDV,
    ddvZnesek: totals.ddvZnesek,
    skupaj: totals.skupaj,
    note: settings.note
  };
}

async function generatePreview() {
  const data = await buildSampleData();
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  await generateOfferPdf(data, OUTPUT_PATH);
  console.log(`[preview] PDF posodobljen -> ${OUTPUT_PATH}`);
}

function watchAndRebuild() {
  let debounce;
  const targets = [
    path.resolve(__dirname, '../templates/ponudba-template.html'),
    path.resolve(__dirname, '../templates/style.css'),
    path.resolve(__dirname, '../config/offerTemplateSettings.json')
  ];

  const schedule = (reason) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log(`[preview] Sprememba zaznana v ${reason}, gradim ponovno...`);
      generatePreview().catch((err) => console.error('[preview] Napaka:', err));
    }, 150);
  };

  targets.forEach((target) => {
    fs.watch(target, { persistent: true }, (eventType) => {
      if (eventType === 'change') {
        schedule(path.basename(target));
      }
    });
  });

  console.log('[preview] Spremljam spremembe HTML/CSS/Settings (Ctrl+C za izhod)...');
}

const watchMode = process.argv.includes('--watch');

generatePreview()
  .then(() => {
    if (watchMode) {
      watchAndRebuild();
    }
  })
  .catch((err) => {
    console.error('[preview] Generiranje ni uspelo:', err);
    process.exit(1);
  });
