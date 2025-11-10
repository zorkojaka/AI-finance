import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import clientsRouter from './routes/clients.js';
import pricelistRouter from './routes/pricelist.js';
import ponudbeRouter from './routes/ponudbe.js';
import projektiRouter from './routes/projekti.js';
import settingsRouter from './routes/settings.js';
import { connectMongo, ping, mongoose } from './db.js';
import { seedClients } from './seed/clients.js';

const app = express();
const PORT = process.env.PORT || 3000;

const readyStateLabel = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Inteligent Dashboard API teče.'
  });
});

app.get('/health/db', async (_req, res) => {
  try {
    const pingMs = await ping();
    const state = readyStateLabel[mongoose.connection.readyState] ?? 'unknown';
    res.json({ ok: true, state, ping_ms: pingMs });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'unknown' });
  }
});

app.use('/api/clients', clientsRouter);
app.use('/api/pricelist', pricelistRouter);
app.use('/api/ponudbe', ponudbeRouter);
app.use('/api/projekti', projektiRouter);
app.use('/api/settings', settingsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Neznan endpoint' });
});

app.use((err, req, res, next) => {
  console.error('Napaka v strežniku:', err);
  res.status(500).json({ error: 'Prišlo je do nepričakovane napake.' });
});

const startServer = async () => {
  await connectMongo({ uri: process.env.MONGO_URI, dbName: process.env.MONGO_DB });
  await seedClients();

  const port = process.env.PORT || PORT;
  app.listen(port, () => {
    console.log(`✅ Inteligent Dashboard API posluša na portu ${port}`);
  });
};

startServer().catch((error) => {
  console.error('Critical startup error:', error);
  process.exit(1);
});
