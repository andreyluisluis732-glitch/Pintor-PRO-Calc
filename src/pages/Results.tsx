import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Paintbrush, HardHat, Settings, Send, FileText, Bookmark, Calendar as CalendarIcon, HelpCircle, AlertCircle, X, Crown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BottomNav from '../components/BottomNav';
import { useEstimate } from '../context/EstimateContext';
import { PRODUCT_CATALOG } from '../constants/catalog';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const search = location.search;
  const isClientMode = new URLSearchParams(search).get('mode') === 'client';
  const clientParam = isClientMode ? '?mode=client' : '';
  const { currentEstimate, saveEstimate, user, businessPhone, isPro } = useEstimate();

  const product = PRODUCT_CATALOG.find(p => p.id === currentEstimate.productId) || PRODUCT_CATALOG[0];

  if (!currentEstimate.totalCost) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Nenhum cálculo encontrado</h2>
        <Link to={`/calculate${clientParam}`} className="text-primary font-bold underline">Voltar para o cálculo</Link>
      </div>
    );
  }

  const pricingLabels: Record<string, string> = {
    m2: 'Por m²',
    empreitada: 'Empreitada',
    diaria: 'Diária',
    ambiente: 'Ambiente',
    especifico: 'Específico',
    completo: 'Mão de obra + Material'
  };

  const handleSave = async () => {
    try {
      await saveEstimate({
        ...currentEstimate as {
          area: number;
          productId?: string;
          color?: string;
          packageSize?: 'liter' | 'can' | 'bucket';
          pricingType?: string;
          pricePerM2?: number;
          fixedPrice?: number;
          includePaint: boolean;
          totalLiters?: number;
          packageCount?: number;
          materialCost?: number;
          laborCost?: number;
          totalCost?: number;
          clientName?: string;
          clientPhone?: string;
          propertyType?: string;
          city?: string;
          neighborhood?: string;
          location?: string;
          mediaUrls?: string[];
          notes?: string;
        },
        id: Math.random().toString(36).substr(2, 9),
        title: currentEstimate.clientName 
          ? `${currentEstimate.propertyType || 'Obra'}: ${currentEstimate.clientName}` 
          : `${currentEstimate.propertyType || 'Projeto'} ${currentEstimate.area}m²`,
      });
      navigate('/history' + clientParam);
    } catch {
      setError('Erro ao salvar orçamento. Verifique sua conexão.');
    }
  };

  const handleSendToPainter = () => {
    if (!businessPhone) {
      setError('O consultor ainda não configurou o número de WhatsApp.');
      return;
    }

    const locationParts = [currentEstimate.location, currentEstimate.neighborhood, currentEstimate.city].filter(Boolean);
    const location = locationParts.join(', ');
    
    let phone = businessPhone.replace(/\D/g, '');
    if (phone.length >= 10 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }

    if (!phone) {
      setError('Número de WhatsApp inválido.');
      return;
    }

    let message = `*ORÇAMENTO DE PINTURA - PINTOR PRO CALC*\n\n`;
    message += `Olá! Gostaria de solicitar uma análise para o seguinte orçamento:\n\n`;
    
    if (currentEstimate.clientName) message += `👤 *Cliente:* ${currentEstimate.clientName}\n`;
    if (currentEstimate.clientPhone) message += `📞 *Contato:* ${currentEstimate.clientPhone}\n`;
    
    message += `🏠 *Tipo de Imóvel:* ${currentEstimate.propertyType || 'Não informado'}\n`;
    message += `📍 *Local:* ${location || 'Não informado'}\n`;
    message += `📐 *Área Total:* ${currentEstimate.area}m²\n`;
    
    message += `💰 *Forma de Cobrança:* ${currentEstimate.pricingType ? pricingLabels[currentEstimate.pricingType] : 'Não informado'}\n`;
    if (currentEstimate.pricingType === 'm2') {
      message += `💵 *Preço por m²:* ${formatCurrency(currentEstimate.pricePerM2 || 0)}\n`;
    }
    
    if (currentEstimate.productId && currentEstimate.includePaint) {
      message += `🧴 *Tinta:* ${product.name}${currentEstimate.color ? ` (Cor: ${currentEstimate.color})` : ''}\n`;
    } else {
      message += `🛠️ *Serviço:* Apenas Mão de Obra\n`;
      message += `⚠️ *Nota:* O cliente optou por não incluir a tinta no orçamento.\n`;
    }
    
    message += `💰 *Valor Estimado:* ${formatCurrency(currentEstimate.totalCost || 0)}\n`;

    if (currentEstimate.notes) {
      message += `\n📝 *Observações:* ${currentEstimate.notes}`;
    }

    if (currentEstimate.mediaUrls && currentEstimate.mediaUrls.length > 0) {
      message += `\n\n📸 *Fotos/Vídeos do Local:*\n${currentEstimate.mediaUrls.join('\n')}`;
    }

    message += `\n\n_Gerado via Pintor PRO Calc_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    // Open WhatsApp immediately
    try {
      window.open(whatsappUrl, '_blank');
    } catch {
      // Fallback if window.open is blocked
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.click();
    }
  };
  
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(0, 45, 94); // #002D5E
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('PINTOR PRO CALC', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ORÇAMENTO DE PINTURA PROFISSIONAL', 20, 32);
      
      // Body
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO DO PROJETO', 20, 55);
      
      const tableData = [
        ['Cliente', currentEstimate.clientName || 'Não informado'],
        ['Contato', currentEstimate.clientPhone || 'Não informado'],
        ['Tipo de Imóvel', currentEstimate.propertyType || 'Não informado'],
        ['Localização', `${currentEstimate.neighborhood || ''}${currentEstimate.neighborhood && currentEstimate.city ? ', ' : ''}${currentEstimate.city || ''}` || 'Não informado'],
        ['Área Total', `${currentEstimate.area} m²`],
        ['Forma de Cobrança', currentEstimate.pricingType ? pricingLabels[currentEstimate.pricingType] : 'Não informado'],
        ['Tinta Inclusa', currentEstimate.includePaint ? 'Sim' : 'Não'],
      ];

      if (currentEstimate.productId && currentEstimate.includePaint) {
        tableData.push(['Produto', product.name]);
        tableData.push(['Cor', currentEstimate.color || 'Padrão']);
        tableData.push(['Quantidade', `${currentEstimate.packageCount} ${currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'}`]);
      } else {
        tableData.push(['Observação', 'Cliente optou por não incluir a tinta no orçamento']);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: 60,
        head: [['Item', 'Detalhes']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 45, 94] },
        margin: { left: 20, right: 20 }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable.finalY + 20;

      // Costs
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INVESTIMENTO ESTIMADO', 20, finalY);

      const costData = [];
      if (currentEstimate.includePaint) {
        costData.push(['Material', formatCurrency(currentEstimate.materialCost || 0)]);
      }
      costData.push(['Mão de Obra', formatCurrency(currentEstimate.laborCost || 0)]);
      costData.push(['TOTAL', formatCurrency(currentEstimate.totalCost || 0)]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: finalY + 5,
        body: costData,
        theme: 'plain',
        styles: { fontSize: 12, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 20, right: 20 }
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Gerado via Pintor PRO Calc - Precisão Arquitetônica para Pintores', pageWidth / 2, pageHeight - 10, { align: 'center' });

      const fileName = `Orcamento_${(currentEstimate.clientName || 'Pintura').replace(/[^a-z0-9]/gi, '_')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    }
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
    <div className="min-h-screen bg-[#f0f2f5] text-on-surface pb-32">
      {/* Top Navigation Anchor */}
      <header className="w-full top-0 sticky z-40 bg-[#f0f2f5]/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-[#002D5E] active:scale-95 duration-150 p-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-blue-600 font-black tracking-tighter text-lg italic uppercase">Pintor PRO Calc</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/help${clientParam}`} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <HelpCircle size={18} />
            </Link>
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

          {!currentEstimate.includePaint && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3"
            >
              <HelpCircle className="text-amber-600 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-amber-900 text-xs font-medium leading-relaxed">
                <span className="font-bold block mb-1">Aviso de Material:</span>
                O cliente optou por não incluir o valor da tinta neste orçamento. O valor total reflete apenas a mão de obra.
              </p>
            </motion.div>
          )}
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
                    1L = {product.yieldPerLiter}m² / demão
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
                {currentEstimate.pricingType === 'm2' ? 'Por metro quadrado (m²)' : 
                 currentEstimate.pricingType === 'empreitada' ? 'Por empreitada (obra fechada)' :
                 currentEstimate.pricingType === 'diaria' ? 'Por diária' :
                 currentEstimate.pricingType === 'ambiente' ? 'Por ambiente / cômodo' :
                 currentEstimate.pricingType === 'especifico' ? 'Por serviço específico' : 'Mão de obra + material'}
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
              onClick={handleSave}
              className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform"
            >
              <Bookmark size={20} />
              Salvar Orçamento
            </button>
          )}
          
          <button 
            onClick={handleSendToPainter}
            className="w-full bg-gradient-to-b from-[#25D366] to-[#128C7E] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-150 transition-transform"
          >
            <Send size={20} />
            Enviar Orçamento para o Consultor
          </button>
          
          <button 
            onClick={() => navigate('/schedule' + clientParam)}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md active:scale-95 duration-150 transition-transform"
          >
            <CalendarIcon size={20} />
            Agendar Consulta Online
          </button>
          <button 
            onClick={handleExportPDF}
            className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform"
          >
            <FileText size={20} />
            Exportar PDF do Orçamento
          </button>

          {!isPro && !isClientMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group border border-white/10"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                <Crown size={80} />
              </div>
              <div className="relative z-10">
                <h3 className="text-white font-black text-lg uppercase tracking-tighter mb-4">Potencialize seu Negócio</h3>
                
                <div className="space-y-3 mb-6">
                  {[
                    "Gere links para o cliente ver online",
                    "Orçamentos em PDF com sua marca",
                    "Acesso ilimitado ao histórico",
                    "Sincronização em múltiplos aparelhos"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-tight">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to="/vendas" 
                  className="inline-flex items-center gap-2 bg-yellow-500 text-yellow-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Domine o Mercado PRO
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Material Selection Insight */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mt-8 bg-primary/5 border border-outline-variant/10">
          <img 
            src="https://images.unsplash.com/photo-1595844730298-b960ff98fee0?q=80&w=800&auto=format&fit=crop" 
            alt="Pintura Profissional"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <div>
              <p className="text-white text-sm font-bold tracking-tight">Qualidade Premium</p>
              <p className="text-white/70 text-[10px] uppercase tracking-widest">Cálculo baseado em tintas de alto rendimento.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-6 right-6 z-[100]"
          >
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-full">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
