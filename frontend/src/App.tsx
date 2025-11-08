import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Ponudbe from './pages/Ponudbe';
import Projekti from './pages/Projekti';
import Nalogi from './pages/Nalogi';
import Dokumenti from './pages/Dokumenti';
import './style.css';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {/* Overlay za mobilne naprave */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col">
        {/* Header/Hamburger */}
        <header className="flex items-center h-16 px-4 shadow bg-white lg:hidden">
          <button
            className="p-2 mr-3 text-gray-600 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <span className="text-xl font-bold select-none">INTELIGENT</span>
        </header>
        {/* Routes/pages */}
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/ponudbe" element={<Ponudbe />} />
            <Route path="/projekti" element={<Projekti />} />
            <Route path="/nalogi" element={<Nalogi />} />
            <Route path="/dokumenti" element={<Dokumenti />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
