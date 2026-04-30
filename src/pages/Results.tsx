import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Paintbrush, HardHat, Settings, Send, FileText, Bookmark, Calendar as CalendarIcon, HelpCircle, AlertCircle, X, Copy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import BottomNav from '../components/BottomNav';
import { useEstimate, Estimate } from '../context/EstimateContext';
import { PRODUCT_CATALOG } from '../constants/catalog';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { estimateId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const search = location.search;
  const urlParams = new URLSearchParams(search);
  const isClientMode = urlParams.get('mode') === 'client';
  const consultantId = urlParams.get('consultant');
  const isClientView = isClientMode || !!consultantId;
  const currentConsultantId = consultantId || user?.uid;
  
  const clientParam = isClientView 
    ? `?mode=client${currentConsultantId ? `&consultant=${currentConsultantId}` : ''}` 
    : '';

  const shareParam = `?mode=client${currentConsultantId ? `&consultant=${currentConsultantId}` : ''}`;

  const { currentEstimate, setCurrentEstimate, saveEstimate, getEstimate, user, businessPhone, isPro } = useEstimate();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!!estimateId);

  useEffect(() => {
    if (estimateId) {
      const loadEstimate = async () => {
        setLoading(true);
        try {
          const est = await getEstimate(estimateId);
          if (est) {
            setCurrentEstimate(est);
            setSaved(true);
          } else {
            setError("Orçamento não encontrado.");
          }
        } catch {
          setError("Erro ao carregar orçamento.");
        } finally {
          setLoading(false);
        }
      };
      loadEstimate();
    }
  }, [estimateId, getEstimate, setCurrentEstimate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Orçamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f0f2f5]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Ops! Ocorreu um erro</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <Link to={`/calculate${clientParam}`} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
          Voltar para Início
        </Link>
      </div>
    );
  }

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
      const savedId = await saveEstimate(currentEstimate as Estimate);
      if (typeof savedId === 'string') {
        setCurrentEstimate({ ...currentEstimate, id: savedId });
      }
      setSaved(true);
      setSuccess('Orçamento salvo com sucesso!');
    } catch {
      setError('Erro ao salvar orçamento. Verifique sua conexão.');
    }
  };

  const handleSendToWhatsApp = async () => {
    const targetPhone = (user && currentEstimate.clientPhone) ? currentEstimate.clientPhone : businessPhone;
    
    if (!targetPhone) {
      setError(user ? 'O cliente não informou o WhatsApp.' : 'O consultor ainda não configurou o número de WhatsApp.');
      return;
    }

    setLoading(true);
    // Auto-save if not already saved
    let currentId = currentEstimate.id;
    if (!currentId) {
      try {
        const id = await saveEstimate(currentEstimate as Estimate);
        if (id) {
          currentId = id;
          setCurrentEstimate({ ...currentEstimate, id: id });
        }
      } catch (err) {
        console.warn("Could not auto-save estimate before sending:", err);
      }
    }
    setLoading(false);

    const locationParts = [currentEstimate.location, currentEstimate.neighborhood, currentEstimate.city].filter(Boolean);
    const location = locationParts.join(', ');
    
    let phone = targetPhone.replace(/\D/g, '');
    if (phone.length === 10 || phone.length === 11) {
      if (!phone.startsWith('55')) {
        phone = '55' + phone;
      }
    }

    if (!phone) {
      setError('Número de WhatsApp inválido.');
      return;
    }

    const isProfessional = !!user;
    let message = `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🎨 *ORÇAMENTO PINTOR PRO*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (isProfessional) {
      message += `Olá *${currentEstimate.clientName || 'Cliente'}*! Aqui está o resumo detalhado do orçamento solicitado:\n\n`;
    } else {
      message += `Olá! Acabei de gerar um orçamento pelo seu aplicativo e gostaria de uma análise profissional:\n\n`;
    }
    
    message += `📌 *DADOS DO PROJETO*\n`;
    if (currentEstimate.clientName) message += `👤 Cliente: ${currentEstimate.clientName}\n`;
    message += `🏠 Tipo: ${currentEstimate.propertyType || 'Não informado'}\n`;
    if (location) message += `📍 Local: ${location}\n`;
    message += `📐 Área: ${currentEstimate.area} m²\n\n`;
    
    message += `🛠️ *DADOS DO SERVIÇO*\n`;
    if (currentEstimate.isAiGenerated) {
      message += `🤖 *GERADO POR IA SMART*\n`;
      message += `📝 Descrição IA: ${currentEstimate.notes?.substring(0, 200)}...\n`;
    } else {
      message += `💰 Cobrança: ${currentEstimate.pricingType ? pricingLabels[currentEstimate.pricingType] : 'Não informado'}\n`;
      if (currentEstimate.pricingType === 'm2') {
        message += `💵 Valor/m²: ${formatCurrency(currentEstimate.pricePerM2 || 0)}\n`;
      }
    }
    
    if (currentEstimate.productId && currentEstimate.includePaint) {
      message += `\n🧴 *MATERIAL SUGERIDO*\n`;
      message += `🔹 Produto: ${product.name}\n`;
      if (currentEstimate.color) message += `🎨 Cor: ${currentEstimate.color}\n`;
      message += `📦 Qtd: ${currentEstimate.packageCount} ${currentEstimate.packageSize === 'bucket' ? 'Balde(s)' : currentEstimate.packageSize === 'can' ? 'Lata(s)' : 'Litro(s)'}\n`;
    }
    
    message += `\n💵 *INVESTIMENTO TOTAL*\n`;
    message += `💎 *${formatCurrency(currentEstimate.totalCost || 0)}*\n`;

    if (currentId) {
      const shareUrl = `${window.location.origin}/results/${currentId}${shareParam}`;
      message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🔗 *DETALHES E FOTOS IA:*\n${shareUrl}\n`;
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += isProfessional 
      ? `_Fico à disposição para fechar o serviço!_` 
      : `_Aguardando seu retorno para visita técnica!_`;
    
    message += `\n\n_Gerado por Pintor PRO Calc_`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleCopyLink = () => {
    if (!currentEstimate.id) {
      setError("Salve o orçamento primeiro para gerar um link exclusivo.");
      return;
    }
    const shareUrl = `${window.location.origin}/results/${currentEstimate.id}${shareParam}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSuccess("Link copiado para a área de transferência!");
    });
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
      doc.text(currentEstimate.isAiGenerated ? 'ORÇAMENTO GERADO POR INTELIGÊNCIA ARTIFICIAL' : 'ORÇAMENTO DE PINTURA PROFISSIONAL', 20, 32);
      
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

      autoTable(doc, {
        startY: 60,
        head: [['Item', 'Detalhes']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 45, 94] },
        margin: { left: 20, right: 20 }
      });

      // @ts-expect-error doc.lastAutoTable is added by jspdf-autotable
      const finalY = doc.lastAutoTable.finalY + 20;

      // costs
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INVESTIMENTO ESTIMADO', 20, finalY);

      const costData = [];
      if (currentEstimate.laborCost) {
        costData.push(['Mão de Obra', formatCurrency(currentEstimate.laborCost)]);
      }
      if (currentEstimate.materialCost) {
        costData.push(['Material Estimado', formatCurrency(currentEstimate.materialCost)]);
      }
      costData.push(['VALOR TOTAL', formatCurrency(currentEstimate.totalCost || 0)]);

      autoTable(doc, {
        startY: finalY + 5,
        body: costData,
        theme: 'plain',
        styles: { fontSize: 12, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 20, right: 20 }
      });

      if (currentEstimate.notes) {
        // @ts-expect-error doc.lastAutoTable is added by jspdf-autotable
        const notesY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.text('OBSERVAÇÕES:', 20, notesY);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(currentEstimate.notes, pageWidth - 40);
        doc.text(splitNotes, 20, notesY + 7);
      }

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Gerado via Pintor PRO Calc - Precisão Arquitetônica para Pintores', pageWidth / 2, pageHeight - 10, { align: 'center' });

      const fileName = `Orcamento_${(currentEstimate.clientName || 'Pintura').replace(/[^a-z0-9]/gi, '_')}.pdf`;
      doc.save(fileName);
      setSuccess('PDF gerado com sucesso!');
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
        {/* AI Comparison section */}
        {currentEstimate.isAiGenerated && currentEstimate.aiPhotoUrl && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Zap size={120} className="text-blue-500" fill="currentColor" />
              </div>
              
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Simulação Inteligente IA
              </h3>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="space-y-2">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 relative">
                    <img src={currentEstimate.aiPhotoUrl} alt="Original" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase uppercase tracking-widest leading-none">Original</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-blue-500/30 relative shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    {currentEstimate.aiPreviewUrl ? (
                      <img src={currentEstimate.aiPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-blue-600 px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase uppercase tracking-widest leading-none">Resultado IA</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-slate-400 text-[10px] font-medium leading-relaxed italic">
                  "Esta é uma representação artística gerada por IA baseada na sua foto e solicitações. As cores e proporções podem variar no serviço real."
                </p>
              </div>
            </div>
          </motion.section>
        )}

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
          {user && !currentEstimate.id && (
            <button 
              onClick={handleSave}
              className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform"
            >
              <Bookmark size={20} />
              {saved ? 'Orçamento Salvo' : 'Salvar Orçamento'}
            </button>
          )}

          {isPro && !isClientMode && currentEstimate.id && (
            <button 
              onClick={handleCopyLink}
              className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform"
            >
              <Copy size={20} />
              Copiar Link para Cliente Ver Online
            </button>
          )}
          
          {!user && (
            <div className="bg-blue-600 p-6 rounded-2xl shadow-xl space-y-4 mb-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <CalendarIcon size={24} />
                <h3 className="font-black text-lg uppercase tracking-tight leading-none">Consultoria Premium</h3>
              </div>
              <p className="text-blue-100 text-xs font-medium leading-relaxed">
                Gostou do orçamento? Agende agora uma consulta online gratuita para validar seu projeto e tirar todas as suas dúvidas com o profissional.
              </p>
              <button 
                onClick={() => navigate('/schedule' + clientParam)}
                className="w-full bg-white text-blue-600 py-4 rounded-xl font-black text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                AGENDAR CONSULTA ONLINE
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          <button 
            onClick={handleSendToWhatsApp}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-150 transition-transform ${
              user ? 'bg-gradient-to-b from-[#25D366] to-[#128C7E] text-white' : 'bg-white text-[#128C7E] border-2 border-[#25D366]'
            }`}
          >
            <Send size={20} />
            {user ? 'Enviar Orçamento para o Cliente' : 'Enviar para o Consultor no WhatsApp'}
          </button>
          
          {user && (
            <button 
              onClick={() => navigate('/schedule' + clientParam)}
              className="w-full bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md active:scale-95 duration-150 transition-transform"
            >
              <CalendarIcon size={20} />
              Agendar Consulta com Cliente
            </button>
          )}
          <button 
            onClick={handleExportPDF}
            className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-transform"
          >
            <FileText size={20} />
            Exportar PDF do Orçamento
          </button>


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

      {/* Error and Success Toasts */}
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
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-6 right-6 z-[100]"
          >
            <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} />
                <p className="text-sm font-bold">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="p-1 hover:bg-white/10 rounded-full">
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
