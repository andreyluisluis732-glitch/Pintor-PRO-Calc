'use client';

import { EstimateProvider, useEstimate } from '@/context/EstimateContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useEstimate();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const publicPages = ['/', '/calculate', '/results', '/catalog', '/login', '/_not-found', '/schedule', '/help', '/share'];
  const isPublicPage = pathname ? publicPages.includes(pathname) : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user && !isPublicPage) {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router, mounted, isPublicPage]);

  // Avoid hydration mismatch by rendering the same thing on server and client initial render
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Allow access to public pages when not logged in
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
