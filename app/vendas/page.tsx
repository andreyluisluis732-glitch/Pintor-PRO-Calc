'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Paintbrush, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  MessageCircle, 
  ArrowRight,
  Star,
  Clock,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function SalesPage() {
  const checkoutUrl = "https://pay.cakto.com.br/qim4js2_840385";

  const features = [
    {
      icon: <Clock className="text-primary" />,
      title: "Orçamentos em 30 Segundos",
      description: "Pare de perder tempo com cálculos manuais. Gere orçamentos profissionais na hora, na frente do cliente."
    },
    {
      icon: <MessageCircle className="text-green-500" />,
      title: "Integração Total com WhatsApp",
      description: "Envie o orçamento direto para o celular do cliente com um link profissional e interativo."
    },
    {
      icon: <TrendingUp className="text-blue-500" />,
      title: "Feche 3x Mais Serviços",
      description: "A apresentação profissional passa confiança. Clientes preferem quem entrega um orçamento detalhado e rápido."
    },
    {
      icon: <Smartphone className="text-purple-500" />,
      title: "Tudo no seu Celular",
      description: "Acesse de qualquer lugar. Gerencie seus clientes, agendamentos e histórico de obras na palma da mão."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                O Aplicativo Nº 1 para Pintores Profissionais
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8 text-slate-900 italic">
                PARE DE PERDER DINHEIRO COM <span className="text-primary">ORÇAMENTOS AMADORES!</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
                Transforme seu celular em uma máquina de vendas. Gere orçamentos profissionais, calcule materiais e feche mais serviços em segundos.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href={checkoutUrl}
                  className="w-full sm:w-auto px-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Quero Acesso Agora
                  <ArrowRight size={20} />
                </a>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Acesso vitalício por apenas R$ 50,00
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
            <div className="flex items-center gap-2 font-black italic text-xl">PINTOR PRO</div>
            <div className="flex items-center gap-2 font-black italic text-xl">OBRA FÁCIL</div>
            <div className="flex items-center gap-2 font-black italic text-xl">MESTRE DAS CORES</div>
            <div className="flex items-center gap-2 font-black italic text-xl">REFORMA JÁ</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic mb-4">
              POR QUE VOCÊ PRECISA DISSO?
            </h2>
            <p className="text-slate-500 font-medium">O mercado mudou. Quem não é profissional, fica para trás.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The "Matadora" Offer Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <Image 
            src="https://picsum.photos/seed/painting/1920/1080?blur=10" 
            alt="Background" 
            fill 
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-16 border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">Oferta Exclusiva</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic mb-6 leading-none">
                  OFERTA ÚNICA: <br />
                  <span className="text-primary">ACESSO VITALÍCIO</span>
                </h2>
                <ul className="space-y-4 mb-10">
                  {[
                    "Gerador de Orçamentos Ilimitado",
                    "Calculadora de Tintas e Materiais",
                    "Gestão de Agendamentos e Clientes",
                    "Link de Compartilhamento Profissional",
                    "Suporte e Atualizações Gratuitas",
                    "Sem Mensalidades - Pague uma vez"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <CheckCircle2 size={20} className="text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                  Melhor Escolha
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">De R$ 197,00 por apenas</p>
                <div className="flex items-center justify-center gap-1 mb-6">
                  <span className="text-2xl font-black self-start mt-2">R$</span>
                  <span className="text-7xl md:text-8xl font-black tracking-tighter italic">50</span>
                  <span className="text-2xl font-black self-end mb-4">,00</span>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  Pagamento único. Sem taxas escondidas. <br />
                  Acesso imediato após a confirmação.
                </p>
                <a 
                  href={checkoutUrl}
                  className="w-full py-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Garantir Meu Acesso
                  <ArrowRight size={20} />
                </a>
                <div className="mt-6 flex items-center justify-center gap-4 text-slate-400">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Compra 100% Segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tighter italic mb-2">QUEM JÁ USA, RECOMENDA</h2>
            <div className="flex justify-center gap-1 text-yellow-400">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ricardo Silva",
                role: "Pintor há 12 anos",
                text: "Antes eu perdia horas fazendo conta e o cliente achava caro. Agora mando o link profissional e eles fecham na hora. Valeu cada centavo!"
              },
              {
                name: "Marcos Oliveira",
                role: "Pintura Residencial",
                text: "O cálculo de tinta é perfeito. Não sobra e nem falta material na obra. O app se pagou no primeiro serviço que fechei com ele."
              },
              {
                name: "André Santos",
                role: "Especialista em Texturas",
                text: "A organização é o que mais gostei. Tenho todos os orçamentos salvos e sei exatamente quanto ganhei no mês. Recomendo demais!"
              }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-600 italic mb-6 font-medium">&quot;{t.text}&quot;</p>
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic mb-8">
            O PRÓXIMO NÍVEL DA SUA <br />
            CARREIRA COMEÇA AQUI.
          </h2>
          <a 
            href={checkoutUrl}
            className="inline-flex px-12 py-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all items-center gap-3"
          >
            Começar Agora por R$ 50,00
            <ArrowRight size={20} />
          </a>
          <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
            Garantia de Satisfação de 7 Dias
          </p>
        </div>
      </section>

      <footer className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2026 PINTOR PRO APP - TODOS OS DIREITOS RESERVADOS
          </p>
        </div>
      </footer>
    </div>
  );
}
