'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEstimate, Estimate } from '@/context/EstimateContext';
import { PRODUCT_CATALOG } from '@/constants/catalog';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Paintbrush, 
  HardHat, 
  FileText, 
  Calendar as CalendarIcon, 
  Palette,
  Loader2,
  Phone,
  MapPin,
  Ruler,
  Tag
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function SharePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getEstimateById, businessPhone } = useEstimate();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);

  const pricingLabels: Record<string, string> = {
    m2: 'Por metro quadrado (m²)',
    empreitada: 'Por empreitada (obra fechada)',
    diaria: 'Por diária',
    ambiente: 'Por ambiente / cômodo',
    especifico: 'Por serviço específico',
    completo: 'Mão de obra + material'
  };

  useEffect(() => {
    async function loadEstimate() {
      if (typeof id === 'string') {
        const data = await getEstimateById(id);
        setEstimate(data);
      }
      setLoading(false);
    }
    loadEstimate();
  }, [id, getEstimateById]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f0f2f5]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Carregando orçamento...</p>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f0f2f5]">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
          <FileText size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[#191c1e]">Orçamento não encontrado</h2>
        <p className="text-on-surface-variant mb-8 max-w-xs">O link pode ter expirado ou o orçamento foi removido.</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
        >
          Ir para o Início
        </button>
      </div>
    );
  }

  const product = PRODUCT_CATALOG.find(p => p.id === estimate.productId) || PRODUCT_CATALOG[0];

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/10 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Paintbrush size={20} />
            </div>
            <div>
              <h1 className="font-black text-sm uppercase tracking-tighter text-[#002D5E]">Pintor PRO Calc</h1>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Orçamento Digital</p>
            </div>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Oficial
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-8 space-y-6">
        {/* Success Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10 text-center space-y-4"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#191c1e]">Orçamento Disponível</h2>
            <p className="text-sm text-on-surface-variant">Gerado em {estimate.date}</p>
          </div>
        </motion.div>

        {/* Client Info */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <FileText size={14} />
            Dados do Cliente
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nome</p>
                <p className="font-bold text-[#191c1e]">{estimate.clientName || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Localização</p>
                <p className="font-bold text-[#191c1e]">{[estimate.location, estimate.neighborhood, estimate.city].filter(Boolean).join(', ') || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Project Details */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <HardHat size={14} />
            Detalhes da Obra
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Área Total</p>
              <p className="text-xl font-black text-[#191c1e]">{estimate.area}m²</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tipo</p>
              <p className="text-xl font-black text-[#191c1e]">{estimate.propertyType}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Forma de Cobrança</p>
                <p className="font-bold text-[#191c1e]">{pricingLabels[estimate.pricingType]}</p>
              </div>
            </div>

            {estimate.includePaint && estimate.productId && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary shrink-0">
                  <Palette size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Material Selecionado</p>
                  <p className="font-bold text-[#191c1e]">{product.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {estimate.packageCount} {
                      estimate.packageSize === 'bucket' ? 'Balde(s)' : 
                      estimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
                    } • {estimate.color}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Total Value */}
        <section className="bg-[#002D5E] p-8 rounded-3xl shadow-xl text-white text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Valor Total Estimado</p>
          <h2 className="text-4xl font-black tracking-tighter">{formatCurrency(estimate.totalCost)}</h2>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Material + Mão de Obra</p>
        </section>

        {/* Media Preview if any */}
        {estimate.mediaUrls && estimate.mediaUrls.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant px-2">Fotos do Local</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {estimate.mediaUrls.map((url, idx) => (
                <div key={idx} className="relative w-40 aspect-square rounded-2xl overflow-hidden border border-outline-variant/10 shrink-0">
                  <Image 
                    src={url} 
                    alt={`Foto ${idx + 1}`} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Painter CTA */}
        <div className="pt-4">
          <a 
            href={`https://wa.me/${businessPhone?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-16 bg-[#25D366] text-white rounded-2xl shadow-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <Phone size={20} />
            Falar com o Profissional
          </a>
          <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest mt-4 leading-relaxed">
            Este orçamento é uma estimativa baseada nas informações fornecidas. <br/>
            Sujeito a avaliação técnica presencial.
          </p>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 text-center pb-8">
        <div className="flex items-center justify-center gap-2 opacity-30 grayscale">
          <Paintbrush size={16} />
          <span className="font-black text-xs uppercase tracking-tighter">Pintor PRO Calc</span>
        </div>
      </footer>
    </div>
  );
}
