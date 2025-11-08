import { NavLink } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/crm', label: 'CRM' },
  { to: '/ponudbe', label: 'Ponudbe' },
  { to: '/projekti', label: 'Projekti' },
  { to: '/nalogi', label: 'Nalogi' },
  { to: '/dokumenti', label: 'Dokumenti' },
];

const Sidebar = ({ open, setOpen }: SidebarProps) => (
  <aside
    className={
      `fixed z-40 inset-y-0 left-0 w-64 bg-brand-white border-r border-brand-grayDark shadow-xl transform lg:translate-x-0 transition-transform duration-200 ease-in-out
      ${open ? 'translate-x-0' : '-translate-x-full'} lg:static lg:shadow-none`
    }
    aria-label="Sidebar"
  >
    <div className="flex items-center justify-between h-16 px-4 border-b border-brand-grayDark lg:hidden bg-brand-blue text-brand-white">
      <span className="text-xl font-bold">INTELIGENT</span>
      <button className="p-2 text-brand-white" onClick={() => setOpen(false)}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="6" y1="18" x2="18" y2="6" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>
    <div className="flex flex-col p-4 space-y-2 bg-brand-white min-h-full">
      <h2 className="hidden lg:block mb-4 text-2xl font-bold text-brand-blue">INTELIGENT</h2>
      {nav.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `rounded px-3 py-2 font-medium block text-lg duration-150
            ${isActive ? 'bg-brand-blue text-brand-white shadow' : 'hover:bg-brand-grayLight text-brand-blue'} `
          }
          end={link.to === '/'}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  </aside>
);

export default Sidebar;
