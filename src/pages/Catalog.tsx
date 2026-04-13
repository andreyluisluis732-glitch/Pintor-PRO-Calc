import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Tag, Ruler, Info, Palette, Layers, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { PRODUCT_CATALOG } from '../constants/catalog';

export default function CatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search;
  const isClientMode = new URLSearchParams(search).get('mode') === 'client';
  const clientParam = isClientMode ? '?mode=client' : '';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const categories = ['Todas', ...Array.from(new Set(PRODUCT_CATALOG.map(p => p.category)))];
  
  const filteredProducts = PRODUCT_CATALOG.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#f9f9fd] text-[#191c1e] pb-32">
      <header className="w-full top-0 sticky bg-[#f9f9fd]/80 backdrop-blur-md z-40 border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="active:scale-95 duration-150 p-2 hover:bg-slate-100 transition-all rounded-xl"
            >
              <ArrowLeft size={20} className="text-[#002D5E]" />
            </button>
            <h1 className="text-lg font-black text-blue-600 italic uppercase tracking-tighter">Catálogo</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/help${clientParam}`} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <HelpCircle size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-on-surface-variant/60" />
          </div>
          <input 
            className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant/20 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
            placeholder="Buscar produto ou marca..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Scroll */}
        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Nenhum produto encontrado.</p>
            </div>
          ) : (
            filteredProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 overflow-hidden relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-black text-[#191c1e] leading-tight">{product.name}</h3>
                  </div>
                  <div className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-black">
                    {product.finish}
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  {product.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-surface-low p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Tag size={16} className="text-primary mb-1" />
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Litro</span>
                    <span className="text-sm font-black text-primary">{formatCurrency(product.pricePerLiter)}</span>
                  </div>
                  {product.pricePerCan && (
                    <div className="bg-surface-low p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <Tag size={16} className="text-primary mb-1" />
                      <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Lata 3.6L</span>
                      <span className="text-sm font-black text-primary">{formatCurrency(product.pricePerCan)}</span>
                    </div>
                  )}
                  {product.pricePerBucket && (
                    <div className="bg-surface-low p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <Tag size={16} className="text-primary mb-1" />
                      <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Balde 18L</span>
                      <span className="text-sm font-black text-primary">{formatCurrency(product.pricePerBucket)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-6 bg-surface-low p-3 rounded-2xl">
                  <Ruler size={18} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Rendimento Estimado</span>
                    <span className="text-sm font-black text-primary">{product.yieldPerLiter}m² por litro / demão</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl">
                    <Info size={18} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {product.info}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-primary" />
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Cores Disponíveis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {product.colors.map(color => (
                        <div key={color.name} className="flex items-center gap-2 p-1.5 bg-surface-container-low rounded-xl border border-outline-variant/5">
                          <div 
                            className="w-8 h-8 rounded-lg shrink-0 shadow-sm border border-black/5" 
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-on-surface-variant uppercase truncate leading-tight">
                              {color.name}
                            </span>
                            <span className="text-[7px] font-medium opacity-60">
                              cód. {color.code}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/calculate${clientParam}${clientParam ? '&' : '?'}productId=${product.id}`)}
                  className="w-full mt-6 h-12 bg-primary text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Layers size={18} />
                  Usar no Orçamento
                </button>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
