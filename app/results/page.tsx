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
  const { currentEstimate, saveEstimate, user, businessPhone } = useEstimate();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const pricingLabels: Record<string, string> = {
    m2: 'Por metro quadrado (m²)',
    empreitada: 'Por empreitada (obra fechada)',
    diaria: 'Por diária',
    ambiente: 'Por ambiente / cômodo',
    especifico: 'Por serviço específico',
    completo: 'Mão de obra + material'
  };

  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const product = PRODUCT_CATALOG.find(p => p.id === currentEstimate.productId) || PRODUCT_CATALOG[0];

  React.useEffect(() => {
    async function prepareShare() {
      if (!user && currentEstimate.totalCost && !shareUrl && !saving) {
        setSaving(true);
        try {
          const id = await saveEstimate(currentEstimate as any);
          if (id) {
            const baseUrl = window.location.origin;
            setShareUrl(`${baseUrl}/share/${id}`);
          }
        } catch (err) {
          console.error("Error saving estimate for guest share:", err);
        } finally {
          setSaving(false);
        }
      }
    }
    prepareShare();
  }, [currentEstimate, saveEstimate, shareUrl, saving, user]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentEstimate.totalCost) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Nenhum cálculo encontrado</h2>
        <Link href="/calculate" className="text-primary font-bold underline">Voltar para o cálculo</Link>
      </div>
    );
  }

  const getWhatsAppUrl = () => {
    if (!businessPhone) return '#';

    const locationParts = [currentEstimate.location, currentEstimate.neighborhood, currentEstimate.city].filter(Boolean);
    const location = locationParts.join(', ');
    
    let phone = businessPhone.replace(/\D/g, '');
    if (phone.length >= 10 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }

    let message = `*ORÇAMENTO DE PINTURA - PINTOR PRO CALC*\n\n`;
    message += `Olá! Gostaria de solicitar uma análise para o seguinte orçamento gerado no app:\n\n`;
    
    if (currentEstimate.clientName) message += `👤 *Cliente:* ${currentEstimate.clientName}\n`;
    if (currentEstimate.clientPhone) message += `📞 *Contato:* ${currentEstimate.clientPhone}\n`;
    
    message += `🏠 *Tipo de Imóvel:* ${currentEstimate.propertyType || 'Não informado'}\n`;
    message += `📍 *Localização:* ${location || 'Não informado'}\n`;
    message += `📐 *Área do Imóvel:* ${currentEstimate.area}m²\n`;
    
    message += `💰 *Forma de Cobrança:* ${currentEstimate.pricingType ? pricingLabels[currentEstimate.pricingType] : 'Não informado'}\n`;
    if (currentEstimate.pricingType === 'm2') {
      message += `💵 *Valor por m²:* ${formatCurrency(currentEstimate.pricePerM2 || 0)}\n`;
    }
    
    if (currentEstimate.productId && currentEstimate.includePaint) {
      message += `🧴 *Tinta Selecionada:* ${product.name}${currentEstimate.color ? ` (Cor: ${currentEstimate.color})` : ''}\n`;
      message += `📦 *Quantidade:* ${currentEstimate.packageCount} ${
        currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : 
        currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
      } (Padrão: 2 demãos)\n`;
    } else {
      message += `🛠️ *Serviço:* Apenas Mão de Obra (Material não incluso)\n`;
    }
    
    message += `\n✅ *VALOR TOTAL ESTIMADO:* ${formatCurrency(currentEstimate.totalCost || 0)}\n`;

    if (shareUrl) {
      message += `\n🔗 *Link do Orçamento:* ${shareUrl}\n`;
    }

    if (currentEstimate.notes) {
      message += `\n📝 *Observações:* ${currentEstimate.notes}`;
    }

    message += `\n\n_Gerado com precisão via Pintor PRO Calc_`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleSave = () => {
    saveEstimate({
      ...currentEstimate as any,
      id: crypto.randomUUID(),
      title: currentEstimate.clientName 
        ? `${currentEstimate.propertyType || 'Obra'}: ${currentEstimate.clientName}` 
        : `${currentEstimate.propertyType || 'Projeto'} ${currentEstimate.area}m²`,
    });
    router.push('/history');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-on-surface pb-24">
      {/* Top Navigation Anchor */}
      <header className="w-full top-0 sticky z-40 bg-[#f0f2f5] shadow-none">
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
          {currentEstimate.includePaint && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-xl flex items-center justify-between shadow-sm bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface-low text-secondary">
                  <Paintbrush size={24} />
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">Material Estimado</p>
                  <p className="font-semibold text-[#191c1e]">
                    {currentEstimate.productId ? (
                      `${product.name} (${currentEstimate.packageCount} ${
                        currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : 
                        currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'
                      })`
                    ) : (
                      'Não especificado'
                    )}
                  </p>
                  {currentEstimate.productId && (
                    <p className="text-on-surface-variant text-[10px] font-medium">Total: {currentEstimate.totalLiters}L necessários</p>
                  )}
                  {currentEstimate.color && (
                    <div className="mt-3 p-2 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                      <span 
                        className="w-8 h-8 rounded-lg border border-black/10 shadow-sm inline-block" 
                        style={{ backgroundColor: product.colors.find(c => c.name === currentEstimate.color)?.hex || '#ccc' }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">Cor Selecionada</span>
                        <span className="text-sm font-black uppercase leading-none text-primary">{currentEstimate.color}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-on-surface-variant text-[10px] font-bold uppercase">Subtotal</p>
                <p className="font-black text-[#191c1e]">
                  {formatCurrency(currentEstimate.materialCost || 0)}
                </p>
              </div>
            </motion.div>
          )}

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
            {currentEstimate.includePaint && (
              <>
                <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant text-sm">Produto</span>
                  <span className="text-[#191c1e] font-bold text-sm text-right">
                    {currentEstimate.productId ? `${product.name} (${product.finish})` : 'Não especificado'}
                  </span>
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
                    1L = {product.yieldPerLiter}m² (Cálculo p/ 2 demãos)
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Tamanho do Imóvel</span>
              <span className="text-[#191c1e] font-bold text-sm">{currentEstimate.area} m²</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-sm">Forma de Cobrança</span>
              <span className="text-[#191c1e] font-bold text-sm">
                {currentEstimate.pricingType ? (pricingLabels[currentEstimate.pricingType] || currentEstimate.pricingType) : 'Não informado'}
              </span>
            </div>
            {currentEstimate.pricingType === 'm2' && (
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                <span className="text-on-surface-variant text-sm">Preço por m²</span>
                <span className="text-[#191c1e] font-bold text-sm">{formatCurrency(currentEstimate.pricePerM2 || 0)}</span>
              </div>
            )}
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
          {user && (
            <button 
              onClick={() => router.push('/review')}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-150 transition-transform"
            >
              <Send size={20} />
              Revisar e Enviar para Cliente
            </button>
          )}

          {!user && (
            <a 
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!businessPhone) {
                  e.preventDefault();
                  alert('O consultor ainda não configurou o número de WhatsApp.');
                }
              }}
              className="w-full bg-gradient-to-b from-[#25D366] to-[#128C7E] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-150 transition-transform"
            >
              <Send size={20} />
              Enviar Orçamento para o Consultor
            </a>
          )}
          
          <button 
            onClick={() => router.push('/schedule')}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md active:scale-95 duration-150 transition-transform"
          >
            <CalendarIcon size={20} />
            Agendar Consulta Online
          </button>
          <button 
            onClick={() => alert('Funcionalidade de exportação para PDF em desenvolvimento.')}
            className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform"
          >
            <FileText size={20} />
            Exportar PDF do Orçamento
          </button>
        </div>

        {/* Material Selection Insight */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mt-8 bg-primary/5 border border-outline-variant/10">
          <Image 
            src="https://images.unsplash.com/photo-1595844730298-b960ff98fee0?q=80&w=800&auto=format&fit=crop" 
            alt="Pintura Profissional"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <div>
              <p className="text-white text-sm font-bold tracking-tight">Qualidade Premium</p>
              <p className="text-white/70 text-[10px] uppercase tracking-widest">Cálculo baseado em tintas de alto rendimento.</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
