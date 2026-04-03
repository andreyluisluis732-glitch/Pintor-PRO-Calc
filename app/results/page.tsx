'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Paintbrush, HardHat, Settings, Send, FileText, Bookmark, Calendar as CalendarIcon, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import BottomNav from '@/components/BottomNav';
import Image from 'next/image';
import { useEstimate } from '@/context/EstimateContext';
import { PRODUCT_CATALOG } from '@/constants/catalog';

export default function ResultsPage() {
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

  const handleSave = () => {
    saveEstimate({
      ...currentEstimate as any,
      id: Math.random().toString(36).substr(2, 9),
      title: currentEstimate.clientName 
        ? `${currentEstimate.propertyType || 'Obra'}: ${currentEstimate.clientName}` 
        : `${currentEstimate.propertyType || 'Projeto'} ${currentEstimate.area}m²`,
    });
    router.push('/history');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      {/* Top Navigation Anchor */}
      <header className="w-full top-0 sticky z-40 bg-[#f9f9fd] shadow-none">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-[#002D5E] active:scale-95 duration-150"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-[#002D5E] font-black tracking-tighter text-xl italic">Pintor PRO Calc</h1>
          </div>
          <div className="font-sans font-semibold tracking-wider text-sm uppercase text-[#002D5E]">
            Resumo
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8 max-w-md mx-auto">
        {/* Results Hero Card */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-b from-primary to-primary-container rounded-xl p-8 text-white shadow-lg"
        >
          <div className="relative z-10">
            {currentEstimate.clientName && (
              <div className="mb-2">
                <p className="text-blue-100 font-bold text-sm uppercase tracking-wider">Cliente: {currentEstimate.clientName}</p>
                {currentEstimate.clientPhone && (
                  <p className="text-blue-100/70 text-xs font-medium tracking-widest">{currentEstimate.clientPhone}</p>
                )}
              </div>
            )}
            <p className="text-blue-100/70 font-sans text-xs tracking-widest uppercase mb-2">Investimento Estimado</p>
            <h2 className="text-5xl font-black tracking-tight mb-1">{formatCurrency(currentEstimate.totalCost || 0)}</h2>
            <div className="flex items-center gap-2 mt-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <CheckCircle2 size={14} fill="currentColor" className="text-white" />
              <span className="text-xs font-bold tracking-wide uppercase">Cálculo de Precisão Ativado</span>
            </div>
          </div>
          {/* Decorative Abstract Geometry */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl" />
        </motion.section>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Item: Material */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-5 rounded-xl flex items-center justify-between shadow-sm ${
              currentEstimate.includePaint ? 'bg-white' : 'bg-surface-container-low border border-outline-variant/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                currentEstimate.includePaint ? 'bg-surface-low text-secondary' : 'bg-surface-container-highest text-on-surface-variant opacity-60'
              }`}>
                <Paintbrush size={24} />
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">Material Estimado</p>
                <p className={`font-semibold ${currentEstimate.includePaint ? 'text-[#191c1e]' : 'text-on-surface-variant'}`}>
                  {product.name} ({currentEstimate.packageCount} {
                    currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : 
                    currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
                  })
                </p>
                <p className="text-on-surface-variant text-[10px] font-medium">Total: {currentEstimate.totalLiters}L necessários</p>
                {!currentEstimate.includePaint && (
                  <p className="text-secondary text-[10px] font-bold uppercase tracking-tighter mt-1 italic">Material por conta do cliente</p>
                )}
                {currentEstimate.color && (
                  <div className="mt-3 p-2 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-lg border border-black/10 shadow-sm inline-block" 
                      style={{ backgroundColor: product.colors.find(c => c.name === currentEstimate.color)?.hex || '#ccc' }}
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">Cor Selecionada</span>
                      <span className={`text-sm font-black uppercase leading-none ${currentEstimate.includePaint ? 'text-primary' : 'text-on-surface-variant'}`}>{currentEstimate.color}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase">Subtotal</p>
              <p className={`font-black ${currentEstimate.includePaint ? 'text-[#191c1e]' : 'text-on-surface-variant opacity-50 line-through'}`}>
                {formatCurrency(currentEstimate.materialCost || 0)}
              </p>
              {!currentEstimate.includePaint && (
                <p className="text-[10px] font-black text-secondary">R$ 0,00</p>
              )}
            </div>
          </motion.div>

          {/* Item: Labor */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-low flex items-center justify-center text-secondary">
                <HardHat size={24} />
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">Valor da mão de obra</p>
                <p className="text-[#191c1e] font-semibold">Pintura e Acabamento</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase">Subtotal</p>
              <p className="text-[#191c1e] font-black">{formatCurrency(currentEstimate.laborCost || 0)}</p>
            </div>
          </motion.div>
        </div>

        {/* Technical Specification */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-low rounded-xl p-6 border-l-4 border-secondary"
        >
          <h3 className="font-sans font-bold text-sm tracking-widest uppercase text-secondary mb-4 flex items-center gap-2">
            <Settings size={16} />
            Especificações Técnicas
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Tipo de Imóvel</span>
              <span className="text-[#191c1e] font-bold text-sm">{currentEstimate.propertyType || 'Não informado'}</span>
            </div>
            {currentEstimate.location && (
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                <span className="text-on-surface-variant text-sm">Endereço</span>
                <span className="text-[#191c1e] font-bold text-xs text-right max-w-[200px]">
                  {currentEstimate.location}
                </span>
              </div>
            )}
            {(currentEstimate.city || currentEstimate.neighborhood) && (
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                <span className="text-on-surface-variant text-sm">Localização</span>
                <span className="text-[#191c1e] font-bold text-sm text-right">
                  {currentEstimate.neighborhood}{currentEstimate.neighborhood && currentEstimate.city ? ', ' : ''}{currentEstimate.city}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Produto</span>
              <span className="text-[#191c1e] font-bold text-sm text-right">{product.name} ({product.finish})</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Embalagem Escolhida</span>
              <span className="text-[#191c1e] font-bold text-sm uppercase">
                {currentEstimate.packageSize === 'bucket' ? 'Balde 18L' : 
                 currentEstimate.packageSize === 'can' ? 'Lata 3.6L' : 'Litro'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Quantidade</span>
              <span className="text-[#191c1e] font-bold text-sm">
                {currentEstimate.packageCount} {
                  currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : 
                  currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
                }
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Rendimento</span>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-0.5 rounded text-xs font-bold tracking-tighter">
                1L = {product.yieldPerLiter}m² / demão
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-on-surface-variant text-sm">Tamanho do Imóvel</span>
              <span className="text-[#191c1e] font-bold text-sm">{currentEstimate.area} m²</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Número de Demãos</span>
              <span className="text-[#191c1e] font-bold text-sm">{currentEstimate.coats} Demãos</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm">Tinta Inclusa</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentEstimate.includePaint ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'
              }`}>
                {currentEstimate.includePaint ? 'Sim' : 'Não'}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <div className="pt-4 space-y-4">
          <Link href="/review">
            <button className="w-full bg-gradient-to-b from-primary to-primary-container text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-150 transition-transform">
              <Send size={20} />
              Gerar Mensagem Profissional
            </button>
          </Link>
          <button 
            onClick={() => router.push('/schedule')}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md active:scale-95 duration-150 transition-transform"
          >
            <CalendarIcon size={20} />
            Agendar Consulta Online
          </button>
          <button className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform">
            <FileText size={20} />
            Exportar PDF do Orçamento
          </button>
          <button 
            onClick={handleSave}
            className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform"
          >
            <Bookmark size={20} />
            Salvar Orçamento
          </button>
        </div>

        {/* Material Selection Insight */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mt-8 bg-white border border-outline-variant/10">
          <Image 
            src="https://picsum.photos/seed/painter-pro-logo/800/800" 
            alt="Pintor PRO Calc Logo"
            fill
            className="object-contain p-4"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <div>
              <p className="text-white text-sm font-bold">Qualidade Premium</p>
              <p className="text-white/70 text-xs">Cálculo baseado em tintas de alto rendimento.</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
