import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  CurrencyEuroIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Nadzorna plošča', to: '/', icon: HomeIcon },
  { name: 'CRM', to: '/crm', icon: UsersIcon },
  { name: 'Ponudbe', to: '/ponudbe', icon: DocumentTextIcon },
  { name: 'Projekti', to: '/projekti', icon: FolderIcon },
  { name: 'Nalogi', to: '/nalogi', icon: ClipboardDocumentListIcon },
  { name: 'Dokumenti', to: '/dokumenti', icon: DocumentDuplicateIcon },
  { name: 'Cenik', to: '/cenik', icon: CurrencyEuroIcon },
  { name: 'Nastavitve', to: '/nastavitve', icon: Cog6ToothIcon }
];

const Sidebar = () => (
  <div className="flex h-screen flex-col bg-brand-blue text-white shadow-lg">
    <div className="px-6 py-6 text-xl font-semibold">Inteligent d.o.o.</div>
    <nav className="flex-1 space-y-1 px-4">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <item.icon className="h-5 w-5" aria-hidden="true" />
          {item.name}
        </NavLink>
      ))}
    </nav>
    <div className="px-6 py-4 text-xs text-white/60">
      © {new Date().getFullYear()} Inteligent d.o.o.
    </div>
  </div>
);

export default Sidebar;
