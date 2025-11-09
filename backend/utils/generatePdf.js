import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { getOfferTemplateSettings } from './templateSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const currencyFormatter = new Intl.NumberFormat('sl-SI', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2
});

const formatCurrency = (value) => currencyFormatter.format(Number(value ?? 0));

export async function generateOfferPdf(data, outputPath) {
  const templatePath = path.join(__dirname, '../templates/ponudba-template.html');
  const cssPath = path.join(__dirname, '../templates/style.css');
  const templateSettings = await getOfferTemplateSettings();

  let html = fs.readFileSync(templatePath, 'utf-8');
  const css = fs.readFileSync(cssPath, 'utf-8');

  const artikliHtml = data.artikli
    .map(
      (art) => `
    <tr>
      <td>${art.naziv}</td>
      <td>${art.kolicina} ${art.enota ?? ''}</td>
      <td>${formatCurrency(art.cenaNaEnoto)}</td>
      <td>${art.ddv}%</td>
      <td>${formatCurrency(art.znesekZDDV)}</td>
    </tr>`
    )
    .join('');

  html = html
    .replaceAll('{{stevilka}}', data.stevilka ?? '')
    .replaceAll('{{datum}}', data.datum ?? '')
    .replaceAll('{{stranka.ime}}', data.stranka?.ime ?? '')
    .replaceAll('{{stranka.naslov}}', data.stranka?.naslov ?? '')
    .replaceAll('{{stranka.davcna}}', data.stranka?.davcna ?? '')
    .replaceAll('{{artikli}}', artikliHtml)
    .replaceAll('{{vsotaBrezDDV}}', formatCurrency(data.vsotaBrezDDV))
    .replaceAll('{{ddvZnesek}}', formatCurrency(data.ddvZnesek))
    .replaceAll('{{skupaj}}', formatCurrency(data.skupaj))
    .replaceAll('{{company.logoUrl}}', templateSettings.company?.logoUrl ?? '')
    .replaceAll('{{company.name}}', templateSettings.company?.name ?? '')
    .replaceAll('{{company.tagline}}', templateSettings.company?.tagline ?? '')
    .replaceAll('{{company.address}}', templateSettings.company?.address ?? '')
    .replaceAll('{{company.taxId}}', templateSettings.company?.taxId ?? '')
    .replaceAll('{{company.registration}}', templateSettings.company?.registration ?? '')
    .replaceAll('{{company.email}}', templateSettings.company?.email ?? '')
    .replaceAll('{{company.phone}}', templateSettings.company?.phone ?? '')
    .replaceAll('{{company.website}}', templateSettings.company?.website ?? '')
    .replaceAll('{{noteText}}', data.note ?? templateSettings.note ?? '');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(`<style>${css}</style>${html}`, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ path: outputPath, format: 'A4', printBackground: true });

  await browser.close();
  return pdfBuffer;
}

export default generateOfferPdf;
