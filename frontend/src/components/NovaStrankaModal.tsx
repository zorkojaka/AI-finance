import { useState } from 'react';

interface NovaStrankaModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (client: ClientResponse) => void;
}

interface ClientPayload {
  name: string;
  company?: string;
  email?: string;
  addressStreet?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  taxNumber?: string;
  isCompany?: boolean;
}

interface ClientResponse extends ClientPayload {
  _id: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const initialForm: ClientPayload = {
  name: '',
  company: '',
  email: '',
  addressStreet: '',
  postalCode: '',
  city: '',
  phone: '',
  taxNumber: '',
  isCompany: false
};

const NovaStrankaModal = ({ open, onClose, onSaved }: NovaStrankaModalProps) => {
  const [form, setForm] = useState<ClientPayload>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleChange = (field: keyof ClientPayload, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

const canSubmit =
  form.name.trim().length > 0 &&
  (form.email?.trim().length ?? 0) > 0 &&
  (!form.isCompany || (form.taxNumber?.trim().length ?? 0) > 0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError('Ime in e-mail sta obvezna.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        company: form.isCompany ? form.company?.trim() : undefined,
        email: form.email?.trim(),
        address: [form.addressStreet, [form.postalCode, form.city].filter(Boolean).join(' ')]
          .map((value) => value?.trim())
          .filter((value) => value !== undefined && value !== '')
          .join(', ') || undefined,
        phone: form.phone?.trim(),
        taxNumber: form.isCompany ? form.taxNumber?.trim() : undefined,
        isCompany: form.isCompany ?? false,
        type: form.isCompany ? 'podjetje' : 'oseba'
      };
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Shranjevanje stranke ni uspelo.');
      }
      onSaved(data.client ?? data);
      setForm(initialForm);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Dodaj novo stranko</h2>
            <p className="text-sm text-slate-500">Novo stranko bomo shranili v CRM in jo izbrali v obrazcu.</p>
            <p className="text-xs text-amber-600">
              Namig: za manjkajoč podatek lahko začasno vpišeš znak <span className="font-semibold">!</span>
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Zapri modal"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold text-slate-600">
            Ime / naziv
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
              required
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={form.isCompany}
              onChange={(event) => handleChange('isCompany', event.target.checked)}
              className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
            />
            Pravna oseba
          </label>

          {form.isCompany && (
            <>
              <label className="text-sm font-semibold text-slate-600">
                Podjetje
                <input
                  type="text"
                  value={form.company}
                  onChange={(event) => handleChange('company', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Davčna številka
                <input
                  type="text"
                  value={form.taxNumber}
                  onChange={(event) => handleChange('taxNumber', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                />
              </label>
            </>
          )}

          <label className="text-sm font-semibold text-slate-600">
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
              required
            />
          </label>

          <label className="text-sm font-semibold text-slate-600">
            Telefon
            <input
              type="text"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-600">
              Ulica / hišna št.
              <input
                type="text"
                value={form.addressStreet}
                onChange={(event) => handleChange('addressStreet', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                placeholder="npr. Rjava cesta 26a"
              />
            </label>
            <label className="text-sm font-semibold text-slate-600">
              Poštna številka
              <input
                type="text"
                value={form.postalCode}
                onChange={(event) => handleChange('postalCode', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                placeholder="npr. 1000"
              />
            </label>
            <label className="text-sm font-semibold text-slate-600">
              Mesto
              <input
                type="text"
                value={form.city}
                onChange={(event) => handleChange('city', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                placeholder="npr. Ljubljana"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Shranjujem...' : 'Shrani stranko'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaStrankaModal;
