'use client';

import { EstimateProvider, useEstimate } from '@/context/EstimateContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstimateProvider>
      {children}
    </EstimateProvider>
  );
}
