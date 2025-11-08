import { useState } from 'react';

// CRM stranka tip
export type ClientType = 'fizična' | 'podjetje';
export type ClientStatus = 'aktivno' | 'čakanje' | 'zaprto';

export interface CRMClient {
  id: string;
  ime: string;
  tip: ClientType;
  podjetje?: string;
  davcna?: string;
  email: string;
  telefon: string;
  naslov: string;
  status: ClientStatus;
  opomba?: string;
  datumVnosa: string; // ISO datum
}

const defaultClient: CRMClient = {
  id: '',
  ime: '',
  tip: 'fizična',
  podjetje: '',
  davcna: '',
  email: '',
  telefon: '',
  naslov: '',
  status: 'aktivno',
  opomba: '',
  datumVnosa: '',
};

const demoClients: CRMClient[] = [
  {
    id: '1',
    ime: 'Janez Novak',
    tip: 'fizična',
    email: 'janez.novak@email.si',
    telefon: '041 111 222',
    naslov: 'Ulica 1, 1000 Ljubljana',
    status: 'aktivno',
    datumVnosa: new Date().toISOString(),
  },
  {
    id: '2',
    ime: 'Podjetje d.o.o.',
    tip: 'podjetje',
    podjetje: 'Podjetje d.o.o.',
    davcna: 'SI12345678',
    email: 'info@podjetje.si',
    telefon: '059 123 456',
    naslov: 'Industrijska 23, 2000 Maribor',
    status: 'čakanje',
    datumVnosa: new Date().toISOString(),
  },
];

