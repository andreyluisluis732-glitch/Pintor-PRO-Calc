import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ClientLayout from './components/ClientLayout';
import { useEstimate } from './context/EstimateContext';
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
import Subscription from './pages/Subscription';
import AdPage from './pages/AdPage';
import SupabaseTest from './pages/SupabaseTest';

function AppRoutes() {
  const { isPro, isSubscriptionExpired, loading, user } = useEstimate();
  const location = useLocation();
  const isClientMode = new URLSearchParams(location.search).get('mode') === 'client';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Block access for expired trials/subscriptions
  // But allow access to home (for AdPage/Login) and sales/subscription pages
  const isPublicPage = ['/vendas', '/login', '/anuncio', '/subscription'].includes(location.pathname);
  
  if (isSubscriptionExpired && !isPro && !isClientMode && !isPublicPage) {
    return <Subscription />;
  }

  return (
    <Routes>
      <Route path="/" element={(user || isClientMode) ? <Home /> : <Login />} />
      <Route path="/calculate" element={<Calculate />} />
      <Route path="/results/:estimateId" element={<Results />} />
      <Route path="/results" element={<Results />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/help" element={<Help />} />
      <Route path="/login" element={<Login />} />
      <Route path="/vendas" element={<SalesPage />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/anuncio" element={<AdPage />} />
      <Route path="/supabase-test" element={<SupabaseTest />} />
    </Routes>
  );
}

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ClientLayout>
          <AppRoutes />
        </ClientLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
