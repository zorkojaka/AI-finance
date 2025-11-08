import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Ponudbe from './pages/Ponudbe';
import Projekti from './pages/Projekti';
import Nalogi from './pages/Nalogi';
import Dokumenti from './pages/Dokumenti';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/ponudbe" element={<Ponudbe />} />
        <Route path="/projekti" element={<Projekti />} />
        <Route path="/nalogi" element={<Nalogi />} />
        <Route path="/dokumenti" element={<Dokumenti />} />
      </Routes>
    </Layout>
  );
};

export default App;
