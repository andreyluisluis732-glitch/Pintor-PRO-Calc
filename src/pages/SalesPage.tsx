import React from 'react';
import { CheckCircle2, Calculator, Send, FileText, Smartphone, ShieldCheck, ArrowRight, Star, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SalesPage() {
  const checkoutUrl = "https://pay.cakto.com.br/qim4js2_840385";

  const features = [
    {
      icon: <Calculator className="text-blue-600" size={24} />,
      title: "Cálculos de Precisão",
      description: "Chega de 'olhômetro'. Calcule a quantidade exata de tinta e o valor da mão de obra em segundos."
    },
    {
      icon: <FileText className="text-blue-600" size={24} />,
      title: "PDF Profissional",
      description: "Gere orçamentos em PDF com sua marca e envie direto para o cliente. Passe mais credibilidade."
    },
    {
      icon: <Send className="text-blue-600" size={24} />,
      title: "Integração WhatsApp",
      description: "Envie o resumo do orçamento direto para o WhatsApp do cliente com um clique."
    },
    {
      icon: <Smartphone className="text-blue-600" size={24} />,
      title: "App no Celular",
      description: "Funciona como um aplicativo nativo. Acesse de qualquer lugar, mesmo sem internet estável."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 px-6 flex items-center justify-between">
        <div className="font-black text-xl tracking-tighter text-blue-600">Pintor PRO</div>
        <Link 
          to="/login"
          className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
        >
          Entrar
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          >
            <Zap size={14} />
            O App #1 para Pintores Profissionais
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-6"
          >
            Pare de Perder Dinheiro com <span className="text-blue-600">Orçamentos Errados</span> e Clientes que não Valorizam seu Trabalho!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transforme seu celular em uma ferramenta de elite. Gere orçamentos profissionais em PDF, calcule materiais com precisão e feche mais serviços com o <strong>Pintor PRO Calc</strong>.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <a 
              href={checkoutUrl}
              className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all group"
            >
              QUERO MEU ACESSO AGORA
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="mt-4 text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-green-500" />
              Pagamento 100% Seguro via Cakto
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 top-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -right-20 bottom-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
      </section>

      {/* App Preview Section */}
      <section className="py-12 px-6">
        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-3xl opacity-20 -z-10" />
          <img 
            src="https://images.unsplash.com/photo-1589939705384-5185138a047a?q=80&w=800&auto=format&fit=crop" 
            alt="App Preview" 
            className="rounded-[2.5rem] shadow-2xl border-8 border-slate-900 w-full aspect-[9/19] object-cover"
          />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Calculator size={16} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-900">Orçamento Gerado!</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Por que você precisa do Pintor PRO Calc?</h2>
            <p className="text-slate-600">Desenvolvido por quem entende a realidade do pintor no dia a dia.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-3 leading-tight">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl md:text-4xl font-black leading-tight">Como funciona o seu novo assistente de bolso:</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold mb-1">Insira os dados da obra</h4>
                    <p className="text-sm text-slate-600">Coloque a metragem, o tipo de superfície e o produto escolhido.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold mb-1">O App faz a mágica</h4>
                    <p className="text-sm text-slate-600">Calculamos automaticamente a quantidade de latas/baldes e o valor total da sua mão de obra.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold mb-1">Envie e Feche o Serviço</h4>
                    <p className="text-sm text-slate-600">Gere o PDF profissional ou envie o resumo via WhatsApp em menos de 10 segundos.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-blue-600 rounded-[3rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Star size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="white" />)}
                </div>
                <p className="text-lg italic font-medium leading-relaxed">
                  "Depois que comecei a usar o Pintor PRO, meus clientes pararam de pedir desconto. O orçamento em PDF passa uma imagem de empresa séria que eu não tinha antes."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20" />
                  <div>
                    <p className="font-bold text-sm">Ricardo Souza</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-70">Pintor Profissional há 12 anos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-architectural-grid" />
        
        <div className="max-w-xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Oferta Especial de Lançamento</h2>
          <p className="text-slate-400 mb-10">Tenha acesso completo ao aplicativo que vai mudar o seu jogo na pintura.</p>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Assinatura Mensal
            </div>
            
            <div className="mb-8">
              <p className="text-slate-400 line-through text-sm mb-1">De R$ 97,00 por apenas</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold">R$</span>
                <span className="text-7xl font-black tracking-tighter">50,00</span>
                <span className="text-xl font-bold text-slate-400">/mês</span>
              </div>
              <p className="text-slate-400 text-xs mt-2">Cancele quando quiser. Sem fidelidade.</p>
            </div>

            <ul className="text-left space-y-4 mb-10 max-w-xs mx-auto">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="text-green-500" size={18} />
                Acesso Completo ao App
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="text-green-500" size={18} />
                Gerador de PDF Ilimitado
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="text-green-500" size={18} />
                Histórico em Nuvem
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="text-green-500" size={18} />
                Suporte VIP via WhatsApp
              </li>
            </ul>

            <a 
              href={checkoutUrl}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              QUERO SER PRO AGORA
              <ArrowRight size={20} />
            </a>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 opacity-50">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Garantia de 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Acesso Imediato</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-blue-600 font-black tracking-tighter text-2xl italic uppercase mb-4">
            Pintor PRO Calc
          </div>
          <p className="text-slate-400 text-xs mb-8">
            © 2026 Pintor PRO Calc. Todos os direitos reservados.
          </p>
          <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600">Termos de Uso</a>
            <a href="#" className="hover:text-blue-600">Privacidade</a>
            <a href="#" className="hover:text-blue-600">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
