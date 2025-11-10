import { Router } from 'express';

const router = Router();

// In-memory list of clients for demo purposes
const clients = [
  {
    id: 'cli-001',
    name: 'Ana Novak',
    company: 'Inteligent d.o.o.',
    type: 'podjetje',
    taxNumber: 'SI12345678',
    email: 'ana.novak@inteligent.si',
    phone: '+386 40 123 456',
    address: 'Dunajska cesta 5, Ljubljana',
    status: 'aktivna',
    createdAt: '2024-01-15',
    note: 'Ključna kontaktna oseba za pametni dom.'
  },
  {
    id: 'cli-002',
    name: 'Marko Kranjc',
    company: 'Avtodom Kranjc s.p.',
    type: 'podjetje',
    taxNumber: 'SI87654321',
    email: 'marko@avtodom.si',
    phone: '+386 41 555 222',
    address: 'Industrijska cesta 8, Maribor',
    status: 'v obdelavi',
    createdAt: '2024-02-02',
    note: 'Zanimanje za videonadzor in alarm.'
  },
  {
    id: 'cli-003',
    name: 'Petra Zupan',
    company: 'Fizična oseba',
    type: 'oseba',
    taxNumber: '',
    email: 'petra.zupan@gmail.com',
    phone: '+386 30 654 321',
    address: 'Glavna ulica 12, Kranj',
    status: 'aktivna',
    createdAt: '2024-03-10',
    note: 'Servis pametnih senčil.'
  }
];

router.get('/', (req, res) => {
  res.json({ clients });
});

router.post('/', (req, res) => {
  const {
    name,
    company,
    type,
    taxNumber = '',
    email,
    phone,
    address,
    status,
    createdAt,
    note
  } = req.body ?? {};

  if (!name || !type || !email) {
    return res.status(400).json({
      error: 'Polja "name", "type" in "email" so obvezna.'
    });
  }

  if (type === 'podjetje' && !taxNumber) {
    return res.status(400).json({
      error: 'Za tip "podjetje" je davčna številka obvezna.'
    });
  }

  const newClient = {
    id: `cli-${String(clients.length + 1).padStart(3, '0')}`,
    name,
    company: company ?? '',
    type,
    taxNumber,
    email,
    phone: phone ?? '',
    address: address ?? '',
    status: status ?? 'aktivna',
    createdAt: createdAt ?? new Date().toISOString().slice(0, 10),
    note: note ?? ''
  };

  clients.push(newClient);
  res.status(201).json({ client: newClient });
});

export default router;
