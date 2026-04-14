import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Phone, User, CheckCircle2, Share2, Copy, LogIn, HelpCircle, Download, Crown, ExternalLink, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useEstimate } from '../context/EstimateContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { businessPhone, defaultPrices, updateSettings, user, logout, isPro, deferredPrompt } = useEstimate();
  const [phone, setPhone] = useState(businessPhone);
  const [prices, setPrices] = useState(defaultPrices);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPhone(businessPhone);
      setPrices(defaultPrices);
      // If no phone is set, start in editing mode
      if (!businessPhone) {
        setIsEditing(true);
      }
    }, 0);
  }, [businessPhone, defaultPrices]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setInstalling(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ 
      businessPhone: phone, 
      laborPricePerM2: prices.m2 || 0,
      defaultPrices: prices
    });
    setSaving(false);
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL'
    }).format(value);
  };

  const updatePrice = (type: keyof typeof prices, value: string) => {
    setPrices(prev => ({ ...prev, [type]: parseFloat(value) || 0 }));
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?mode=client`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-32">
      <header className="w-full top-0 sticky z-40 bg-[#f0f2f5]/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-[#002D5E] active:scale-95 duration-150 p-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-blue-600 italic uppercase tracking-tighter">Ajustes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/help" className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <HelpCircle size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8 max-w-md mx-auto">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
              <div>
                <h2 className="font-bold text-[#191c1e]">
                  {user ? 'Perfil Profissional' : 'Modo Convidado'}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {user ? user.email : 'Seus dados estão salvos localmente'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="business-phone">
                      Seu WhatsApp (Para receber orçamentos)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        <Phone size={18} />
                      </div>
                      <input 
                        className="w-full h-14 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium outline-none" 
                        id="business-phone" 
                        placeholder="5511999999999" 
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
                      Inclua o código do país e DDD (ex: 5511999999999)
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Tabela de Preços Padrão</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Price per M2 */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-m2">
                          Por metro quadrado (m²)
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                          <input 
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base font-medium outline-none" 
                            id="price-m2" 
                            type="number"
                            step="0.01"
                            value={prices.m2}
                            onChange={(e) => updatePrice('m2', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Price per Empreitada */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-empreitada">
                          Por empreitada (obra fechada)
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                          <input 
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base font-medium outline-none" 
                            id="price-empreitada" 
                            type="number"
                            step="0.01"
                            value={prices.empreitada}
                            onChange={(e) => updatePrice('empreitada', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Price per Diária */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-diaria">
                          Por diária
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                          <input 
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base font-medium outline-none" 
                            id="price-diaria" 
                            type="number"
                            step="0.01"
                            value={prices.diaria}
                            onChange={(e) => updatePrice('diaria', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Price per Ambiente */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-ambiente">
                          Por ambiente / cômodo
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                          <input 
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base font-medium outline-none" 
                            id="price-ambiente" 
                            type="number"
                            step="0.01"
                            value={prices.ambiente}
                            onChange={(e) => updatePrice('ambiente', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Price per Serviço Específico */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-especifico">
                          Por serviço específico
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                          <input 
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base font-medium outline-none" 
                            id="price-especifico" 
                            type="number"
                            step="0.01"
                            value={prices.especifico}
                            onChange={(e) => updatePrice('especifico', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Price for Mão de obra + material */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-completo">
                          Mão de obra + material
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                          <input 
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base font-medium outline-none" 
                            id="price-completo" 
                            type="number"
                            step="0.01"
                            value={prices.completo}
                            onChange={(e) => updatePrice('completo', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-150 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="animate-pulse">Salvando...</span>
                    ) : saved ? (
                      <>
                        <CheckCircle2 size={20} />
                        Salvo com Sucesso
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Salvar Configurações
                      </>
                    )}
                  </button>
                  {businessPhone && (
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="w-full py-2 text-on-surface-variant font-bold text-xs uppercase tracking-widest underline text-center"
                    >
                      Cancelar
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seu WhatsApp</p>
                        <p className="text-lg font-black text-primary">{businessPhone || 'Não configurado'}</p>
                      </div>
                      <Phone size={20} className="text-primary/40" />
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tabela de Preços</p>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">Por m²</p>
                          <p className="font-bold text-sm">{formatCurrency(prices.m2)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">Empreitada</p>
                          <p className="font-bold text-sm">{formatCurrency(prices.empreitada)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">Diária</p>
                          <p className="font-bold text-sm">{formatCurrency(prices.diaria)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">Ambiente</p>
                          <p className="font-bold text-sm">{formatCurrency(prices.ambiente)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">Específico</p>
                          <p className="font-bold text-sm">{formatCurrency(prices.especifico)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">Completo</p>
                          <p className="font-bold text-sm">{formatCurrency(prices.completo)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-white border-2 border-primary text-primary py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-all"
                  >
                    <Save size={20} />
                    Editar Configurações
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <Crown size={18} className={isPro ? "text-yellow-500" : "text-slate-400"} />
              {isPro ? 'Você é PRO!' : 'Seja PRO'}
            </h3>
            
            {isPro ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    Parabéns! Você tem acesso a todas as funcionalidades exclusivas do Pintor PRO Calc.
                  </p>
                </div>
                <button 
                  onClick={() => updateSettings({ isPro: false })}
                  className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest underline text-center"
                >
                  Desativar Modo PRO (Teste)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Desbloqueie recursos exclusivos, remova limites e profissionalize ainda mais seus orçamentos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Histórico ilimitado de orçamentos
                  </li>
                  <li className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Sincronização em nuvem automática
                  </li>
                  <li className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Suporte prioritário
                  </li>
                </ul>
                <a 
                  href="https://pay.cakto.com.br/qim4js2_840385" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
                >
                  <Crown size={20} />
                  Quero ser PRO agora
                  <ExternalLink size={16} />
                </a>
                <button 
                  onClick={() => updateSettings({ isPro: true })}
                  className="w-full py-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest underline text-center"
                >
                  Simular Ativação PRO (Teste)
                </button>
                <Link 
                  to="/vendas" 
                  className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 hover:underline"
                >
                  Ver Detalhes da Oferta
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <Download size={18} className="text-primary" />
              Aplicativo no Celular
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Instale o Pintor PRO Calc na sua tela de início para acessar rapidamente, mesmo sem internet.
            </p>
            
            {deferredPrompt ? (
              <button 
                onClick={handleInstall}
                disabled={installing}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {installing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                Instalar Aplicativo
              </button>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Como instalar:</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  No Android: Toque nos <span className="font-bold">três pontinhos</span> e selecione <span className="font-bold">"Instalar Aplicativo"</span>.
                  <br /><br />
                  No iPhone: Toque no ícone de <span className="font-bold">compartilhar</span> e selecione <span className="font-bold">"Adicionar à Tela de Início"</span>.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <Share2 size={18} className="text-primary" />
              Compartilhar com Clientes
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Envie este link para que seus clientes possam fazer orçamentos por conta própria.
            </p>
            <button 
              onClick={handleCopyLink}
              className="w-full bg-surface-container-high text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 duration-150 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={20} className="text-green-600" />
                  Link Copiado!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copiar Link do App
                </>
              )}
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <Download size={18} className="text-primary" />
              Baixar App no Celular
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Você pode instalar este aplicativo diretamente no seu celular para acessar mais rápido, como se fosse um app da Google Play Store.
            </p>
            
            <div className="space-y-4">
              {deferredPrompt && (
                <button 
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mb-4 disabled:opacity-50"
                >
                  {installing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  Instalar Aplicativo Agora
                </button>
              )}
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No Android (Chrome)</p>
                <p className="text-xs text-slate-600">Clique nos <span className="font-bold">três pontinhos</span> no topo do navegador e selecione <span className="font-bold">"Instalar Aplicativo"</span>.</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No iPhone (Safari)</p>
                <p className="text-xs text-slate-600">Clique no ícone de <span className="font-bold">Compartilhar</span> (quadrado com seta) e selecione <span className="font-bold">"Adicionar à Tela de Início"</span>.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-blue-800 font-bold text-sm mb-2">Como funciona?</h3>
            <p className="text-blue-700 text-xs leading-relaxed">
              Ao configurar seu número, todos os orçamentos gerados pelos clientes serão enviados diretamente para o seu WhatsApp pessoal. Isso facilita o contato imediato e o fechamento de novos serviços.
            </p>
          </div>

          {user && (
            <div className="pt-4">
              <button 
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-3 border border-red-100 active:scale-95 duration-150 transition-all"
              >
                <LogIn size={20} className="rotate-180" />
                Sair da Conta {('isLocal' in user) ? 'Local' : ''}
              </button>
            </div>
          )}

          {!user && (
            <div className="pt-4">
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-150 transition-all"
              >
                <LogIn size={20} />
                Fazer Login para Sincronizar
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest font-bold">
                Salve seus dados na nuvem e acesse de qualquer lugar
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
