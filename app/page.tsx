'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, MessageSquare, History, Ruler, DraftingCompass } from 'lucide-react';
import { motion } from 'motion/react';
import BottomNav from '@/components/BottomNav';
import Image from 'next/image';

import { useEstimate } from '@/context/EstimateContext';
import { auth } from '@/lib/firebase';

export default function Home() {
  const { history, user } = useEstimate();
  const lastEstimate = history[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Top Navigation Bar */}
      <header className="w-full top-0 sticky z-40 bg-[#f9f9fd] shadow-none">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex flex-col">
            <div className="text-[#002D5E] font-black tracking-tighter text-xl italic uppercase">
              Pintor PRO Calc
            </div>
            {user && (
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Olá, {user.displayName?.split(' ')[0] || 'Profissional'}
              </span>
            )}
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="text-[#43474f] hover:bg-[#e7e8eb] transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center gap-2"
            title="Sair"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
              {user?.displayName?.[0] || user?.email?.[0] || 'P'}
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 relative overflow-hidden">
        {/* Background Decorative Layer */}
        <div className="absolute inset-0 bg-architectural-grid pointer-events-none" />
        
        <div className="max-w-md w-full z-10 space-y-12 pt-8">
          {/* Hero Content */}
          <div className="space-y-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-[10px] font-bold tracking-widest uppercase mb-4"
            >
              <Ruler size={14} className="mr-1" />
              Painel de Precisão
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-sans font-extrabold tracking-tighter text-[#191c1e] leading-[1.1]"
            >
              Calcule seu orçamento de pintura em <span className="text-[#e17b00]">segundos</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-[85%] mx-auto"
            >
              A ferramenta definitiva para pintores profissionais que buscam exatidão em cada galão e metro quadrado.
            </motion.p>
          </div>

          {/* Visual Graphic Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative bg-white border border-outline-variant/10 rounded-xl overflow-hidden shadow-sm">
              <div className="relative w-full aspect-square">
                <Image 
                  src="https://picsum.photos/seed/painter-pro-logo/800/800" 
                  alt="Pintor PRO Calc Logo"
                  fill
                  className="object-contain transition-all duration-700 p-4"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex justify-between items-center bg-surface-low">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-white">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Precisão de Cálculo</p>
                    <p className="text-sm font-semibold text-[#191c1e]">Margem de erro &lt; 1%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Cluster */}
          <div className="flex flex-col gap-4">
            <Link href="/calculate">
              <button className="w-full h-14 bg-gradient-to-b from-primary to-primary-container text-white font-bold tracking-tight rounded-md shadow-lg active:scale-95 duration-150 flex items-center justify-center gap-2">
                <Calculator size={20} />
                Calcular orçamento
              </button>
            </Link>
            <Link href="/history">
              <button className="w-full h-14 bg-secondary-container text-on-secondary-container font-semibold rounded-md hover:bg-secondary-fixed transition-colors active:scale-95 duration-150 flex items-center justify-center gap-2">
                <MessageSquare size={20} />
                Gerar mensagem para cliente
              </button>
            </Link>
          </div>

          {/* Recent Projects Preview */}
          <div className="bg-surface-low rounded-xl p-4">
            <h3 className="font-sans font-semibold tracking-wider text-xs uppercase text-on-surface-variant mb-4">Últimos Orçamentos</h3>
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-4 text-on-surface-variant text-xs italic">
                  Nenhum orçamento recente
                </div>
              ) : (
                history.slice(0, 3).map((est) => (
                  <div key={est.id} className="bg-white p-3 rounded-md flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <History size={18} className="text-secondary" />
                      <span className="text-sm font-medium">{est.title}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{formatCurrency(est.totalCost || 0)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
