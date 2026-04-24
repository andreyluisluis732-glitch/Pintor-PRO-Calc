import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, ShieldCheck, Zap, ArrowRight, Star } from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Subscription() {
  const { isTrial, trialDaysLeft, isSubscriptionExpired } = useEstimate();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    const checkoutUrl = import.meta.env.VITE_CACTU_CHECKOUT_URL || 'https://checkout.cactupay.com.br/pay/YOUR_ID_HERE';
    window.open(checkoutUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 pt-16 pb-32 px-6 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Crown size={120} className="text-white" />
        </div>

        <div className="absolute top-6 right-6 z-20">
          <Link 
            to="/login"
            className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          >
            Entrar
          </Link>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-yellow-500/30">
            <Star size={14} />
            Pintor Pro Plus
          </div>
          
          <h1 className="text-white text-4xl font-black uppercase tracking-tighter leading-none mb-4">
            Domine o <span className="text-blue-400">Mercado</span>
          </h1>
          <p className="text-white/70 text-sm font-medium max-w-xs mx-auto">
            A ferramenta definitiva para pintores que querem fechar mais serviços e profissionalizar sua marca.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/10 border border-slate-100"
        >
          {isSubscriptionExpired && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-center gap-3">
              <Zap size={20} className="text-red-500" />
              <p className="text-red-900 text-xs font-bold leading-tight uppercase tracking-tight">
                Seu período de teste grátis expirou. Assine agora para continuar usando!
              </p>
            </div>
          )}

          {!isSubscriptionExpired && isTrial && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex items-center gap-3">
              <Zap size={20} className="text-blue-600" />
              <p className="text-blue-900 text-xs font-bold leading-tight uppercase tracking-tight">
                Você ainda tem {trialDaysLeft} dias de teste gratuito. Aproveite!
              </p>
            </div>
          )}

          <div className="mb-10 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Assinatura Mensal</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-slate-900 text-lg font-black mt-2">R$</span>
              <span className="text-slate-900 text-6xl font-black tracking-tighter">49</span>
              <span className="text-slate-400 text-lg font-bold">,90</span>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase mt-2">Pagamento seguro e rápido</p>
          </div>

          <div className="space-y-5 mb-10">
            {[
              "Orçamentos em PDF com sua Marca",
              "Links exclusivos para clientes verem online",
              "Agendamento de visitas via WhatsApp",
              "Histórico ilimitado de serviços",
              "Cálculos em tempo real na nuvem",
              "Acesso em múltiplos dispositivos"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-slate-700 text-sm font-semibold tracking-tight leading-none uppercase">{feature}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={handleSubscribe}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Assinar Agora
            <ArrowRight size={18} />
          </button>

          <Link 
            to="/login"
            className="w-full mt-4 py-4 text-blue-600 border border-blue-200 rounded-2xl font-black text-xs uppercase tracking-widest active:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            Já sou Pro? Entrar
          </Link>
          
          <p className="text-slate-400 text-[10px] font-bold text-center mt-6 uppercase tracking-tight">
            Cancele a qualquer momento • Suporte Prioritário
          </p>
        </motion.div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Pagamento Seguro</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Dados Protegidos</span>
          </div>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="w-full mt-12 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest active:opacity-50 transition-all"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
