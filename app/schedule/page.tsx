'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Trash2, Plus, Edit2, Phone, Mail, MapPin, FileText, X, Loader2, HelpCircle, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { useEstimate, Appointment } from '@/context/EstimateContext';

export default function SchedulePage() {
  const router = useRouter();
  const { appointments, saveAppointment, updateAppointment, deleteAppointment, currentEstimate, businessPhone } = useEstimate();
  const [isAdding, setIsAdding] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingApp, setViewingApp] = useState<Appointment | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getWhatsAppUrl = () => {
    let phone = businessPhone.replace(/\D/g, '');
    if (phone.length >= 10 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    const formattedDate = newApp.date.split('-').reverse().join('/');
    
    let message = '';
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

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const [savedWhatsAppUrl, setSavedWhatsAppUrl] = useState<string | null>(null);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    if (!newApp.clientName || !newApp.clientPhone) return;
    
    const whatsappUrl = getWhatsAppUrl();

    if (editingId) {
      // Find the existing appointment to get its uid
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
      // saveAppointment expects Omit<Appointment, 'id' | 'uid'>
      const appointmentData = {
        ...newApp,
        status: 'Pendente' as const
      };
      await saveAppointment(appointmentData);
    }
    
    setIsAdding(false);
    setSavedWhatsAppUrl(whatsappUrl);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setSavedWhatsAppUrl(null);
    }, 15000); // Show for 15 seconds
    
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#191c1e] pb-32">
      <header className="w-full top-0 sticky bg-[#f0f2f5] z-40">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="active:scale-95 duration-150 p-2 hover:bg-[#e7e8eb] transition-colors rounded-full"
            >
              <ArrowLeft size={24} className="text-[#002D5E]" />
            </button>
            <h1 className="text-xl font-bold text-[#002D5E]">
              Solicitar Consulta
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/help" className="p-2 text-[#002D5E] hover:bg-[#e7e8eb] rounded-full transition-colors">
              <HelpCircle size={24} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-4">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-24 z-50"
            >
              <div className="bg-[#25D366] text-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-bold text-lg">Agendamento Salvo!</span>
                </div>
                
                {savedWhatsAppUrl && (
                  <a 
                    href={savedWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white text-[#128C7E] py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                  >
                    <Send size={18} />
                    Confirmar no WhatsApp
                  </a>
                )}
                
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="text-white/80 text-sm underline"
                >
                  Fechar
                </button>
              </div>
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

      </main>

      <BottomNav />
    </div>
  );
}
