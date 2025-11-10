const demoItems = [
  {
    _id: 'item-001',
    naziv: 'Pametna krmilna enota',
    enota: 'kos',
    prodajnaCena: 320,
    davcnaStopnja: 22
  },
  {
    _id: 'item-002',
    naziv: 'Namestitev senzorjev',
    enota: 'ura',
    prodajnaCena: 45,
    davcnaStopnja: 22
  },
  {
    _id: 'item-003',
    naziv: 'Vzdr┼╛evalni paket 12m',
    enota: 'paket',
    prodajnaCena: 180,
    davcnaStopnja: 9.5
  }
];

export class PricelistItem {
  static async findById(id) {
    return demoItems.find((item) => item._id === String(id));
  }
}

export function listPricelist() {
  return demoItems;
}

