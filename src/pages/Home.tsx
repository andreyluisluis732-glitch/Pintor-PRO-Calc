import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, MessageSquare, History, Ruler, Database, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { useEstimate } from '../context/EstimateContext';

export default function Home() {
  const { history, isPro, isTrial, trialDaysLeft } = useEstimate();
  const location = useLocation();
  const search = location.search;
  const isClientMode = new URLSearchParams(search).get('mode') === 'client';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const clientParam = isClientMode ? '?mode=client' : '';

  return (
    <div className="min-h-screen flex flex-col pb-32 bg-[#f0f2f5]">
      {/* Top Navigation Bar */}
      <header className="w-full top-0 sticky z-40 bg-[#f0f2f5]/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex flex-col">
            <div className="text-blue-600 font-black tracking-tighter text-xl italic uppercase">
              Pintor PRO Calc
            </div>
            {isTrial && !isPro && !isClientMode && (
              <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter w-fit mt-1">
                {trialDaysLeft} dias grátis
              </span>
            )}
            {isClientMode && (
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">
                Portal do Cliente
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={`/help${clientParam}`}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-90"
              title="Ajuda"
            >
              <HelpCircle size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 relative overflow-hidden">
        {/* Background Decorative Layer */}
        <div className="absolute inset-0 bg-architectural-grid pointer-events-none opacity-50" />
        
        <div className="max-w-md w-full z-10 space-y-8 pt-6">
          {isTrial && !isPro && !isClientMode && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Zap className="text-blue-600 w-5 h-5" />
                <div>
                  <h4 className="text-blue-900 font-bold text-xs uppercase tracking-tight">Período de Teste</h4>
                  <p className="text-blue-800 text-[10px] font-medium">Você tem mais {trialDaysLeft} dias gratuitos.</p>
                </div>
              </div>
              <Link to="/subscription" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                Assinar Pro
              </Link>
            </motion.div>
          )}

          {/* Hero Content - More Compact */}
          <div className="space-y-4 text-center">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-3 py-1 bg-blue-600/10 text-blue-700 rounded-full text-[9px] font-black tracking-[0.2em] uppercase mb-2"
            >
              <Ruler size={12} className="mr-1.5" />
              Painel de Precisão
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-black tracking-tighter text-slate-900 leading-tight"
            >
              Orçamentos de pintura em <span className="text-blue-600">segundos</span>
            </motion.h1>
          </div>

          {/* Main Action Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link to={`/calculate${clientParam}`} className="col-span-2 group">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-500/50 transition-all active:scale-[0.98] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Calculator size={80} />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none mb-1">Novo Orçamento</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cálculo detalhado</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600">Começar agora</span>
                  <ArrowRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link to={`/schedule${clientParam}`} className="group">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-500/50 transition-all active:scale-[0.98] h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1">Agenda</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Visitas técnicas</p>
              </div>
            </Link>

            <Link to={`/catalog${clientParam}`} className="group">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-500/50 transition-all active:scale-[0.98] h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                  <Database size={20} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1">Catálogo</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Produtos e Cores</p>
              </div>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-4">
            {!isClientMode && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Últimos Orçamentos</h3>
                  <Link to="/history" className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Ver tudo</Link>
                </div>
                <div className="p-2">
                  {history.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Nenhum registro
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {history.slice(0, 2).map((est) => (
                        <Link key={est.id} to="/history" className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                              <History size={14} />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{est.title}</span>
                          </div>
                          <span className="text-xs font-black text-blue-600">{formatCurrency(est.totalCost || 0)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Link to={`/help${clientParam}`} className="block">
              <div className="bg-slate-900 p-5 rounded-3xl shadow-lg shadow-slate-200 flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <HelpCircle size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-white">Central de Ajuda</h3>
                  <p className="text-[10px] text-white/50 font-medium">Dúvidas e Suporte Técnico</p>
                </div>
                <ArrowRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>


          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
