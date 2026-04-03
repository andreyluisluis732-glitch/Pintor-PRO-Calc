'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Ruler, Info, Palette, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNav from '@/components/BottomNav';
import { Suspense, useEffect } from 'react';

import { useEstimate, PropertyType } from '@/context/EstimateContext';
import { PRODUCT_CATALOG, PaintProduct } from '@/constants/catalog';

export default function CalculatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CalculateContent />
    </Suspense>
  );
}

function CalculateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { calculateEstimate, setCurrentEstimate } = useEstimate();
  
  const initialProductId = searchParams?.get('productId') || PRODUCT_CATALOG[2].id;
  const initialProduct = PRODUCT_CATALOG.find(p => p.id === initialProductId) || PRODUCT_CATALOG[2];

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Casa');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [location, setLocation] = useState('');
  const [includePaint, setIncludePaint] = useState(true);
  const [wallSize, setWallSize] = useState('');
  const [productId, setProductId] = useState<string>(initialProductId);
  const [color, setColor] = useState<string>(initialProduct.colors[0].name);
  const [packageSize, setPackageSize] = useState<'liter' | 'can' | 'bucket'>('liter');
  const [coats, setCoats] = useState('2');
  const [pricePerM2, setPricePerM2] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(initialProduct.category);

  const categories = Array.from(new Set(PRODUCT_CATALOG.map(p => p.category)));
  const filteredProducts = PRODUCT_CATALOG.filter(p => p.category === activeCategory);
  const selectedProduct = PRODUCT_CATALOG.find(p => p.id === productId) || PRODUCT_CATALOG[0];

  const handleNext = () => {
    if (!wallSize) return;
    
    calculateEstimate({
      clientName,
      clientPhone,
      propertyType,
      city,
      neighborhood,
      location,
      includePaint,
      area: parseFloat(wallSize),
      productId,
      color,
      packageSize,
      coats: parseInt(coats),
      pricePerM2: pricePerM2 ? parseFloat(pricePerM2) : undefined
    });
    
    router.push('/results');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-[#f9f9fd] z-50">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-[#002D5E] active:scale-95 duration-150 p-2 rounded-full hover:bg-[#e7e8eb]"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-sans font-semibold tracking-wider text-sm uppercase text-[#002D5E]">Pintor PRO Calc</h1>
          </div>
          <div className="text-[#002D5E] font-black tracking-tighter text-xl italic">Pintor Pro Calc</div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-1.5 flex-1 rounded-full bg-secondary"></div>
          <div className="h-1.5 flex-1 rounded-full bg-surface-container-highest"></div>
          <div className="h-1.5 flex-1 rounded-full bg-surface-container-highest"></div>
        </div>

        <section className="space-y-8">
          <header>
            <h2 className="text-2xl font-bold tracking-tight text-[#191c1e] mb-2">Dados do Projeto</h2>
            <p className="text-on-surface-variant text-sm">Insira os detalhes técnicos para um cálculo de precisão.</p>
          </header>

          <div className="space-y-6">
            {/* Client Name Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="client-name">
                Nome do Cliente
              </label>
              <input 
                className="w-full h-14 px-4 bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-lg font-medium outline-none" 
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
                className="w-full h-14 px-4 bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-lg font-medium outline-none" 
                id="client-phone" 
                placeholder="(00) 00000-0000" 
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>

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

            {/* Location Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="city">
                  Cidade
                </label>
                <input 
                  className="w-full h-14 px-4 bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium outline-none" 
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
                  className="w-full h-14 px-4 bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium outline-none" 
                  id="neighborhood" 
                  placeholder="Ex: Centro" 
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>
            </div>

            {/* Detailed Location Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="location">
                Endereço / Localização Completa
              </label>
              <input 
                className="w-full h-14 px-4 bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium outline-none" 
                id="location" 
                placeholder="Ex: Rua das Flores, 123 - Apto 4" 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Property Size Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="wall-size">
                Tamanho do imóvel (m²)
              </label>
              <div className="relative">
                <input 
                  className="w-full h-14 px-4 bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-lg font-medium outline-none" 
                  id="wall-size" 
                  placeholder="0.00" 
                  type="number"
                  value={wallSize}
                  onChange={(e) => setWallSize(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">m²</div>
              </div>
            </div>

            {/* Paint Inclusion Toggle */}
            <label className="block bg-surface-low p-4 rounded-xl border border-outline-variant/15 cursor-pointer hover:bg-surface-container-low transition-colors">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block text-sm font-bold text-[#191c1e]">Incluir valor da tinta no orçamento?</span>
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

            {/* Product Selection */}
            <div className="space-y-4">
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant">Categoria de Produto</label>
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
                        className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all ${
                          productId === product.id && packageSize === 'liter'
                            ? 'bg-white text-primary shadow-sm scale-105'
                            : 'bg-white/10 text-white hover:bg-white/20'
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
                          className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all ${
                            productId === product.id && packageSize === 'can'
                              ? 'bg-white text-primary shadow-sm scale-105'
                              : 'bg-white/10 text-white hover:bg-white/20'
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
                          className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all ${
                            productId === product.id && packageSize === 'bucket'
                              ? 'bg-white text-primary shadow-sm scale-105'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          <Tag size={10} />
                          Balde: R$ {product.pricePerBucket.toFixed(2)}
                        </button>
                      )}
                      
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter bg-white/10 px-2 py-1 rounded text-white/80">
                        <Ruler size={10} />
                        {product.yieldPerLiter}m²/L
                      </div>
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
                                    : 'bg-white/10 text-white border-transparent hover:bg-white/20'
                                }`}
                              >
                                <div 
                                  className="w-full aspect-video rounded-lg mb-2 shadow-inner border border-black/10"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">
                                  {c.name}
                                </span>
                                <span className="text-[8px] font-medium opacity-70 mt-0.5">
                                  cód. {c.code}
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
            </div>

            {/* Number of Coats Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant">Número de demãos</label>
              <div className="flex bg-surface-low p-1.5 rounded-md gap-1">
                {['1', '2', '3'].map((num) => (
                  <label key={num} className="flex-1 text-center">
                    <input 
                      className="sr-only" 
                      name="coats" 
                      type="radio" 
                      value={num}
                      checked={coats === num}
                      onChange={() => setCoats(num)}
                    />
                    <div className={`py-3 rounded-md cursor-pointer font-bold transition-all duration-200 ${
                      coats === num ? 'bg-primary text-white shadow-md scale-105' : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}>
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Price Per M2 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant" htmlFor="price-m2">
                Preço por m² (opcional)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">R$</div>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-lg font-medium outline-none" 
                  id="price-m2" 
                  placeholder="0.00" 
                  type="number"
                  value={pricePerM2}
                  onChange={(e) => setPricePerM2(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-12 space-y-4">
          <button 
            onClick={handleNext}
            className="w-full h-14 bg-gradient-to-b from-primary to-primary-container text-white font-bold rounded-md shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Próximo</span>
            <ArrowRight size={18} />
          </button>
          <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
            Cálculo baseado em normas técnicas ABNT
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
