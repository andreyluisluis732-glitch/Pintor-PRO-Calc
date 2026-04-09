'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Phone, User, CheckCircle2, Share2, Copy, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import BottomNav from '@/components/BottomNav';
import { useEstimate, PricingType } from '@/context/EstimateContext';

export default function SettingsPage() {
  const router = useRouter();
  const { businessPhone, laborPricePerM2, defaultPrices, updateSettings } = useEstimate();
  const [phone, setPhone] = useState(businessPhone);
  const [prices, setPrices] = useState(defaultPrices);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPhone(businessPhone);
    setPrices(defaultPrices);
  }, [businessPhone, defaultPrices]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ 
      businessPhone: phone, 
      laborPricePerM2: prices.m2 || 0,
      defaultPrices: prices
    });
    setSaving(false);
    setIsEditing(false);
  };

  const updatePrice = (type: keyof typeof prices, value: string) => {
    setPrices(prev => ({ ...prev, [type]: parseFloat(value) || 0 }));
  };

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      <header className="w-full top-0 sticky z-40 bg-[#f9f9fd] shadow-none">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-[#002D5E] active:scale-95 duration-150"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-[#002D5E] font-black tracking-tighter text-xl italic">Configurações</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8 max-w-md mx-auto">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#191c1e]">Perfil Profissional</h2>
                  <p className="text-xs text-on-surface-variant">Configurações do App</p>
                </div>
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-bold uppercase">Salvo</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* WhatsApp Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant">
                  Seu WhatsApp
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      <Phone size={18} />
                    </div>
                    <input 
                      className="w-full h-14 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium outline-none" 
                      placeholder="5511999999999" 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/5">
                    <Phone size={20} className="text-primary" />
                    <span className="text-lg font-bold">{phone || 'Não configurado'}</span>
                  </div>
                )}
              </div>

              {/* Price Table Section */}
              <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Tabela de Preços</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'm2', label: 'Por metro quadrado (m²)', key: 'm2' },
                    { id: 'empreitada', label: 'Por empreitada', key: 'empreitada' },
                    { id: 'diaria', label: 'Por diária', key: 'diaria' },
                    { id: 'ambiente', label: 'Por ambiente', key: 'ambiente' },
                    { id: 'especifico', label: 'Serviço específico', key: 'especifico' },
                    { id: 'completo', label: 'Mão de obra + material', key: 'completo' },
                  ].map((item) => (
                    <div key={item.id} className="space-y-2">
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                        {item.label}
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                          <input 
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base font-medium outline-none" 
                            type="number"
                            step="0.01"
                            value={prices[item.key as keyof typeof prices]}
                            onChange={(e) => updatePrice(item.key as keyof typeof prices, e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/5 font-bold text-primary">
                          {formatCurrency(prices[item.key as keyof typeof prices] || 0)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isEditing ? (
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setPhone(businessPhone);
                      setPrices(defaultPrices);
                    }}
                    className="flex-1 h-14 border-2 border-outline-variant text-on-surface-variant rounded-xl font-bold active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-[2] h-14 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="animate-pulse">Salvando...</span>
                    ) : (
                      <>
                        <Save size={20} />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full h-14 bg-surface-container-highest text-primary border-2 border-primary/20 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Edit2 size={20} />
                  Alterar Número ou Preços
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <Share2 size={18} className="text-primary" />
              Compartilhar com Clientes
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Envie este link para que seus clientes possam fazer orçamentos por conta própria.
            </p>
            <button 
              onClick={handleCopyLink}
              className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={20} className="text-green-600" />
                  Link Copiado!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copiar Link do App
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-blue-800 font-bold text-sm mb-2">Como funciona?</h3>
            <p className="text-blue-700 text-xs leading-relaxed">
              Ao configurar seu número, todos os orçamentos gerados pelos clientes serão enviados diretamente para o seu WhatsApp pessoal. Isso facilita o contato imediato e o fechamento de novos serviços.
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
