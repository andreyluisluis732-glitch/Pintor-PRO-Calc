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
import SalesPage from './pages/SalesPage';
import Subscription from './pages/Subscription';
import AdPage from './pages/AdPage';
import LoginPage from './pages/Login';
import SupabaseTest from './pages/SupabaseTest';

function AppRoutes() {
  const { isPro, isSubscriptionExpired, loading, user } = useEstimate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Handle redirect to login if not authenticated and not on a public page or client mode
  const search = location.search;
  const isClientMode = new URLSearchParams(search).get('mode') === 'client';
  const publicPages = ['/login', '/vendas', '/anuncio', '/subscription'];
  const isPublicPage = publicPages.includes(location.pathname);

  if (!user && !isPublicPage && !isClientMode) {
    return <LoginPage />;
  }

  // Block access for expired trials/subscriptions
  if (isSubscriptionExpired && !isPro && !isPublicPage && !isClientMode) {
    return <Subscription />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/calculate" element={<Calculate />} />
      <Route path="/results/:estimateId" element={<Results />} />
      <Route path="/results" element={<Results />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/help" element={<Help />} />
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
