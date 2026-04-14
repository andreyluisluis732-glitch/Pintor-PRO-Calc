import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, Trophy, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AdPage() {
  const checkoutUrl = "https://pay.cakto.com.br/qim4js2_840385";

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30">
      {/* Floating Badge */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl"
        >
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[8px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">+1.200 Pintores já usam</span>
        </motion.div>
        
        <Link 
          to="/login"
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          Já sou membro? Entrar
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-architectural-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-[0.4em] mb-12 border border-blue-500/30"
          >
            <Trophy size={16} />
            O Aplicativo Definitivo para Pintura
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-12"
          >
            PARE DE DAR <span className="text-blue-500">DESCONTO</span> <br className="hidden md:block" /> E COMECE A DAR <span className="text-blue-500">RESULTADO!</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl text-slate-400 mb-16 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            A ferramenta que separa os "curiosos" dos <span className="text-white font-bold underline decoration-blue-500 underline-offset-8">Pintores de Elite</span>. Gere orçamentos profissionais em segundos e feche serviços 3x mais caros.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <a 
              href={checkoutUrl}
              className="w-full max-w-sm bg-blue-600 text-white px-10 py-6 rounded-2xl font-black text-xl shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95 transition-all group flex items-center justify-center gap-4"
            >
              QUERO SER UM PINTOR PRO
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </a>
            <div className="flex items-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Acesso Imediato</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Suporte VIP</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl font-black text-blue-500 mb-1">10s</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Para gerar um PDF</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-500 mb-1">+45%</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Taxa de fechamento</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-500 mb-1">ZERO</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Erro de cálculo</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-500 mb-1">100%</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Profissionalismo</p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black leading-tight">O mercado mudou. <br />Você vai ficar pra trás?</h2>
            <p className="text-slate-400 leading-relaxed">
              O cliente de hoje não quer mais saber de "preço de cabeça". Ele quer ver profissionalismo, transparência e tecnologia. 
              <br /><br />
              Se você ainda manda o preço por mensagem de texto ou anota em papel de pão, você está deixando dinheiro na mesa.
            </p>
            <ul className="space-y-4">
              {[
                "Cálculos precisos de tinta e materiais",
                "Orçamentos em PDF com sua marca",
                "Histórico de clientes na palma da mão",
                "Agenda de visitas organizada"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <CheckCircle2 size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-[100px] opacity-20" />
            <div className="relative bg-slate-800 border border-white/10 p-4 rounded-[2.5rem] shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop" 
                alt="Pintor Profissional" 
                className="rounded-[2rem] w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 p-6 rounded-3xl shadow-xl">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 pointer-events-none opacity-10" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8">Sua carreira profissional começa por apenas R$ 50,00/mês</h2>
          <p className="text-xl text-slate-400 mb-12">Menos que o preço de um galão de tinta para transformar seu negócio para sempre.</p>
          
          <a 
            href={checkoutUrl}
            className="inline-flex items-center gap-4 bg-white text-slate-900 px-12 py-6 rounded-2xl font-black text-xl shadow-2xl hover:bg-slate-100 active:scale-95 transition-all group"
          >
            GARANTIR MEU ACESSO
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </a>
          
          <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-500">
            Garantia incondicional de 7 dias
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-600">
        <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Pintor PRO Calc - A Revolução na Pintura</p>
      </footer>
    </div>
  );
}
