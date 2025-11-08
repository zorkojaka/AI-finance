const Dashboard = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Inteligent Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Centraliziran pregled nad videonadzorom, alarmnimi sistemi, pametnim domom in CRM moduli.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          {
            title: 'Aktivni servisi',
            value: '12',
            description: 'Servisne intervencije v zadnjih 30 dneh'
          },
          {
            title: 'Montaže v teku',
            value: '5',
            description: 'Projektne montaže pametnih naprav'
          },
          {
            title: 'Nove ponudbe',
            value: '8',
            description: 'V pripravi za ključne stranke'
          }
        ].map((card) => (
          <div key={card.title} className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-slate-500">{card.title}</h2>
            <p className="mt-3 text-2xl font-semibold text-brand-blue">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Vizija</h2>
        <p className="mt-3 text-sm text-slate-600">
          Sistem bo sčasoma omogočal avtomatizacijo procesov, integracijo z AI agenti ter poglobljene analize
          učinkovitosti vseh storitev Inteligent d.o.o.
        </p>
      </div>
    </section>
  );
};

export default Dashboard;
