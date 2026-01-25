
import React from 'react';
import { Product, Category } from '../types';
import { Shield, Zap, Download, CreditCard, Star, ArrowUpRight, Bot, Layout, ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const getButtonText = () => {
    switch(product.billingModel) {
      case 'Subscription': return 'Activate Sub';
      case 'Service': return 'Deploy Service';
      default: return 'Secure Access';
    }
  };

  const getCategoryIcon = () => {
    switch(product.category) {
      case Category.SAAS: return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case Category.TRADING_BOTS: return <Bot className="w-3.5 h-3.5 text-blue-400" />;
      case Category.TEMPLATES: return <Layout className="w-3.5 h-3.5 text-purple-400" />;
      case Category.ECOMMERCE_DEV: return <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />;
      case Category.CYBERSECURITY: return <Shield className="w-3.5 h-3.5 text-red-400" />;
      default: return <Download className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const accent = product.category === Category.CYBERSECURITY ? 'red' : 
                 product.category === Category.ECOMMERCE_DEV ? 'emerald' : 
                 product.category === Category.TRADING_BOTS ? 'blue' : 'indigo';

  return (
    <div className={`group bg-slate-900 rounded-[48px] shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-slate-800 hover:border-${accent}-500/50 relative hover:-translate-y-2`}>
      <div className={`absolute -inset-1 bg-gradient-to-r from-${accent}-500/0 via-${accent}-500/10 to-${accent}-500/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none`} />
      
      <div className="relative overflow-hidden h-64 shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-60 group-hover:opacity-90 grayscale-[0.5] group-hover:grayscale-0"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent" />
        
        <div className="absolute top-8 left-8">
          <div className="bg-slate-950/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 border border-slate-800 shadow-2xl">
            {getCategoryIcon()}
            {product.category}
          </div>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
           <div className="flex items-center gap-1.5 mb-3">
             {[...Array(5)].map((_, i) => (
               <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-800'}`} />
             ))}
             <span className="text-[11px] font-black text-slate-400 ml-2 tracking-widest">{product.rating} / 5.0</span>
           </div>
           <h3 className="text-3xl font-black text-white leading-[0.9] uppercase tracking-tighter group-hover:translate-x-1 transition-transform">{product.name}</h3>
        </div>
      </div>
      
      <div className="p-10 flex-grow flex flex-col relative z-10">
        <p className="text-slate-400 text-sm mb-10 flex-grow font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
          {product.description}
        </p>
        
        {/* Expanded Specs Section - Ensuring no truncation */}
        <div className="space-y-4 mb-10 bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50">
          <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2">Technical Specs</h4>
          <div className="grid grid-cols-1 gap-3">
             {product.specs.map((s, i) => (
               <div key={i} className="flex items-center gap-4 group/item">
                 <div className={`w-5 h-5 rounded-lg bg-${accent}-500/10 flex items-center justify-center border border-${accent}-500/20`}>
                    <Check className={`w-3 h-3 text-${accent}-500`} />
                 </div>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">{s}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-10 pt-10 border-t border-slate-800/50">
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Fee Tier</span>
             <span className="text-4xl font-black text-white tracking-tighter">${product.price.toLocaleString()}<span className="text-xs text-slate-500 font-bold ml-1 uppercase">{product.billingModel === 'Subscription' ? '/mo' : ''}</span></span>
           </div>
           <button onClick={() => onViewDetails(product)} className="w-14 h-14 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all shadow-xl active:scale-90">
              <ArrowUpRight className="w-7 h-7" />
           </button>
        </div>

        <button 
          onClick={() => onAddToCart(product)}
          className={`w-full bg-white hover:bg-indigo-600 text-slate-950 hover:text-white py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl`}
        >
          <CreditCard className="w-4 h-4" />
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};
