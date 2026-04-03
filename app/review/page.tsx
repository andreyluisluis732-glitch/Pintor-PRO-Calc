'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, User, CheckCircle2, Send } from 'lucide-react';
import { motion } from 'motion/react';
import BottomNav from '@/components/BottomNav';

import { useEstimate, Estimate } from '@/context/EstimateContext';
import { PRODUCT_CATALOG } from '@/constants/catalog';

export default function ReviewPage() {
  const router = useRouter();
  const { currentEstimate, saveEstimate } = useEstimate();

  const product = PRODUCT_CATALOG.find(p => p.id === currentEstimate.productId) || PRODUCT_CATALOG[0];

  if (!currentEstimate.totalCost) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Nenhum cálculo encontrado</h2>
        <Link href="/calculate" className="text-primary font-bold underline">Voltar para o cálculo</Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const paintTypeName = {
    economic: 'Econômica',
    standard: 'Standard',
    premium: 'Premium'
  };

  const handleWhatsApp = async () => {
    if (!currentEstimate.totalCost) return;
    
    // Save to history first
    await saveEstimate(currentEstimate as Estimate);

    const locationParts = [currentEstimate.location, currentEstimate.neighborhood, currentEstimate.city].filter(Boolean);
    const location = locationParts.join(', ');
    const message = `Olá${currentEstimate.clientName ? ' ' + currentEstimate.clientName : ''}! Segue o orçamento para sua pintura:

🏠 Tipo de Imóvel: ${currentEstimate.propertyType || 'Não informado'}
📍 Local: ${location || 'Não informado'}
📞 Contato: ${currentEstimate.clientPhone || 'Não informado'}
📐 Área Total: ${currentEstimate.area}m²
🖌️ Demãos: ${currentEstimate.coats} demãos
🧴 Tinta: ${product.name}${currentEstimate.color ? ` (Cor: ${currentEstimate.color})` : ''}
📦 Quantidade: ${currentEstimate.packageCount} ${
  currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : 
  currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
}
💰 Tinta Inclusa no Valor: ${currentEstimate.includePaint ? 'Sim' : 'Não (A cargo do cliente)'}
⏳ Prazo Estimado: 04 dias úteis

VALOR TOTAL DO SERVIÇO: ${formatCurrency(currentEstimate.totalCost || 0)}

Gerado via Pintor PRO Calc`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      {/* Top Navigation */}
      <header className="w-full top-0 sticky z-50 bg-[#f9f9fd]">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-[#002D5E] active:scale-95 duration-150"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-[#002D5E] font-black tracking-tighter text-xl italic uppercase">Pintor PRO Calc</h1>
          </div>
          <div className="flex gap-2">
            <MoreVertical size={24} className="text-[#43474f]" />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-8">
        {/* Editorial Section Header */}
        <section className="mb-8">
          <p className="font-sans text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2">Etapa Final</p>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-primary leading-tight">Revisão do Orçamento</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Revise a mensagem abaixo antes de enviar ao cliente via WhatsApp.</p>
        </section>

        {/* WhatsApp Preview Container */}
        <section className="bg-surface-low rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#191c1e]">{currentEstimate.clientName || 'Cliente Final'}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Online</p>
            </div>
          </div>

          {/* The Message Bubble */}
          <div className="relative flex flex-col items-end">
            <div className="relative bg-[#E7FFDB] rounded-lg p-4 text-sm text-[#111b21] shadow-sm max-w-[90%] after:content-[''] after:absolute after:top-0 after:-right-2 after:w-4 after:h-4 after:bg-[#E7FFDB] after:[clip-path:polygon(0_0,0%_100%,100%_0)]">
              <p className="font-bold mb-2">Olá{currentEstimate.clientName ? ' ' + currentEstimate.clientName : ''}! Segue o orçamento para sua pintura:</p>
              <div className="space-y-2 border-l-2 border-[#128C7E]/20 pl-3 my-3">
                <p><span className="font-semibold">🏠 Tipo:</span> {currentEstimate.propertyType || 'Não informado'}</p>
                {(currentEstimate.location || currentEstimate.city || currentEstimate.neighborhood) && (
                  <p><span className="font-semibold">📍 Local:</span> {[currentEstimate.location, currentEstimate.neighborhood, currentEstimate.city].filter(Boolean).join(', ')}</p>
                )}
                {currentEstimate.clientPhone && (
                  <p><span className="font-semibold">📞 Contato:</span> {currentEstimate.clientPhone}</p>
                )}
                <p><span className="font-semibold">📐 Área Total:</span> {currentEstimate.area}m²</p>
                <p><span className="font-semibold">🖌️ Demãos:</span> {currentEstimate.coats} demãos</p>
                <p><span className="font-semibold">🧴 Tinta:</span> {product.name} {currentEstimate.color && `(Cor: ${currentEstimate.color})`}</p>
                <p><span className="font-semibold">📦 Quantidade:</span> {currentEstimate.packageCount} {
                  currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : 
                  currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
                }</p>
                <p><span className="font-semibold">💰 Tinta Inclusa:</span> {currentEstimate.includePaint ? 'Sim' : 'Não'}</p>
                <p><span className="font-semibold">⏳ Prazo Estimado:</span> 04 dias úteis</p>
              </div>
              <div className="bg-[#dcf8c6] rounded p-2 mb-3">
                <p className="text-[10px] uppercase font-bold text-[#075e54] mb-1">Valor Total do Serviço</p>
                <p className="text-xl font-black text-[#075e54]">{formatCurrency(currentEstimate.totalCost || 0)}</p>
              </div>
              <p className="text-xs italic text-on-surface-variant">Gerado via Pintor PRO Calc</p>
              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[10px] text-on-surface-variant/70">14:20</span>
                <CheckCircle2 size={14} fill="currentColor" className="text-blue-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Summary Chips */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mão de Obra</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(currentEstimate.laborCost || 0)}</p>
          </div>
          <div className="bg-tertiary-fixed p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-on-tertiary-fixed-variant uppercase tracking-wider mb-1">Mat. Estimado</p>
            <p className="text-lg font-bold text-on-tertiary-fixed">{formatCurrency(currentEstimate.materialCost || 0)}</p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleWhatsApp}
          className="w-full bg-gradient-to-b from-[#25D366] to-[#128C7E] text-white flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
        >
          <Send size={20} />
          Enviar no WhatsApp
        </button>
        <p className="text-center text-[10px] text-on-surface-variant/60 mt-4 uppercase tracking-[0.3em]">
          O cliente receberá uma cópia exata deste texto
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
