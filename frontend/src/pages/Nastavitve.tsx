import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface CompanySettings {
  name: string;
  tagline: string;
  address: string;
  taxId: string;
  registration: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
}

interface PreviewClient {
  ime: string;
  naslov: string;
  davcna: string;
}

interface PreviewItem {
  naziv: string;
  enota: string;
  kolicina: number;
  cenaNaEnoto: number;
  ddv: number;
}

interface PreviewSettings {
  stevilka: string;
  datum: string;
  client: PreviewClient;
  items: PreviewItem[];
}

interface OfferTemplateSettings {
  company: CompanySettings;
  note: string;
  preview: PreviewSettings;
}

const defaultItem = (): PreviewItem => ({
  naziv: '',
  enota: 'kos',
  kolicina: 1,
  cenaNaEnoto: 0,
  ddv: 22
});

const defaultSettings: OfferTemplateSettings = {
  company: {
    name: 'Inteligent d.o.o.',
    tagline: 'Celovite rešitve avtomatizacije in digitalizacije',
    address: 'Tržaška cesta 99, 1000 Ljubljana',
    taxId: 'SI12345678',
    registration: '8765432',
    email: 'info@inteligent.si',
    phone: '+386 40 123 456',
    website: 'www.inteligent.si',
    logoUrl: 'https://dummyimage.com/220x60/2563eb/ffffff&text=INTELIGENT'
  },
  note:
    'Ponudba velja 30 dni od datuma izdaje. Montaža in konfiguracija niso vključene, razen če je drugače navedeno.',
  preview: {
    stevilka: 'P-2025/0012',
    datum: new Date().toISOString().slice(0, 10),
    client: {
      ime: 'Kovinarstvo Novak d.o.o.',
      naslov: 'Podutiška cesta 15, 1000 Ljubljana',
      davcna: 'SI12345678'
    },
    items: [defaultItem()]
  }
};

const Nastavitve = () => {
  const [settings, setSettings] = useState<OfferTemplateSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/settings/offer-template`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Nalaganje nastavitev ni uspelo.');
      }
      setSettings(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateCompany = (field: keyof CompanySettings, value: string) => {
    setSettings((prev) => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };

  const updateClient = (field: keyof PreviewClient, value: string) => {
    setSettings((prev) => ({
      ...prev,
      preview: { ...prev.preview, client: { ...prev.preview.client, [field]: value } }
    }));
  };

  const updatePreview = (field: keyof PreviewSettings, value: string) => {
    setSettings((prev) => ({ ...prev, preview: { ...prev.preview, [field]: value } }));
  };

  const updateItem = (index: number, field: keyof PreviewItem, value: string | number) => {
    setSettings((prev) => {
      const items = prev.preview.items.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]:
                field === 'naziv' || field === 'enota'
                  ? String(value)
                  : Number(value)
            }
          : item
      );
      return { ...prev, preview: { ...prev.preview, items } };
    });
  };

  const addItem = () => {
    setSettings((prev) => ({
      ...prev,
      preview: { ...prev.preview, items: [...prev.preview.items, defaultItem()] }
    }));
  };

  const removeItem = (index: number) => {
    setSettings((prev) => {
      const items = prev.preview.items.filter((_, idx) => idx !== index);
      return { ...prev, preview: { ...prev.preview, items: items.length ? items : [defaultItem()] } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/settings/offer-template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Shranjevanje nastavitev ni uspelo.');
      }
      setSettings(data);
      setMessage('Nastavitve so shranjene.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setError(null);
    const previewUrl = `${API_URL}/api/settings/offer-template/preview?ts=${Date.now()}`;
    const opened = window.open(previewUrl, '_blank', 'noopener');
    if (!opened) {
      setError('Brskalnik je blokiral odpiranje novega zavihka za PDF predogled.');
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl bg-white p-6 text-center shadow-sm">
        Nalagam nastavitve predloge ...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Nastavitve predloge</h1>
        <p className="mt-2 text-sm text-slate-600">
          Uredi podatke podjetja, privzete vrednosti ter sproži predogled PDF-ja.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Podatki podjetja</h2>
            <p className="text-sm text-slate-500">Ti podatki se prikažejo v glavi in footerju PDF-ja.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Shranjujem...' : 'Shrani nastavitve'}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ['name', 'Naziv podjetja'],
              ['tagline', 'Podnaslov'],
              ['address', 'Naslov'],
              ['taxId', 'ID za DDV'],
              ['registration', 'Matična številka'],
              ['email', 'E-naslov'],
              ['phone', 'Telefon'],
              ['website', 'Spletna stran'],
              ['logoUrl', 'Logo URL']
            ] as Array<[keyof CompanySettings, string]>
          ).map(([field, label]) => (
            <label key={field} className="text-sm font-semibold text-slate-600">
              {label}
              <input
                type="text"
                value={settings.company[field]}
                onChange={(event) => updateCompany(field, event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-slate-800">Privzeta nota</h2>
        <p className="text-sm text-slate-500">Prikaže se pod tabelo, lahko pa jo zamenjaš pri posamezni ponudbi.</p>
        <textarea
          value={settings.note}
          onChange={(event) => setSettings((prev) => ({ ...prev, note: event.target.value }))}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          rows={3}
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Predogledni podatki</h2>
            <p className="text-sm text-slate-500">
              Uporabijo se za generiranje demonstracijskega PDF-ja in kot privzete vrednosti med razvojem dizajna.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="rounded-lg border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue/10"
            >
              Predogled PDF
            </button>
            <button
              type="button"
              onClick={loadSettings}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Osveži
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">
            Številka ponudbe
            <input
              type="text"
              value={settings.preview.stevilka}
              onChange={(event) => updatePreview('stevilka', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Datum
            <input
              type="date"
              value={settings.preview.datum}
              onChange={(event) => updatePreview('datum', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-600">
            Stranka (naziv)
            <input
              type="text"
              value={settings.preview.client.ime}
              onChange={(event) => updateClient('ime', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            />
          </label>
          <label className="text-sm font-semibold text-slate-600 md:col-span-2">
            Stranka (naslov)
            <input
              type="text"
              value={settings.preview.client.naslov}
              onChange={(event) => updateClient('naslov', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Stranka (DDV)
            <input
              type="text"
              value={settings.preview.client.davcna}
              onChange={(event) => updateClient('davcna', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            />
          </label>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-700">Artikli</h3>
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dodaj artikel
            </button>
          </div>
          <div className="space-y-3">
            {settings.preview.items.map((item, index) => (
              <div
                key={`${item.naziv}-${index}`}
                className="grid gap-3 rounded-xl border border-slate-200 p-3 shadow-sm md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Naziv
                    <input
                      type="text"
                      value={item.naziv}
                      onChange={(event) => updateItem(index, 'naziv', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Enota
                    <input
                      type="text"
                      value={item.enota}
                      onChange={(event) => updateItem(index, 'enota', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Količina
                    <input
                      type="number"
                      min={0}
                      value={item.kolicina}
                      onChange={(event) => updateItem(index, 'kolicina', Number(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Cena/EN
                    <input
                      type="number"
                      min={0}
                      value={item.cenaNaEnoto}
                      onChange={(event) => updateItem(index, 'cenaNaEnoto', Number(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </label>
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    DDV %
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={item.ddv}
                      onChange={(event) => updateItem(index, 'ddv', Number(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </label>
                </div>
                <div className="flex items-end justify-end md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-red-500"
                    disabled={settings.preview.items.length === 1}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nastavitve;
