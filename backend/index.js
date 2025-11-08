const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let clients = [
  {
    id: '1',
    ime: 'Janez Novak',
    tip: 'fizična',
    email: 'janez.novak@email.si',
    telefon: '041 111 222',
    naslov: 'Ulica 1, 1000 Ljubljana',
    status: 'aktivno',
    datumVnosa: new Date().toISOString(),
  },
  {
    id: '2',
    ime: 'Podjetje d.o.o.',
    tip: 'podjetje',
    podjetje: 'Podjetje d.o.o.',
    davcna: 'SI12345678',
    email: 'info@podjetje.si',
    telefon: '059 123 456',
    naslov: 'Industrijska 23, 2000 Maribor',
    status: 'čakanje',
    datumVnosa: new Date().toISOString(),
  },
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const c = req.body;
  c.id = Date.now().toString();
  clients.unshift(c);
  res.status(201).json(c);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
