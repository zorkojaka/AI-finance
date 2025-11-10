const demoClients = [
  {
    _id: 'cli-001',
    name: 'Ana Novak',
    company: 'Inteligent d.o.o.',
    type: 'podjetje',
    taxNumber: 'SI12345678',
    email: 'ana.novak@inteligent.si',
    phone: '+386 40 123 456',
    address: 'Dunajska cesta 5, Ljubljana',
    status: 'aktivna',
    createdAt: '2024-01-15',
    note: 'Klju─ìna kontaktna oseba za pametni dom.'
  },
  {
    _id: 'cli-002',
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
    _id: 'cli-003',
    name: 'Petra Zupan',
    company: 'Fizi─ìna oseba',
    type: 'oseba',
    taxNumber: '',
    email: 'petra.zupan@gmail.com',
    phone: '+386 30 654 321',
    address: 'Glavna ulica 12, Kranj',
    status: 'aktivna',
    createdAt: '2024-03-10',
    note: 'Servis pametnih sen─ìil.'
  }
];

export class Client {
  static async findById(id) {
    return demoClients.find((client) => client._id === String(id));
  }
}

export function listClients() {
  return demoClients;
}

export function addClient(client) {
  demoClients.push(client);
  return client;
}
