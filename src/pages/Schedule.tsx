import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Trash2, Plus, Edit2, Phone, Mail, MapPin, FileText, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { useEstimate, Appointment } from '../context/EstimateContext';

export default function SchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search;
  const isClientMode = new URLSearchParams(search).get('mode') === 'client';
  const clientParam = isClientMode ? '?mode=client' : '';
  const { user, appointments, saveAppointment, updateAppointment, deleteAppointment, currentEstimate, businessPhone } = useEstimate();
  const [isAdding, setIsAdding] = useState(!user);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingApp, setViewingApp] = useState<Appointment | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setTimeout(() => setIsAdding(true), 0);
    }
  }, [user]);

  const [newApp, setNewApp] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00'
  });

  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSave = async () => {
    if (!newApp.clientName || !newApp.clientPhone) return;
    
    if (editingId) {
      const existingApp = appointments.find(a => a.id === editingId);
      if (!existingApp) return;

      const updatedApp: Appointment = {
        ...existingApp,
        ...newApp,
        status: 'Pendente'
      };
      await updateAppointment(updatedApp);
      setEditingId(null);
    } else {
      const appointmentData = {
        ...newApp,
        status: 'Pendente' as const
      };
      await saveAppointment(appointmentData);
    }

    let phone = (user ? newApp.clientPhone : businessPhone).replace(/\D/g, '');
    if (phone.length >= 10 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    const formattedDate = newApp.date.split('-').reverse().join('/');
    
    let message = '';
    if (user) {
      message = `*Pintor PRO - Agendamento Confirmado*\n\n`;
      message += `Olá *${newApp.clientName}*, confirmo nossa consulta técnica:\n`;
      message += `📅 *Data:* ${formattedDate}\n`;
      message += `⏰ *Horário:* ${newApp.time}\n\n`;

      if (currentEstimate && currentEstimate.totalCost) {
        message += `*--- Resumo do Orçamento ---*\n`;
        message += `🏠 *Imóvel:* ${currentEstimate.propertyType || 'Não informado'}\n`;
        message += `📏 *Área:* ${currentEstimate.area}m²\n`;
        message += `🎨 *Cor:* ${currentEstimate.color || 'A definir'}\n`;
        
        if (currentEstimate.includePaint) {
          message += `📦 *Material:* Incluso (${currentEstimate.packageCount} un)\n`;
        } else {
          message += `📦 *Material:* Por conta do cliente\n`;
        }
        
        message += `💰 *Valor Estimado:* R$ ${currentEstimate.totalCost.toLocaleString('pt-BR')}\n\n`;
        message += `_Estarei aí para validar os detalhes e fechar o serviço!_`;
      } else {
        message += `Estarei no local para realizar a medição e passar o orçamento detalhado.`;
      }
    } else {
      message = `*Pintor PRO - Novo Agendamento de Consulta*\n\n`;
      message += `Olá! Gostaria de agendar uma consulta técnica:\n\n`;
      message += `👤 *Cliente:* ${newApp.clientName}\n`;
      message += `📞 *WhatsApp:* ${newApp.clientPhone}\n`;
      if (newApp.clientEmail) {
        message += `📧 *E-mail:* ${newApp.clientEmail}\n`;
      }
      message += `📅 *Data:* ${formattedDate}\n`;
      message += `⏰ *Horário:* ${newApp.time}\n`;
      message += `📍 *Endereço:* ${newApp.clientAddress || 'Não informado'}\n\n`;
      if (newApp.notes) {
        message += `📝 *Informações Complementares:* ${newApp.notes}\n\n`;
      }
      message += `_Aguardando sua confirmação!_`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    setIsAdding(false);
    setShowSuccess(true);
    
    window.open(whatsappUrl, '_blank');

    setTimeout(() => setShowSuccess(false), 3000);
    
    setNewApp({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00'
    });
  };

  const handleEdit = (app: Appointment) => {
    setNewApp({
      clientName: app.clientName,
      clientPhone: app.clientPhone,
      clientEmail: app.clientEmail || '',
      clientAddress: app.clientAddress || '',
      notes: app.notes || '',
      date: app.date,
      time: app.time
    });
    setEditingId(app.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewApp({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00'
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(app => app.date === today);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#191c1e] pb-40">
      <header className="w-full top-0 sticky bg-[#f0f2f5]/80 backdrop-blur-md z-40 border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="active:scale-95 duration-150 p-2 hover:bg-slate-100 transition-all rounded-xl"
            >
              <ArrowLeft size={20} className="text-[#002D5E]" />
            </button>
            <h1 className="text-lg font-black text-blue-600 italic uppercase tracking-tighter">
              {user ? 'Agenda' : 'Consulta'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/help${clientParam}`} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <HelpCircle size={18} />
            </Link>
            {user && (
              <button 
                onClick={() => setIsAdding(true)}
                className="p-2 bg-blue-600 text-white rounded-xl shadow-lg active:scale-90 transition-all ml-1"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-4">
        {user && (
          <section className="mb-8 bg-[#002D5E] p-6 rounded-3xl text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">Hoje</h2>
              <CalendarIcon size={20} className="opacity-80" />
            </div>
            <div className="text-3xl font-black mb-1">{todayAppointments.length}</div>
            <p className="text-xs font-medium opacity-70">Consultas agendadas para hoje</p>
          </section>
        )}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 text-green-800 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-sm shadow-sm"
            >
              <CheckCircle2 size={20} />
              Consulta agendada com sucesso!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-primary/10"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CalendarIcon size={20} className="text-primary" />
                {editingId ? 'Editar Consulta' : 'Nova Consulta Online'}
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Nome do Cliente</label>
                  <input 
                    className="w-full h-12 px-4 bg-surface-container-highest rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Nome completo"
                    value={newApp.clientName}
                    onChange={e => setNewApp({...newApp, clientName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">WhatsApp</label>
                  <input 
                    className="w-full h-12 px-4 bg-surface-container-highest rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="(00) 00000-0000"
                    value={newApp.clientPhone}
                    onChange={e => setNewApp({...newApp, clientPhone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">E-mail (Opcional)</label>
                  <input 
                    className="w-full h-12 px-4 bg-surface-container-highest rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="exemplo@email.com"
                    value={newApp.clientEmail}
                    onChange={e => setNewApp({...newApp, clientEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Endereço (Opcional)</label>
                  <input 
                    className="w-full h-12 px-4 bg-surface-container-highest rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Rua, número, bairro"
                    value={newApp.clientAddress}
                    onChange={e => setNewApp({...newApp, clientAddress: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Informações Complementares</label>
                  <textarea 
                    className="w-full p-4 bg-surface-container-highest rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all min-h-[80px]"
                    placeholder="Detalhes sobre o serviço..."
                    value={newApp.notes}
                    onChange={e => setNewApp({...newApp, notes: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Escolha o dia da semana</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() + i);
                      const dateStr = d.toISOString().split('T')[0];
                      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                      const dayNum = d.getDate();
                      const isSelected = newApp.date === dateStr;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewApp({ ...newApp, date: dateStr })}
                          className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                            isSelected 
                              ? 'bg-primary border-primary text-white shadow-lg scale-105' 
                              : 'bg-surface-container-highest border-transparent text-on-surface-variant hover:border-primary/30'
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white/80' : 'text-on-surface-variant/60'}`}>
                            {dayName}
                          </span>
                          <span className="text-lg font-black">{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Data Personalizada</label>
                    <input 
                      type="date"
                      className="w-full h-12 px-4 bg-surface-container-highest rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={newApp.date}
                      onChange={e => setNewApp({...newApp, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Horário</label>
                    <select 
                      className="w-full h-12 px-4 bg-surface-container-highest rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                      value={newApp.time}
                      onChange={e => setNewApp({...newApp, time: e.target.value})}
                    >
                      {availableTimes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleCancel}
                    className="flex-1 h-12 rounded-xl font-bold text-on-surface-variant bg-surface-container-high active:scale-95 transition-transform"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 h-12 rounded-xl font-bold text-white bg-primary shadow-lg active:scale-95 transition-transform"
                  >
                    {editingId ? 'Salvar Alterações' : 'Agendar'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {user && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Próximas Consultas</h2>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{appointments.length} Agendadas</span>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant">
                  <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Nenhuma consulta agendada.</p>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="mt-4 text-primary font-bold text-sm"
                  >
                    Agendar minha primeira consulta
                  </button>
                </div>
              ) : (
                  appointments.map((app, idx) => {
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
                    
                    const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
                    const dayNum = dateObj.getDate();

                    return (
                      <motion.div 
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center justify-between group cursor-pointer active:bg-surface-container-low transition-colors"
                        onClick={() => setViewingApp(app)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex flex-col items-center justify-center text-primary">
                            <span className="text-[10px] font-black uppercase leading-none">{monthName}</span>
                            <span className="text-lg font-black leading-none">{dayNum}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-[#191c1e]">{app.clientName}</h3>
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {app.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 size={12} className="text-green-600" />
                                  {app.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-primary font-bold">
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {app.clientPhone}
                                </span>
                                <a 
                                  href={`https://wa.me/${app.clientPhone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-600 transition-colors"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(app);
                            }}
                            className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAppointment(app.id);
                            }}
                            className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
              )}
            </div>
          </section>
        )}

        {user && (
          <section className="mt-12 bg-primary/5 p-6 rounded-3xl border border-primary/10">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Dicas para Negociação</h3>
            <ul className="space-y-3 text-sm text-on-surface-variant font-medium">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Prepare fotos de referência de trabalhos anteriores.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Explique a diferença entre os tipos de tinta (Econômica vs Premium).
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Tenha o orçamento detalhado em mãos durante a chamada.
              </li>
            </ul>
          </section>
        )}
      </main>

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
                    <CalendarIcon size={20} className="text-primary" />
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
                      handleEdit(viewingApp);
                    }}
                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Edit2 size={18} />
                    Editar
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir esta consulta?')) {
                        deleteAppointment(viewingApp.id);
                        setViewingApp(null);
                      }
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

      {user && <BottomNav />}
    </div>
  );
}
