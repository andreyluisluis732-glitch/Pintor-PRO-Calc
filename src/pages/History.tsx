import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Calendar, Ruler, MoreHorizontal, Plus, Clock, CheckCircle2, Phone, Mail, MapPin, FileText, X, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { useEstimate, Appointment } from '../context/EstimateContext';
import { PRODUCT_CATALOG } from '../constants/catalog';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, appointments, deleteAppointment, setCurrentEstimate } = useEstimate();
  const [activeTab, setActiveTab] = useState<'estimates' | 'appointments'>('estimates');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingApp, setViewingApp] = useState<Appointment | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  const location = useLocation();
  const search = location.search;
  const isClientMode = new URLSearchParams(search).get('mode') === 'client';
  const clientParam = isClientMode ? '?mode=client' : '';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const filteredHistory = history.filter(est => 
    est.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAppointments = appointments.filter(app => 
    app.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.clientPhone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalM2 = history.reduce((acc, est) => acc + (est.area || 0), 0);
  const totalFaturamento = history.reduce((acc, est) => acc + (est.totalCost || 0), 0);
  const totalPendente = history.filter(est => est.status === 'Aguardando').reduce((acc, est) => acc + (est.totalCost || 0), 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#191c1e] pb-40">
      <header className="w-full top-0 sticky bg-[#f0f2f5]/80 backdrop-blur-md z-40 border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-blue-600 italic uppercase tracking-tighter">Pintor PRO Calc</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/help${clientParam}`} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <HelpCircle size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-4">
        {/* Tab Switcher */}
        <div className="flex bg-surface-container-high p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('estimates')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'estimates' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant/60'}`}
          >
            Orçamentos
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'appointments' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant/60'}`}
          >
            Consultas
          </button>
        </div>

        <section className="mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={20} className="text-on-surface-variant/60" />
            </div>
            <input 
              className="w-full h-14 pl-12 pr-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 placeholder:text-on-surface-variant/50 text-[#191c1e] font-medium outline-none" 
              placeholder={activeTab === 'estimates' ? "Buscar por cliente ou local..." : "Buscar consultas..."}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold tracking-[0.1em] text-on-surface-variant uppercase">
              {activeTab === 'estimates' ? 'Recentes' : 'Agendadas'}
            </h2>
            <span className="text-xs font-medium text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">
              {activeTab === 'estimates' ? `${filteredHistory.length} Orçamentos` : `${filteredAppointments.length} Consultas`}
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'estimates' ? (
                <motion.div 
                  key="estimates-list"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant">
                      {searchQuery ? 'Nenhum orçamento encontrado.' : 'Nenhum orçamento salvo ainda.'}
                    </div>
                  ) : (
                    filteredHistory.map((est, idx) => (
                      <motion.div 
                        key={est.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`bg-white p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300 group relative ${est.status === 'Cancelado' ? 'border-l-4 border-red-600' : ''}`}
                      >
                        <div 
                          className="flex justify-between items-start cursor-pointer"
                          onClick={() => {
                            setCurrentEstimate(est);
                            navigate('/results' + clientParam);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg text-[#191c1e]">{est.title}</h3>
                              {est.status && est.status !== 'Cancelado' && (
                                <span className={`bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider`}>
                                  {est.status}
                                </span>
                              )}
                            </div>
                            {est.clientName && (
                              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Cliente: {est.clientName}</p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-on-surface-variant/70 uppercase font-bold tracking-tighter mb-2">
                              {est.propertyType && <span className="bg-surface-container-high px-1.5 py-0.5 rounded">{est.propertyType}</span>}
                              {est.productId && (
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                  {PRODUCT_CATALOG.find(p => p.id === est.productId)?.name || 'Produto'}
                                </span>
                              )}
                              {est.color && (
                                <span className="bg-secondary/10 text-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <span 
                                    className="w-2 h-2 rounded-full border border-black/10 inline-block" 
                                    style={{ 
                                      backgroundColor: PRODUCT_CATALOG.find(p => p.id === est.productId)?.colors.find(c => c.name === est.color)?.hex || '#ccc' 
                                    }} 
                                  />
                                  Cor: {est.color}
                                </span>
                              )}
                              {est.packageSize && (
                                <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                                  {est.packageCount} {
                                    est.packageSize === 'bucket' ? 'Balde(s)' : 
                                    est.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
                                  }
                                </span>
                              )}
                              {(est.city || est.neighborhood) && (
                                <span className="bg-surface-container-high px-1.5 py-0.5 rounded">
                                  {est.neighborhood}{est.neighborhood && est.city ? ', ' : ''}{est.city}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                {est.date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Ruler size={16} />
                                {est.area}m2
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-extrabold text-primary mb-1">{formatCurrency(est.totalCost || 0)}</div>
                            <button className="p-1.5 hover:bg-surface-low rounded-lg transition-colors">
                              <MoreHorizontal size={20} className="text-on-surface-variant" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="appointments-list"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant">
                      {searchQuery ? 'Nenhuma consulta encontrada.' : 'Nenhuma consulta agendada.'}
                    </div>
                  ) : (
                    filteredAppointments.map((app, idx) => {
                      let dateObj = new Date();
                      if (app.date) {
                        const parts = app.date.split('-');
                        if (parts.length === 3) {
                          dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                        } else {
                          const d = new Date(app.date);
                          if (!isNaN(d.getTime())) dateObj = d;
                        }
                      }
                      
                      return (
                        <motion.div 
                          key={app.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between cursor-pointer active:bg-surface-container-low transition-colors"
                          onClick={() => setViewingApp(app)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex flex-col items-center justify-center text-primary">
                              <span className="text-[10px] font-black uppercase leading-none">
                                {dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                              </span>
                              <span className="text-lg font-black leading-none">{dateObj.getDate()}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-[#191c1e]">{app.clientName}</h3>
                              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {app.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {app.clientPhone}
                                </span>
                                <a 
                                  href={`https://wa.me/${app.clientPhone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-600 transition-colors font-bold"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={16} className="text-green-600" />
                            <span className="text-[10px] font-bold uppercase text-green-600">{app.status}</span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {activeTab === 'estimates' && (
          <section className="mt-12 bg-surface-low p-6 rounded-2xl border border-outline-variant/15">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Resumo Mensal</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl">
                <span className="text-xs text-on-surface-variant block mb-1">Total m² do Imóvel</span>
                <span className="text-xl font-extrabold text-secondary">{totalM2}m2</span>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <span className="text-xs text-on-surface-variant block mb-1">Faturamento</span>
                <span className="text-xl font-extrabold text-primary">{formatCurrency(totalFaturamento)}</span>
              </div>
              <div className="bg-tertiary-fixed p-4 rounded-xl col-span-2">
                <span className="text-xs text-on-tertiary-fixed-variant block mb-1">Pendente</span>
                <span className="text-xl font-extrabold text-on-tertiary-fixed">{formatCurrency(totalPendente)}</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="fixed bottom-24 right-6">
        <button 
          onClick={() => navigate('/calculate' + clientParam)}
          className="w-14 h-14 bg-gradient-to-b from-primary to-primary-container text-white rounded-xl shadow-xl flex items-center justify-center active:scale-90 transition-transform duration-150"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <BottomNav />

      {/* Details Modal */}
      <AnimatePresence>
        {viewingApp && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingApp(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#002D5E]">Detalhes do Cliente</h2>
                <button 
                  onClick={() => setViewingApp(null)}
                  className="p-2 bg-surface-container-highest rounded-full text-on-surface-variant"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                    {viewingApp.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#191c1e]">{viewingApp.clientName}</h3>
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{viewingApp.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl">
                    <Phone size={20} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">WhatsApp</p>
                      <p className="font-bold">{viewingApp.clientPhone}</p>
                    </div>
                    <a 
                      href={`https://wa.me/${viewingApp.clientPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                    >
                      Conversar
                    </a>
                  </div>

                  {viewingApp.clientEmail && (
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl">
                      <Mail size={20} className="text-primary" />
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">E-mail</p>
                        <p className="font-bold">{viewingApp.clientEmail}</p>
                      </div>
                    </div>
                  )}

                  {viewingApp.clientAddress && (
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl">
                      <MapPin size={20} className="text-primary" />
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">Endereço</p>
                        <p className="font-bold">{viewingApp.clientAddress}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl">
                    <Calendar size={20} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Data e Hora</p>
                      <p className="font-bold">{viewingApp.date} às {viewingApp.time}</p>
                    </div>
                  </div>

                  {viewingApp.notes && (
                    <div className="p-4 bg-surface-container-low rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={18} className="text-primary" />
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">Informações Complementares</p>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed italic">
                        &quot;{viewingApp.notes}&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setViewingApp(null);
                      navigate('/schedule' + clientParam);
                    }}
                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Edit2 size={18} />
                    Editar na Agenda
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingAppId(viewingApp.id);
                    }}
                    className="flex-1 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingAppId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingAppId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Excluir Consulta?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingAppId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    deleteAppointment(deletingAppId);
                    setDeletingAppId(null);
                    setViewingApp(null);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
