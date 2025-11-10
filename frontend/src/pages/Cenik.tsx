import { useMemo } from 'react';

const features = [
  { name: 'Osnovni paket', price: '29 € / mesec', perks: ['1 uporabnik', 'CRM modul', 'E-mail podpora'] },
  { name: 'Poslovni paket', price: '59 € / mesec', perks: ['5 uporabnikov', 'CRM + Projekti', 'Prioritetna podpora'] },
  { name: 'Enterprise', price: 'Po meri', perks: ['Neomejeno uporabnikov', 'Vsi moduli', 'Namenska ekipa'] },
];

export default function Cenik() {
  const cards = useMemo(() => features, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Cenik</h1>
        <p className="text-slate-500 mt-2">Izberi paket, ki najbolj ustreza tvoji ekipi.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ name, price, perks }) => (
          <section key={name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="mb-4">
              <p className="text-sm uppercase tracking-wide text-slate-500">{name}</p>
              <p className="text-2xl font-bold text-slate-900">{price}</p>
            </header>
            <ul className="space-y-2 text-sm text-slate-600">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {perk}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