export default function CRM() {
  const [clients, setClients] = useState<CRMClient[]>(demoClients);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<CRMClient>({ ...defaultClient });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function resetForm() {
    setForm({ ...defaultClient, id: '', datumVnosa: new Date().toISOString() });
    setErrors({});
  }

  function openAdd() {
    resetForm();
    setAdding(true);
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateDavcna(davcna: string) {
    return /^SI[0-9]{8}$/.test(davcna);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function validate(): boolean {
    const err: { [key: string]: string } = {};
    if (!form.ime.trim()) err.ime = 'Obvezno polje';
    if (!form.tip) err.tip = 'Obvezno polje';
    if (form.tip === 'podjetje') {
      if (!form.podjetje || !form.podjetje.trim()) err.podjetje = 'Obvezno polje';
      if (!form.davcna) err.davcna = 'Obvezno polje';
      if (form.davcna && !validateDavcna(form.davcna)) err.davcna = 'Neveljaven format (npr. SI12345678)';
    }
    if (!validateEmail(form.email)) err.email = 'Neveljaven email naslov';
    if (!form.telefon.trim()) err.telefon = 'Obvezno polje';
    if (!form.naslov.trim()) err.naslov = 'Obvezno polje';
    if (!form.status) err.status = 'Izberi status';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setClients(clients => [
      { ...form, id: `${Date.now()}` },
      ...clients,
    ]);
    setAdding(false);
  }

  return (
    <div className="max-w-5xl mx-auto py-6 bg-brand-blue min-h-screen">
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">CRM: Stranke</h1>
        <button
          onClick={openAdd}
          className="text-brand-blue bg-white rounded-lg font-semibold px-5 py-2 shadow hover:bg-brand-grayLight flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M10 5a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 10 5Z"
              clipRule="evenodd"
            />
          </svg>
          Dodaj stranko
        </button>
      </div>

      {/* Tabela strank */}
      <div className="overflow-x-auto rounded-xl shadow bg-brand-white mx-4">
        <table className="min-w-full table-auto border-separate border-spacing-0">
          <thead className="bg-brand-grayLight">
            <tr>
              <th className="p-3 text-left text-xs text-brand-blue uppercase tracking-widest">Ime / Podjetje</th>
              <th className="p-3 text-left text-xs text-brand-blue uppercase tracking-widest">Tip</th>
              <th className="p-3 text-left text-xs text-brand-blue uppercase tracking-widest">Email</th>
              <th className="p-3 text-left text-xs text-brand-blue uppercase tracking-widest">Telefon</th>
              <th className="p-3 text-left text-xs text-brand-blue uppercase tracking-widest">Naslov</th>
              <th className="p-3 text-left text-xs text-brand-blue uppercase tracking-widest">Status</th>
              <th className="p-3 text-left text-xs text-brand-blue uppercase tracking-widest">Datum vnosa</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={c.id} className={`text-sm ${i % 2 === 0 ? 'bg-brand-grayLight/60' : 'bg-brand-white'} transition hover:bg-brand-blue/5`}>
                <td className="p-3 font-semibold">
                  {c.tip === 'podjetje' ? c.podjetje : c.ime}
                  {c.tip === 'podjetje' && <span className="block text-xs text-gray-400">{c.ime}</span>}
                  {c.davcna && <span className="block text-xs text-gray-600">{c.davcna}</span>}
                </td>
                <td className="p-3 capitalize">{c.tip}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.telefon}</td>
                <td className="p-3">{c.naslov}</td>
                <td className="p-3 capitalize">
                  <span
                    className={
                      c.status === 'aktivno'
                        ? 'bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-semibold'
                        : c.status === 'čakanje'
                        ? 'bg-yellow-50 text-yellow-700 rounded-full px-2 py-1 text-xs font-semibold'
                        : 'bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs font-semibold'
                    }
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-xs">{c.datumVnosa.slice(0, 16).replace('T', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal/obrazec */}
      {adding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-xl w-full relative">
            <button
              className="absolute top-4 right-4 text-brand-blue hover:text-brand-blueDark text-3xl"
              onClick={() => setAdding(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-extrabold text-brand-blue mb-4">Dodaj novo stranko</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-brand-blue mb-1">Tip*</label>
                <select
                  name="tip"
                  value={form.tip}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                >
                  <option value="fizična">Fizična oseba</option>
                  <option value="podjetje">Podjetje</option>
                </select>
                {errors.tip && <div className="text-red-600 text-xs mt-1">{errors.tip}</div>}
              </div>

              <div>
                <label className="block font-bold text-brand-blue mb-1">Ime *</label>
                <input
                  name="ime"
                  type="text"
                  value={form.ime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                />
                {errors.ime && <div className="text-red-600 text-xs mt-1">{errors.ime}</div>}
              </div>

              {form.tip === 'podjetje' && (
                <>
                  <div>
                    <label className="block font-bold text-brand-blue mb-1">Naziv podjetja *</label>
                    <input
                      name="podjetje"
                      type="text"
                      value={form.podjetje || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                    />
                    {errors.podjetje && <div className="text-red-600 text-xs mt-1">{errors.podjetje}</div>}
                  </div>

                  <div>
                    <label className="block font-bold text-brand-blue mb-1">Davčna št. *</label>
                    <input
                      name="davcna"
                      type="text"
                      value={form.davcna || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                    />
                    {errors.davcna && <div className="text-red-600 text-xs mt-1">{errors.davcna}</div>}
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-brand-blue mb-1">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                />
                {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
              </div>

              <div>
                <label className="block font-bold text-brand-blue mb-1">Telefon *</label>
                <input
                  name="telefon"
                  type="text"
                  value={form.telefon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                />
                {errors.telefon && <div className="text-red-600 text-xs mt-1">{errors.telefon}</div>}
              </div>

              <div>
                <label className="block font-bold text-brand-blue mb-1">Naslov *</label>
                <input
                  name="naslov"
                  type="text"
                  value={form.naslov}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                />
                {errors.naslov && <div className="text-red-600 text-xs mt-1">{errors.naslov}</div>}
              </div>

              <div>
                <label className="block font-bold text-brand-blue mb-1">Status *</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                >
                  <option value="aktivno">Aktivno</option>
                  <option value="čakanje">Čakanje</option>
                  <option value="zaprto">Zaprto</option>
                </select>
                {errors.status && <div className="text-red-600 text-xs mt-1">{errors.status}</div>}
              </div>

              <div>
                <label className="block font-bold text-brand-blue mb-1">Opomba</label>
                <textarea
                  name="opomba"
                  value={form.opomba || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-blue mb-1">Datum vnosa</label>
                <input
                  name="datumVnosa"
                  type="text"
                  value={form.datumVnosa || new Date().toISOString()}
                  readOnly
                  className="w-full px-3 py-2 border border-brand-gray rounded focus:outline-none focus:border-brand-blue bg-gray-100"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-brand-blue hover:bg-brand-blueDark text-brand-white font-bold py-2 rounded-lg shadow transition"
              >
                Shrani
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
