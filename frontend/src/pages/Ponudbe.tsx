import { useEffect, useMemo, useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface Client {
  _id: string;
  name: string;
  company?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
}

interface PricelistItem {
  _id: string;
  naziv: string;
  enota: string;
  prodajnaCena: number;
  davcnaStopnja: number;
}

interface OfferLine {
  artikelId: string;
  kolicina: number;
}

interface OfferResultItem {
  naziv: string;
  enota: string;
  kolicina: number;
  cenaNaEnoto: number;
  cenaSkupaj: number;
  ddv: number;
  znesekZDDV: number;
}

interface OfferResponse {
  stevilka: string;
  stranka: Client;
  artikli: OfferResultItem[];
  vsotaZDDV: string;
  skupnoSPopustom: string;
  pdfUrl?: string | null;
}

interface RecentOffer {
  id: string;
  stevilka: string;
  verzija: number;
  datum: string;
  stranka: {
    id: string;
    name: string;
    company?: string;
    email?: string;
  } | null;
  pdfUrl?: string | null;
}

interface OfferDetail {
  id: string;
  stevilka: string;
  verzija: number;
  stranka: Client;
  artikli: Array<OfferResultItem & { artikelId: string }>;
  popust: number;
}

const emptyLine: OfferLine = { artikelId: '', kolicina: 1 };

const Ponudbe = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [pricelist, setPricelist] = useState<PricelistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [strankaId, setStrankaId] = useState('');
  const [popust, setPopust] = useState(0);
  const [lines, setLines] = useState<OfferLine[]>([{ ...emptyLine }]);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OfferResponse | null>(null);
  const [recentOffers, setRecentOffers] = useState<RecentOffer[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<{ id: string; stevilka: string } | null>(null);
  const [menuOfferId, setMenuOfferId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/api/clients`).then((r) => r.json()),
          fetch(`${API_URL}/api/pricelist`).then((r) => r.json())
        ]);
        setClients(clientsRes.clients ?? []);
        setPricelist(Array.isArray(itemsRes) ? itemsRes : itemsRes.value ?? []);
      } catch (err) {
        setError('Napaka pri nalaganju podatkov.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchOffers = async () => {
    try {
      setRecentLoading(true);
      const response = await fetch(`${API_URL}/api/ponudbe?limit=10`);
      const data = await response.json();
      setRecentOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Napaka pri nalaganju ponudb:', err);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [result]);

  const addLine = () => {
    setLines((prev) => [...prev, { artikelId: '', kolicina: 1 }]);
  };

  const updateLine = (index: number, field: keyof OfferLine, value: string | number) => {
    setLines((prev) =>
      prev.map((line, idx) =>
        idx === index ? { ...line, [field]: field === 'kolicina' ? Number(value) : String(value) } : line
      )
    );
  };

  const removeLine = (index: number) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const currentLines = useMemo(() => {
    return lines
      .map((line) => {
        const item = pricelist.find((p) => p._id === line.artikelId);
        if (!item || !line.kolicina) return null;
        const quantity = Number(line.kolicina);
        const price = item.prodajnaCena * quantity;
        const total = price * (1 + item.davcnaStopnja / 100);
        return { ...line, item, price, total };
      })
      .filter(Boolean) as Array<{
      artikelId: string;
      kolicina: number;
      item: PricelistItem;
      price: number;
      total: number;
    }>;
  }, [lines, pricelist]);

  const totals = useMemo(() => {
    const vsota = currentLines.reduce((sum, line) => sum + line.total, 0);
    const sPopustom = vsota * (1 - popust);
    return { vsota, sPopustom };
  }, [currentLines, popust]);

  const sanitizedLines = () =>
    lines
      .filter((line) => line.artikelId && Number(line.kolicina) > 0)
      .map((line) => ({
        artikelId: line.artikelId,
        kolicina: Number(line.kolicina)
      }));

  const resetForm = () => {
    setStrankaId('');
    setPopust(0);
    setLines([{ ...emptyLine }]);
    setEditingOffer(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payloadLines = sanitizedLines();
    if (!strankaId || payloadLines.length === 0) {
      setError('Izberi stranko in vsaj en artikel.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const payload = { strankaId, artikli: payloadLines, popust };
      const endpoint = editingOffer
        ? `${API_URL}/api/ponudbe/${editingOffer.id}`
        : `${API_URL}/api/ponudbe`;
      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? 'Shranjevanje ponudbe ni uspelo.');
      }

      if (editingOffer) {
        setInfo('Ponudba je posodobljena.');
        setResult(null);
        await fetchOffers();
      } else {
        setResult(data as OfferResponse);
      }
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOffer = async (offerId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/ponudbe/${offerId}`);
      const data: OfferDetail = await response.json();
      if (!response.ok) {
        throw new Error((data as unknown as { error?: string }).error ?? 'Ponudbe ni mogoče odpreti.');
      }

      setEditingOffer({ id: data.id, stevilka: data.stevilka });
      setStrankaId(data.stranka?._id ?? '');
      setPopust(Number(data.popust ?? 0));
      setLines(
        data.artikli.length
          ? data.artikli.map((item) => ({
              artikelId: item.artikelId,
              kolicina: item.kolicina
            }))
          : [{ ...emptyLine }]
      );
      setMenuOfferId(null);
      setInfo(`Urejanje ponudbe ${data.stevilka}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCreateVersion = async (offerId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/ponudbe/${offerId}/verzija`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? 'Nove verzije ni bilo mogoče ustvariti.');
      }
      setInfo('Nova verzija ponudbe je ustvarjena.');
      setMenuOfferId(null);
      await fetchOffers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteOffer = async (offerId: string, label: string) => {
    if (!window.confirm(`Želite odstraniti ponudbo ${label}?`)) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/ponudbe/${offerId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? 'Ponudbe ni bilo mogoče deaktivirati.');
      }
      setInfo('Ponudba je zaznamovana kot neaktivna.');
      setMenuOfferId(null);
      await fetchOffers();
      if (editingOffer?.id === offerId) {
        resetForm();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDownloadPdf = (offerId: string) => {
    window.open(`${API_URL}/api/ponudbe/${offerId}/pdf`, '_blank', 'noopener');
  };

  if (loading) {
    return (
      <section className="rounded-xl bg-white p-6 text-center shadow-sm">
        Nalagam podatke za ponudbe ...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Ponudbe</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sestavi novo ponudbo ali uredi obstoječe verzije. Zadnji stolpec ponuja hitre akcije.
        </p>
      </header>

      {(error || info) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
        >
          {error ?? info}
        </div>
      )}

      <form className="space-y-6 rounded-2xl bg-white p-6 shadow" onSubmit={handleSubmit}>
        {editingOffer && (
          <div className="flex flex-wrap items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>Urejate ponudbo {editingOffer.stevilka}</p>
            <div className="space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                Prekliči
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">
            Stranka
            <select
              required
              value={strankaId}
              onChange={(event) => setStrankaId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-blue focus:outline-none"
            >
              <option value="">Izberi stranko</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-600">
            Popust (% kot decimal)
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={popust}
              onChange={(event) => setPopust(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-blue focus:outline-none"
            />
          </label>
        </div>

        <div className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-700">Artikli</h2>
              <p className="text-sm text-slate-500">
                Izberi artikle iz cenika in določi količine za ponudbo.
              </p>
            </div>
            <button
              type="button"
              onClick={addLine}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dodaj artikel
            </button>
          </header>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div
                key={`${index}-${line.artikelId}`}
                className="grid gap-3 rounded-xl border border-slate-200 p-3 shadow-sm md:grid-cols-12"
              >
                <div className="md:col-span-8">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Artikel
                    <select
                      value={line.artikelId}
                      onChange={(event) => updateLine(index, 'artikelId', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                    >
                      <option value="">Izberi</option>
                      {pricelist.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.naziv} · {item.prodajnaCena.toFixed(2)} €
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Količina
                    <input
                      type="number"
                      min={1}
                      value={line.kolicina}
                      onChange={(event) => updateLine(index, 'kolicina', Number(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </label>
                </div>
                <div className="flex items-end justify-end md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-red-500"
                    disabled={lines.length === 1}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px 4 py-3 text-sm">
          <div>
            <p className="text-slate-500">Vsota z DDV</p>
            <p className="text-2xl font-semibold text-slate-900">{totals.vsota.toFixed(2)} €</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Skupaj s popustom</p>
            <p className="text-2xl font-semibold text-brand-blue">
              {totals.sPopustom.toFixed(2)} €
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Shranjujem...' : editingOffer ? 'Posodobi ponudbo' : 'Shrani ponudbo'}
            </button>
            {editingOffer && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Prekliči urejanje
              </button>
            )}
          </div>
        </div>
      </form>

      {result && (
        <div className="rounded-2xl border border-brand-blue/20 bg-white p-6 shadow">
          <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Ponudba</p>
              <h2 className="text-2xl font-bold text-brand-blue">{result.stevilka}</h2>
            </div>
            <div className="text-sm text-slate-600">
              {result.stranka.name} · {result.stranka.email}
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Artikel</th>
                  <th className="px-3 py-2">Količina</th>
                  <th className="px-3 py-2">Cena / kos</th>
                  <th className="px-3 py-2">DDV</th>
                  <th className="px-3 py-2 text-right">Skupaj z DDV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.artikli.map((item, idx) => (
                  <tr key={`${item.naziv}-${idx}`}>
                    <td className="px-3 py-2">{item.naziv}</td>
                    <td className="px-3 py-2">
                      {item.kolicina} {item.enota}
                    </td>
                    <td className="px-3 py-2">{item.cenaNaEnoto.toFixed(2)} €</td>
                    <td className="px-3 py-2">{item.ddv}%</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {item.znesekZDDV.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-right">
            <p className="text-sm text-slate-500">Vsota z DDV: {result.vsotaZDDV} €</p>
            <p className="text-lg font-bold text-brand-blue">
              Skupno (s popustom): {result.skupnoSPopustom} €
            </p>
            {result.pdfUrl && (
              <a
                href={`${API_URL}${result.pdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center rounded-lg border border-brand-blue px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                Izvozi PDF
              </a>
            )}
          </div>
        </div>
      )}

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Zadnjih 10 ponudb</h2>
            <p className="text-sm text-slate-500">
              Najnovejši dokumenti, pripravljeni za akcije in prenos.
            </p>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Številka</th>
                <th className="px-3 py-2">Stranka</th>
                <th className="px-3 py-2">Datum</th>
                <th className="px-3 py-2 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    Nalagam zadnje ponudbe ...
                  </td>
                </tr>
              ) : recentOffers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    Ni shranjenih ponudb.
                  </td>
                </tr>
              ) : (
                recentOffers.map((offer) => (
                  <tr key={offer.id} className="relative">
                    <td className="px-3 py-2 font-semibold">
                      {offer.stevilka}
                      <span className="ml-1 text-xs text-slate-400">(v{offer.verzija})</span>
                    </td>
                    <td className="px-3 py-2">
                      {offer.stranka?.name ?? '–'}
                      {offer.stranka?.company ? ` (${offer.stranka.company})` : ''}
                    </td>
                    <td className="px-3 py-2">
                      {offer.datum ? new Date(offer.datum).toLocaleDateString('sl-SI') : '–'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setMenuOfferId((prev) => (prev === offer.id ? null : offer.id))}
                          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                        {menuOfferId === offer.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50"
                              onClick={() => handleEditOffer(offer.id)}
                            >
                              ✏️ Uredi
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50"
                              onClick={() => handleCreateVersion(offer.id)}
                            >
                              🔁 Nova verzija
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteOffer(offer.id, offer.stevilka)}
                            >
                              🗑️ Zbriši
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50"
                              onClick={() => handleDownloadPdf(offer.id)}
                            >
                              📄 Prenesi PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default Ponudbe;
