'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle, Send, Loader2, CheckCircle2, Info, Calculator, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { GoogleGenAI } from "@google/genai";

export default function HelpPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleGetHelp = async () => {
    if (!difficulty.trim()) return;
    
    setLoading(true);
    setAiResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `O usuário está com a seguinte dificuldade no aplicativo Pintor PRO Calc: "${difficulty}". 
        O aplicativo serve para calcular orçamentos de pintura (mão de obra e materiais) e agendar consultas técnicas.
        Por favor, forneça uma explicação clara, amigável e passo a passo de como ele deve proceder para resolver essa dificuldade ou realizar o que deseja (seja um orçamento ou uma consulta). 
        Responda em Português do Brasil.`,
      });

      setAiResponse(response.text || "Desculpe, não consegui gerar uma resposta no momento. Tente novamente.");
    } catch (error) {
      console.error("Erro ao chamar Gemini:", error);
      setAiResponse("Ocorreu um erro ao processar sua solicitação. Por favor, verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-xl font-bold text-[#002D5E]">Centro de Ajuda</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-4 space-y-8">
        {/* AI Assistant Section */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Assistente Inteligente</h2>
              <p className="text-xs text-on-surface-variant">Descreva sua dúvida e eu te ajudo!</p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea 
              className="w-full p-4 bg-[#f0f2f5] rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all min-h-[120px] text-sm resize-none"
              placeholder="Ex: Não estou conseguindo calcular a área das paredes..."
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />
            <button 
              onClick={handleGetHelp}
              disabled={loading || !difficulty.trim()}
              className="w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Obter Ajuda Agora
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {aiResponse && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10"
              >
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Sugestão do Sistema</span>
                </div>
                <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Static Guides Section */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest px-2">Guias Rápidos</h2>
          
          <div className="space-y-4">
            {/* Estimate Guide */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Calculator size={24} />
                <h3 className="font-bold">Como fazer um Orçamento</h3>
              </div>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Clique em <b>&quot;Orçamento Completo&quot;</b> na tela inicial.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Preencha os dados do cliente e o <b>tamanho do imóvel (m²)</b>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Escolha se deseja incluir o valor da tinta ou apenas calcular a quantidade.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                  <span>Selecione o produto e a cor desejada (ou pule se for apenas mão de obra).</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                  <span>Adicione fotos do local para maior precisão e clique em <b>&quot;Próximo&quot;</b>.</span>
                </li>
              </ul>
            </div>

            {/* Consultation Guide */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <MessageSquare size={24} />
                <h3 className="font-bold">Como agendar Consultoria</h3>
              </div>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Clique em <b>&quot;Consultoria Técnica&quot;</b> na tela inicial.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Preencha seu nome, WhatsApp e endereço.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Escolha a <b>data e o horário</b> de sua preferência no calendário.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                  <span>Adicione informações complementares sobre o que precisa ser avaliado.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                  <span>Clique em <b>&quot;Agendar&quot;</b> para enviar a solicitação via WhatsApp.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Ainda com dúvidas?</h4>
            <p className="text-xs text-on-surface-variant">Nossa equipe técnica está à disposição para ajudar.</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
