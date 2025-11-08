import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import type { Client, ClientPayload, ClientType } from '../types/client';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/clients';

const defaultForm: ClientPayload = {
  name: '',
  company: '',
  type: 'oseba',
  taxNumber: '',
  email: '',
  phone: '',
  address: '',
  status: 'aktivna',
  createdAt: new Date().toISOString().slice(0, 10),
  note: ''
};

const CRM = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ClientPayload>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Napaka pri pridobivanju strank.');
        }
        const data = await response.json();
        setClients(data.clients ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setFormError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleChange = (field: keyof ClientPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim()) {
      return 'Ime in e-pošta sta obvezna.';
    }
    if (form.type === 'podjetje' && !form.taxNumber.trim()) {
      return 'Za podjetja je obvezna davčna številka.';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Napaka pri shranjevanju stranke.');
      }

      const payload = await response.json();
      if (payload.client) {
        setClients((prev) => [payload.client as Client, ...prev]);
        handleCloseModal();
      }
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const total = clients.length;
    const companies = clients.filter((client) => client.type === 'podjetje').length;
    const individuals = clients.filter((client) => client.type === 'oseba').length;

    return [
      { label: 'Skupno strank', value: total },
      { label: 'Podjetja', value: companies },
      { label: 'Fizične osebe', value: individuals }
    ];
  }, [clients]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upravljanje s strankami, projektni pregledi in zgodovina sodelovanj.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-accent/90"
        >
          <PlusCircleIcon className="h-5 w-5" /> Dodaj stranko
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className="mt-3 text-2xl font-semibold text-brand-blue">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Ime</th>
                <th className="px-4 py-3">Podjetje</th>
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3">E-pošta</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                    Nalagam podatke ...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                    Trenutno ni shranjenih strank.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-brand-blue">{client.name}</td>
                    <td className="px-4 py-3">{client.company || '—'}</td>
                    <td className="px-4 py-3 capitalize">{client.type}</td>
                    <td className="px-4 py-3">{client.email}</td>
                    <td className="px-4 py-3">{client.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-accent/10 px-2 py-1 text-xs font-semibold text-brand-accent">
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{client.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-brand-blue">
                    Dodaj novo stranko
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-slate-500">
                    Izpolni podatke stranke. Davčna številka je obvezna za podjetja.
                  </p>

                  {formError && (
                    <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Ime in priimek
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(event) => handleChange('name', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Podjetje
                        </label>
                        <input
                          type="text"
                          value={form.company}
                          onChange={(event) => handleChange('company', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Tip
                        </label>
                        <select
                          value={form.type}
                          onChange={(event) => handleChange('type', event.target.value as ClientType)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        >
                          <option value="oseba">Fizična oseba</option>
                          <option value="podjetje">Podjetje</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Davčna številka
                        </label>
                        <input
                          type="text"
                          value={form.taxNumber}
                          onChange={(event) => handleChange('taxNumber', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                          placeholder={form.type === 'podjetje' ? 'Obvezno za podjetja' : 'Opcijsko'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          E-pošta
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(event) => handleChange('email', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(event) => handleChange('phone', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Naslov
                        </label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(event) => handleChange('address', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </label>
                        <input
                          type="text"
                          value={form.status}
                          onChange={(event) => handleChange('status', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Datum sodelovanja
                        </label>
                        <input
                          type="date"
                          value={form.createdAt}
                          onChange={(event) => handleChange('createdAt', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Opombe
                        </label>
                        <textarea
                          rows={3}
                          value={form.note}
                          onChange={(event) => handleChange('note', event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Prekliči
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {submitting ? 'Shranjujem ...' : 'Shrani stranko'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </section>
  );
};

export default CRM;
