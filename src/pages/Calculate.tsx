import React, { useState, Suspense } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Ruler, Info, Palette, Tag, HelpCircle, Clock, Settings, Paintbrush, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { useEstimate, PropertyType, PricingType } from '../context/EstimateContext';
import { PRODUCT_CATALOG } from '../constants/catalog';

export default function CalculatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CalculateContent />
    </Suspense>
  );
}

function CalculateContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { calculateEstimate, laborPricePerM2, defaultPrices } = useEstimate();
  
  const isClientMode = searchParams.get('mode') === 'client';
  const clientParam = isClientMode ? `?${searchParams.toString()}` : '';
  
  const initialProductId = searchParams.get('productId') || PRODUCT_CATALOG[2].id;
  const initialProduct = PRODUCT_CATALOG.find(p => p.id === initialProductId) || PRODUCT_CATALOG[2];

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Casa');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [location, setLocation] = useState('');
  const [includePaint, setIncludePaint] = useState(true);
  const [wallSize, setWallSize] = useState('');
  const [productId, setProductId] = useState<string | undefined>(initialProductId);
  const [color, setColor] = useState<string | undefined>(initialProduct.colors[0].name);
  const [packageSize, setPackageSize] = useState<'liter' | 'can' | 'bucket'>('liter');
  const [pricingType, setPricingType] = useState<PricingType>('m2');
  const [pricePerM2, setPricePerM2] = useState('');
  const [fixedPrice, setFixedPrice] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(initialProduct.category);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const categories = Array.from(new Set(PRODUCT_CATALOG.map(p => p.category)));
  const filteredProducts = PRODUCT_CATALOG.filter(p => p.category === activeCategory);

  const handleNextStep = () => {
    if (step === 1) {
      if (!clientName) {
        setError("Por favor, informe o nome do cliente.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Allow skipping size (set to 0 if empty)
      if (!wallSize) {
        setWallSize('0');
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleSkipSize = () => {
    setWallSize('0');
    setStep(3);
    setError(null);
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleFinish = async () => {
    try {
      setError(null);
      
      calculateEstimate({
        clientName,
        clientPhone,
        propertyType,
        city,
        neighborhood,
        location,
        includePaint,
        area: parseFloat(wallSize) || 0,
        productId,
        color,
        packageSize,
        pricingType,
        pricePerM2: pricePerM2 ? parseFloat(pricePerM2) : undefined,
        fixedPrice: fixedPrice ? parseFloat(fixedPrice) : undefined,
        mediaUrls: [],
        notes
      });
      
      navigate('/results' + clientParam);
    } catch (err) {
      console.error("Erro ao processar orçamento:", err);
      setError("Ocorreu um erro ao processar o orçamento. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-on-surface pb-32">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-[#f0f2f5]/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrevStep}
              className="text-[#002D5E] active:scale-95 duration-150 p-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-black tracking-tighter text-lg italic text-blue-600 uppercase">Pintor PRO Calc</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/help${clientParam}`} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <HelpCircle size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 4 ? 'bg-primary' : 'bg-slate-200'}`}></div>
        </div>

        <section className="space-y-8">
          <header>
            <h2 className="text-2xl font-bold tracking-tight text-[#191c1e] mb-2">
              {step === 1 && "Dados do Cliente"}
              {step === 2 && "O que será pintado?"}
              {step === 3 && "Produtos e Cores"}
              {step === 4 && "Valores e Finalização"}
            </h2>
            <p className="text-on-surface-variant text-sm">
              {step === 1 && "Identificação do cliente e local da obra."}
              {step === 2 && "Detalhes sobre o imóvel e área total."}
              {step === 3 && "Escolha os materiais ou pule se já possuir."}
              {step === 4 && "Defina a forma de cobrança e feche o pedido."}
            </p>
          </header>

          <div className="space-y-6">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Client Name Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="client-name">
                    Nome do Cliente
                  </label>
                  <input 
                    className="w-full h-14 px-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium outline-none" 
                    id="client-name" 
                    placeholder="Ex: João Silva" 
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                {/* Client Phone Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="client-phone">
                    WhatsApp / Contato
                  </label>
                  <input 
                    className="w-full h-14 px-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium outline-none" 
                    id="client-phone" 
                    placeholder="(00) 00000-0000" 
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>

                {/* Location Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="city">
                      Cidade
                    </label>
                    <input 
                      className="w-full h-14 px-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium outline-none" 
                      id="city" 
                      placeholder="Ex: São Paulo" 
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="neighborhood">
                      Bairro
                    </label>
                    <input 
                      className="w-full h-14 px-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium outline-none" 
                      id="neighborhood" 
                      placeholder="Ex: Centro" 
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="location">
                    Endereço Completo
                  </label>
                  <input 
                    className="w-full h-14 px-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium outline-none" 
                    id="location" 
                    placeholder="Rua, Número, Complemento" 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Property Type Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant">Tipo de Imóvel</label>
                  <div className="flex flex-wrap gap-2">
                    {['Casa', 'Apartamento', 'Prédio', 'Galpão', 'Condomínio', 'Comercial'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setPropertyType(type as PropertyType)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                          propertyType === type
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-surface-low border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Size Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="wall-size">
                      Tamanho do imóvel (m²)
                    </label>
                    <button 
                      type="button"
                      onClick={handleSkipSize}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Pular Passo
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      className="w-full h-14 px-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium outline-none" 
                      id="wall-size" 
                      placeholder="0.00" 
                      type="number"
                      value={wallSize === '0' ? '' : wallSize}
                      onChange={(e) => setWallSize(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">m²</div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Caso não saiba o tamanho, pule este passo. O orçamento será calculado com valores básicos e precisará de ajuste manual.
                  </p>
                </div>

                {/* Paint Inclusion Toggle */}
                <label className="block bg-surface-low p-4 rounded-xl border border-outline-variant/15 cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-[#191c1e]">Incluir a tinta no orçamento?</span>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Se desativado, calcularemos a quantidade mas o custo não será somado ao total.</p>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={includePaint}
                        onChange={() => setIncludePaint(!includePaint)}
                      />
                      <div className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        includePaint ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            includePaint ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </label>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Product Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant">Escolha o Produto / Cor</label>
                    <button 
                      onClick={() => {
                        setProductId(undefined);
                        setColor(undefined);
                      }}
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-all ${
                        !productId ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      Pular Produto
                    </button>
                  </div>
                  
                  {productId && (
                    <>
                      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                              activeCategory === cat
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-surface-low border-outline-variant text-on-surface-variant hover:border-primary'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {filteredProducts.map((product) => (
                          <label 
                            key={product.id}
                            className={`group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                              productId === product.id 
                                ? 'bg-primary text-white border-primary shadow-md' 
                                : 'bg-surface-low border-transparent hover:bg-surface-container-high'
                            }`}
                          >
                            <input 
                              className="sr-only" 
                              name="product-id" 
                              type="radio"
                              checked={productId === product.id}
                              onChange={() => {
                                setProductId(product.id);
                                setColor(product.colors[0].name);
                              }}
                            />
                            <div className="flex items-center justify-between w-full mb-1">
                              <div className="flex flex-col">
                                <span className={`font-bold text-lg ${productId === product.id ? 'text-white' : 'text-[#191c1e]'}`}>{product.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${productId === product.id ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                                    {product.finish}
                                  </span>
                                  <span className={`text-xs ${productId === product.id ? 'text-white/80' : 'text-on-surface-variant'}`}>{product.description}</span>
                                </div>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                productId === product.id ? 'border-white bg-white' : 'border-outline-variant'
                              }`}>
                                {productId === product.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPackageSize('liter');
                                  setProductId(product.id);
                                }}
                                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all border ${
                                  productId === product.id && packageSize === 'liter'
                                    ? 'bg-white text-primary border-white shadow-sm scale-105'
                                    : productId === product.id 
                                      ? 'bg-white/40 text-white border-white/20 hover:bg-white/50'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                <Tag size={10} />
                                L: R$ {product.pricePerLiter.toFixed(2)}
                              </button>
                              
                              {product.pricePerCan && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPackageSize('can');
                                    setProductId(product.id);
                                  }}
                                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all border ${
                                    productId === product.id && packageSize === 'can'
                                      ? 'bg-white text-primary border-white shadow-sm scale-105'
                                      : productId === product.id 
                                        ? 'bg-white/40 text-white border-white/20 hover:bg-white/50'
                                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <Tag size={10} />
                                  Lata: R$ {product.pricePerCan.toFixed(2)}
                                </button>
                              )}
                              
                              {product.pricePerBucket && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPackageSize('bucket');
                                    setProductId(product.id);
                                  }}
                                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all border ${
                                    productId === product.id && packageSize === 'bucket'
                                      ? 'bg-white text-primary border-white shadow-sm scale-105'
                                      : productId === product.id 
                                        ? 'bg-white/40 text-white border-white/20 hover:bg-white/50'
                                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <Tag size={10} />
                                  Balde: R$ {product.pricePerBucket.toFixed(2)}
                                </button>
                              )}
                            </div>

                            {productId === product.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 pt-4 border-t border-white/20"
                              >
                                <div className="flex items-start gap-2 mb-4">
                                  <Info size={16} className="shrink-0 mt-0.5" />
                                  <p className="text-xs leading-relaxed opacity-90">{product.info}</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Palette size={12} />
                                    Escolha a Cor
                                  </span>
                                  <div className="grid grid-cols-2 gap-3">
                                    {product.colors.map((c) => (
                                      <button
                                        key={c.name}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setColor(c.name);
                                        }}
                                        className={`flex flex-col items-center p-2 rounded-xl transition-all border-2 ${
                                          color === c.name 
                                            ? 'bg-white text-primary border-white shadow-md scale-105' 
                                            : 'bg-white/20 text-white border-white/10 hover:bg-white/30'
                                        }`}
                                      >
                                        <div 
                                          className="w-full aspect-video rounded-lg mb-2 shadow-inner border border-black/10"
                                          style={{ backgroundColor: c.hex }}
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">
                                          {c.name}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {!productId && (
                    <div className="p-8 bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant text-center">
                      <Palette size={32} className="mx-auto text-on-surface-variant/40 mb-2" />
                      <p className="text-sm font-bold text-on-surface-variant">Nenhum produto selecionado</p>
                      <button 
                        onClick={() => setProductId(initialProductId)}
                        className="mt-4 text-xs font-bold text-primary uppercase tracking-widest underline"
                      >
                        Selecionar um produto
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Pricing Type Selection */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant">
                    Forma de Cobrança
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'm2', label: 'Por m²', icon: <Ruler size={16} /> },
                      { id: 'empreitada', label: 'Empreitada', icon: <Tag size={16} /> },
                      { id: 'diaria', label: 'Diária', icon: <Clock size={16} /> },
                      { id: 'ambiente', label: 'Ambiente', icon: <ImageIcon size={16} /> },
                      { id: 'especifico', label: 'Específico', icon: <Settings size={16} /> },
                      { id: 'completo', label: 'Mão de obra + Material', icon: <Paintbrush size={16} /> }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPricingType(type.id as PricingType)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                          pricingType === type.id 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-outline-variant bg-white text-on-surface-variant'
                        }`}
                      >
                        <div className={pricingType === type.id ? 'text-primary' : 'text-on-surface-variant/50'}>
                          {type.icon}
                        </div>
                        <span className="text-xs font-bold leading-tight">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Input based on Pricing Type */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-input">
                      {pricingType === 'm2' ? 'Preço por m²' : 'Valor do Serviço'}
                    </label>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                      Padrão: R$ {(pricingType === 'm2' ? laborPricePerM2 : defaultPrices[pricingType]).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                    <input 
                      className="w-full h-14 pl-12 pr-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium outline-none" 
                      id="price-input" 
                      placeholder={(pricingType === 'm2' ? laborPricePerM2 : defaultPrices[pricingType]).toFixed(2)} 
                      type="number"
                      value={pricingType === 'm2' ? pricePerM2 : fixedPrice}
                      onChange={(e) => pricingType === 'm2' ? setPricePerM2(e.target.value) : setFixedPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Observações Adicionais */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="notes">
                    Observações Adicionais
                  </label>
                  <textarea 
                    className="w-full min-h-32 p-4 bg-white border-2 border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium outline-none resize-none" 
                    id="notes" 
                    placeholder="Ex: Paredes com mofo, necessidade de reparos no reboco, etc." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-12 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={handlePrevStep}
                className="flex-1 h-14 bg-white border-2 border-outline-variant text-on-surface-variant font-bold rounded-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Voltar
              </button>
            )}
            
            <button 
              onClick={step === 4 ? handleFinish : handleNextStep}
              className="flex-[2] h-14 bg-gradient-to-b from-primary to-primary-container text-white font-bold rounded-md shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>{step === 4 ? "Finalizar Orçamento" : "Próximo"}</span>
              <ArrowRight size={18} />
            </button>
          </div>
          
          <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
            Cálculo baseado em normas técnicas ABNT
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
