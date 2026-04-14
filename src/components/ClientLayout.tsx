import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { EstimateProvider, useEstimate } from '../context/EstimateContext';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isPro } = useEstimate();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const search = location.search;
  const isClientMode = new URLSearchParams(search).get('mode') === 'client';

  const publicPages = ['/login', '/vendas', '/anuncio'];
  const clientPages = ['/', '/calculate', '/results', '/catalog', '/schedule', '/help'];
  
  const isPublicPage = publicPages.includes(pathname);
  const isClientAccessible = clientPages.includes(pathname) && isClientMode;

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicPage && !isClientAccessible) {
        navigate('/anuncio');
      } else if (user && !isPro && !isPublicPage && !isClientAccessible) {
        navigate('/anuncio');
      } else if (user && isPro && pathname === '/login') {
        navigate('/');
      }
    }
  }, [user, loading, isPro, pathname, navigate, isPublicPage, isClientAccessible]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user && !isPublicPage && !isClientAccessible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstimateProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </EstimateProvider>
  );
}
