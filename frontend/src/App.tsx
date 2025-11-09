import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Ponudbe from './pages/Ponudbe';
import Projekti from './pages/Projekti';
import Projekt from './pages/Projekt';
import Nalogi from './pages/Nalogi';
import Dokumenti from './pages/Dokumenti';
import Cenik from './pages/Cenik';
import Nastavitve from './pages/Nastavitve';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/ponudbe" element={<Ponudbe />} />
        <Route path="/projekti" element={<Projekti />} />
        <Route path="/projekti/:projektId" element={<Projekt />} />
        <Route path="/nalogi" element={<Nalogi />} />
        <Route path="/dokumenti" element={<Dokumenti />} />
        <Route path="/cenik" element={<Cenik />} />
        <Route path="/nastavitve" element={<Nastavitve />} />
      </Routes>
    </Layout>
  );
};

export default App;
