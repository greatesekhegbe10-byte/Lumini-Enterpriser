
import React from 'react';
import { Product, Category } from '../types';
import { Shield, Zap, Download, CreditCard, Star, ArrowUpRight, Bot, Layout, ShoppingCart, Info } from 'lucide-react';

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
    <div className={`group bg-slate-900 rounded-[40px] shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-slate-800 hover:border-${accent}-500/50 relative`}>
      <div className={`absolute -inset-1 bg-gradient-to-r from-${accent}-500/0 via-${accent}-500/5 to-${accent}-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none`} />
      
      <div className="relative overflow-hidden h-60 shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-60 group-hover:opacity-90 grayscale-[0.3] group-hover:grayscale-0"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent" />
        
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          <div className="bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2.5 border border-slate-800 shadow-xl">
            {getCategoryIcon()}
            {product.category}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
           <div className="flex items-center gap-1 mb-2">
             {[...Array(5)].map((_, i) => (
               <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-700'}`} />
             ))}
             <span className="text-[10px] font-black text-slate-400 ml-2">{product.rating}</span>
           </div>
           <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter group-hover:translate-x-1 transition-transform">{product.name}</h3>
        </div>
      </div>
      
      <div className="p-10 flex-grow flex flex-col relative z-10">
        <p className="text-slate-400 text-sm mb-10 flex-grow font-medium leading-relaxed">
          {product.description}
        </p>
        
        <div className="space-y-3 mb-10">
          <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Core Capabilities</h4>
          {product.specs.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full bg-${accent}-500 group-hover:scale-125 transition-transform`} />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{s}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-10 pt-10 border-t border-slate-800/50">
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Standard Fee</span>
             <span className="text-3xl font-black text-white">${product.price.toLocaleString()}<span className="text-xs text-slate-500 font-bold ml-1">{product.billingModel === 'Subscription' ? '/mo' : ''}</span></span>
           </div>
           <button onClick={() => onViewDetails(product)} className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all shadow-lg active:scale-90">
              <ArrowUpRight className="w-6 h-6" />
           </button>
        </div>

        <button 
          onClick={() => onAddToCart(product)}
          className={`w-full bg-white hover:bg-indigo-600 text-slate-950 hover:text-white py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-indigo-500/10`}
        >
          <CreditCard className="w-4 h-4" />
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};
