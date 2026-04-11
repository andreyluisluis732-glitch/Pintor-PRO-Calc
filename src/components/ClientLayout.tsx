import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { EstimateProvider, useEstimate } from '../context/EstimateContext';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useEstimate();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const publicPages = ['/', '/calculate', '/results', '/catalog', '/login', '/schedule', '/help'];
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicPage) {
        navigate('/login');
      } else if (user && pathname === '/login') {
        navigate('/');
      }
    }
  }, [user, loading, pathname, navigate, isPublicPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user && !isPublicPage) {
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
