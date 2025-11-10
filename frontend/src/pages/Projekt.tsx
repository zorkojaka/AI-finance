import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NovaStrankaModal from '../components/NovaStrankaModal';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const categoryOptions = [
  { value: 'alarm', label: 'Alarmni sistem' },
  { value: 'videonadzor', label: 'Video nadzor' },
  { value: 'pametni-dom', label: 'Pametni dom' },
  { value: 'servis', label: 'Servis' },
  { value: 'montaza', label: 'Montaža' },
  { value: 'programiranje', label: 'Programiranje' }
];

const statusOptions = ['v pripravi', 'potrjeno', 'v izvedbi', 'zaključeno', 'na čakanju'];

interface Client {
  _id: string;
  name: string;
  company?: string;
}

interface ProjektPayload {
  naziv: string;
  strankaId?: string;
  lokacija?: string;
  kategorije?: string[];
  zahteve?: string;
  status?: string;
}

const ProjektPage = () => {
  const { projektId } = useParams();
  const isNew = !projektId || projektId === 'novo';
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<ProjektPayload>({
    naziv: '',
    strankaId: '',
    lokacija: '',
    kategorije: [],
    zahteve: '',
    status: 'v pripravi'
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch(`${API_URL}/api/clients`);
        const data = await response.json();
        setClients(data.clients ?? []);
      } catch {
        // ignore
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    const loadProjekt = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/projekti/${projektId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? 'Projekt ni bil najden.');
        }
        setForm({
          naziv: data.naziv ?? '',
          strankaId: data.strankaId?._id ?? '',
          lokacija: data.lokacija ?? '',
          kategorije: Array.isArray(data.kategorije) ? data.kategorije : [],
          zahteve: data.zahteve ?? '',
          status: data.status ?? 'v pripravi'
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadProjekt();
  }, [isNew, projektId]);

  const toggleCategory = (value: string) => {
    setForm((prev) => {
      const exists = prev.kategorije?.includes(value);
      const kategorije = exists
        ? prev.kategorije?.filter((cat) => cat !== value)
        : [...(prev.kategorije ?? []), value];
      return { ...prev, kategorije };
    });
  };

  const canSubmit = useMemo(() => form.naziv.trim().length > 0, [form.naziv]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError('Naziv projekta je obvezen.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload: ProjektPayload = {
        ...form,
        kategorije: form.kategorije ?? []
      };
      const endpoint = isNew
        ? `${API_URL}/api/projekti`
        : `${API_URL}/api/projekti/${projektId}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Shranjevanje projekta ni uspelo.');
      }
      setMessage('Projekt je shranjen.');
      if (isNew && data._id) {
        navigate(`/projekti/${data._id}`, { replace: true });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl bg-white p-6 text-center shadow-sm">
        Nalagam projekt ...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">
          <button className="text-brand-blue" onClick={() => navigate(-1)}>
            ← Nazaj na projekte
          </button>
        </p>
        <h1 className="text-3xl font-bold">{isNew ? 'Nov projekt' : form.naziv || 'Projekt'}</h1>
        <p className="text-sm text-slate-600">Osnovni podatki projekta in povezava na CRM.</p>
      </header>

      {(error || message) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
        >
          {error ?? message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow">
        <label className="text-sm font-semibold text-slate-600">
          Naziv projekta
          <input
            type="text"
            value={form.naziv}
            onChange={(event) => setForm((prev) => ({ ...prev, naziv: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            required
          />
        </label>

        <label className="text-sm font-semibold text-slate-600">
          Stranka
            <div className="mt-1 flex gap-3">
              <select
                value={form.strankaId ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, strankaId: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
              >
                <option value="">Izberi stranko</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="rounded-lg border border-dashed border-brand-blue px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue/10"
                onClick={() => setClientModalOpen(true)}
              >
                + Dodaj novo
              </button>
            </div>
          </label>

        <label className="text-sm font-semibold text-slate-600">
          Lokacija objekta
          <input
            type="text"
            value={form.lokacija}
            onChange={(event) => setForm((prev) => ({ ...prev, lokacija: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-slate-600">Kategorije</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {categoryOptions.map((option) => (
              <label
                key={option.value}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.kategorije?.includes(option.value)}
                  onChange={() => toggleCategory(option.value)}
                  className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <label className="text-sm font-semibold text-slate-600">
          Zahteve projekta
          <textarea
            value={form.zahteve}
            onChange={(event) => setForm((prev) => ({ ...prev, zahteve: event.target.value }))}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            placeholder="Opis potreb, posebnosti objekta, rokov..."
          />
        </label>

        <label className="text-sm font-semibold text-slate-600">
          Status
          <select
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/projekti')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Prekliči
          </button>
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Shranjujem...' : 'Shrani projekt'}
          </button>
        </div>
      </form>
      {form.kategorije && form.kategorije.length > 0 && (
        <form className="space-y-4 rounded-2xl border border-brand-blue/20 bg-white p-6 shadow">
          <header>
            <h2 className="text-xl font-semibold text-slate-800">Osnutek vsebine za ponudbo</h2>
            <p className="text-sm text-slate-500">
              Vsaka izbrana kategorija generira svoj razdelek. Tukaj bomo kasneje dodali polja za
              pripravo ponudbe.
            </p>
          </header>
          {form.kategorije.map((category) => {
            const meta = categoryOptions.find((opt) => opt.value === category);
            return (
              <section
                key={category}
                className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
              >
                <h3 className="text-base font-semibold text-slate-800">
                  Kategorija: {meta?.label ?? category}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Vsebina za to kategorijo še ni definirana. Tukaj bomo dodali dodatna polja v
                  naslednjih korakih.
                </p>
              </section>
            );
          })}
        </form>
      )}
      <NovaStrankaModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSaved={(client) => {
          setClients((prev) => {
            const exists = prev.find((c) => c._id === client._id);
            if (exists) return prev;
            return [...prev, client];
          });
          setForm((prev) => ({ ...prev, strankaId: client._id }));
          setClientModalOpen(false);
          setMessage('Stranka dodana v CRM in izbrana v projektu.');
        }}
      />
    </section>
  );
};

export default ProjektPage;
