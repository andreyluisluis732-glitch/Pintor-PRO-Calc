import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Zap, 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Image as ImageIcon,
  Ruler,
  Palette,
  Layers
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { analyzePropertyPhoto, generatePreviewImage } from '../services/geminiService';

export default function AIEstimate() {
  const navigate = useNavigate();
  const { calculateEstimate, saveEstimate, businessPhone } = useEstimate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  
  // Form Data
  const [photo, setPhoto] = useState<string | null>(null);
  const [details, setDetails] = useState({
    area: '',
    colors: '',
    materialType: 'Pintura Simples', // Pintura Simples, Massa Corrida, Textura, Grafiato
    notes: ''
  });
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processSmartEstimate = async () => {
    if (!photo) return;
    
    setLoading(true);
    setLoadingStatus('Analisando sua foto com Inteligência Artificial...');
    
    try {
      // 1. Analyze photo
      const base64Content = photo.split(',')[1];
      const aiData = await analyzePropertyPhoto(base64Content, `
        Área aproximada: ${details.area}m2. 
        Cores desejadas: ${details.colors}. 
        Tipo de material: ${details.materialType}. 
        Observações: ${details.notes}
      `);

      setLoadingStatus('Gerando prévia visual do projeto...');
      
      // 2. Generate Preview Image
      let previewUrl = '';
      try {
        previewUrl = await generatePreviewImage(base64Content, `Cores: ${details.colors}, Acabamento: ${details.materialType}`);
      } catch (err) {
        console.warn("Failed to generate preview image:", err);
      }

      setLoadingStatus('Calculando orçamento detalhado...');

      // 3. Create the estimate
      const estimateData = {
        clientName: contact.name,
        clientPhone: contact.phone,
        clientEmail: contact.email,
        title: `Smart IA - ${contact.name}`,
        propertyType: aiData.propertyType as any,
        area: aiData.estimatedArea || Number(details.area) || 50,
        includePaint: true,
        pricingType: 'completo' as any,
        fixedPrice: aiData.estimatedLaborCost,
        materialCost: aiData.estimatedMaterialCost,
        totalCost: aiData.estimatedLaborCost + aiData.estimatedMaterialCost,
        notes: aiData.description + (details.notes ? `\n\nNotas do cliente: ${details.notes}` : ''),
        aiPhotoUrl: photo,
        aiPreviewUrl: previewUrl,
        isAiGenerated: true,
        status: 'Aguardando' as any,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        packageSize: 'bucket' as any,
        totalLiters: 0,
        packageCount: 0,
        laborCost: aiData.estimatedLaborCost
      };

      // 4. Save to database
      const estimateId = await saveEstimate(estimateData as any);
      
      // 5. Navigate to results
      if (estimateId) {
        navigate(`/results/${estimateId}?mode=client`);
      }

    } catch (error) {
      console.error("AI Estimation failed:", error);
      alert("Ocorreu um erro ao processar seu orçamento com IA. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ORÇAMENTO SMART IA</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Capture uma foto e deixe nossa IA calcular tudo para você.</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-xl mx-auto px-6 -mt-3">
        <div className="bg-white rounded-full h-1.5 w-full overflow-hidden border border-slate-100 p-0.5">
          <motion.div 
            initial={{ width: '33.33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-blue-600 rounded-full"
          />
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Camera className="text-blue-600" size={20} />
                  FOTO DO IMÓVEL
                </h2>

                <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                  {photo ? (
                    <>
                      <img src={photo} alt="Upload" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPhoto(null)}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-red-500 shadow-sm hover:bg-white transition-all"
                      >
                        Remover
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <span className="text-slate-900 font-bold text-sm">Toque para enviar ou tirar foto</span>
                      <span className="text-slate-400 text-xs mt-1">Formatos aceitos: JPG, PNG</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>

                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Ruler size={18} />
                    </div>
                    <input 
                      type="number" 
                      placeholder="Área Aproximada (m2) - Opcional"
                      value={details.area}
                      onChange={e => setDetails({...details, area: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Palette size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Cores de preferência"
                      value={details.colors}
                      onChange={e => setDetails({...details, colors: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['Pintura Simples', 'Massa Corrida', 'Textura', 'Grafiato'].map(mat => (
                      <button
                        key={mat}
                        onClick={() => setDetails({...details, materialType: mat})}
                        className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-tight transition-all border-2 ${
                          details.materialType === mat 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={!photo}
                onClick={nextStep}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                PRÓXIMO PASSO
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  SEUS DADOS
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Seu Nome Completo"
                      value={contact.name}
                      onChange={e => setContact({...contact, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Seu melhor E-mail"
                      value={contact.email}
                      onChange={e => setContact({...contact, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="Seu WhatsApp"
                      value={contact.phone}
                      onChange={e => setContact({...contact, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-blue-600 shrink-0" size={20} />
                    <p className="text-blue-800 text-xs font-medium leading-relaxed">
                      Seus dados serão usados apenas para que o consultor profissional possa entrar em contato com você após a geração do orçamento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-white border border-slate-200 text-slate-500 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                >
                  VOLTAR
                </button>
                <button
                  disabled={!contact.name || !contact.phone}
                  onClick={processSmartEstimate}
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  GERAR ORÇAMENTO IA
                  <Zap size={20} fill="currentColor" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-xs w-full space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-full h-full bg-slate-800 rounded-3xl border border-slate-700/50 flex items-center justify-center text-blue-500 overflow-hidden">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white text-xl font-black tracking-tight uppercase">Processando...</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">{loadingStatus}</p>
              </div>

              <div className="flex justify-center gap-1">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
