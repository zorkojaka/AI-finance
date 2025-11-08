import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import clientsRouter from './routes/clients.js';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use('/api/clients', clientsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Neznan endpoint' });
});

app.use((err, req, res, next) => {
  console.error('Napaka v strežniku:', err);
  res.status(500).json({ error: 'Prišlo je do nepričakovane napake.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Inteligent Dashboard API posluša na portu ${PORT}`);
});
