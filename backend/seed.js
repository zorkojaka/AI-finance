import 'dotenv/config';
import { connectMongo } from './db.js';
import Settings from './models/Settings.js';
import Counters from './models/Counters.js';

async function ensureCounter(id, seq) {
  const existing = await Counters.findById(id);
  if (!existing) {
    await Counters.create({ _id: id, seq });
  }
}

async function runSeed() {
  await connectMongo({
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB
  });

  const settings = await Settings.findById('singleton');
  if (!settings) {
    await Settings.create({
      _id: 'singleton',
      company: {},
      pdf: {},
      flags: {}
    });
  }

  await ensureCounter('project', 1300);
  await ensureCounter('offer', 0);
  await ensureCounter('po', 0);
  await ensureCounter('wo', 0);
  await ensureCounter('dn', 0);
  await ensureCounter('invoice', 0);

  console.log('Seed done');
  process.exit(0);
}

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
