import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientLayout from './components/ClientLayout';
import Home from './pages/Home';
import Calculate from './pages/Calculate';
import Results from './pages/Results';
import Catalog from './pages/Catalog';
import History from './pages/History';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import Help from './pages/Help';
import Login from './pages/Login';
import SalesPage from './pages/SalesPage';
import AdPage from './pages/AdPage';
import SupabaseTest from './pages/SupabaseTest';

function App() {
  return (
    <Router>
      <ClientLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculate" element={<Calculate />} />
          <Route path="/results" element={<Results />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vendas" element={<SalesPage />} />
          <Route path="/anuncio" element={<AdPage />} />
          <Route path="/supabase-test" element={<SupabaseTest />} />
        </Routes>
      </ClientLayout>
    </Router>
  );
}

export default App;
