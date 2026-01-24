
import React from 'react';
import { Product, Category } from '../types';
import { Shield, Zap, Download, CreditCard, ChevronRight, Star, ArrowUpRight, Bot, Layout, ShoppingCart, HelpCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const getButtonText = () => {
    switch(product.billingModel) {
      case 'Subscription': return 'Activate Sub';
      case 'Service': return 'Book Delivery';
      default: return 'Instant Access';
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

  const getAccentColor = () => {
    switch(product.category) {
      case Category.TRADING_BOTS: return 'blue';
      case Category.ECOMMERCE_DEV: return 'emerald';
      case Category.SAAS: return 'indigo';
      case Category.CYBERSECURITY: return 'red';
      default: return 'indigo';
    }
  };

  const accent = getAccentColor();

  return (
    <div className={`group bg-slate-900 rounded-[40px] shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-slate-800 hover:border-${accent}-500/50 relative`}>
      <div className={`absolute -inset-1 bg-gradient-to-r from-${accent}-500/0 via-${accent}-500/5 to-${accent}-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none`} />
      
      <div className="relative overflow-hidden h-64 shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-60 group-hover:opacity-90 grayscale-[0.3] group-hover:grayscale-0"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        
        <div className="absolute top-6 left-6 flex gap-2">
          <div className="bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 border border-slate-800 shadow-xl">
            {getCategoryIcon()}
            {product.category}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
           <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter group-hover:translate-x-1 transition-transform">{product.name}</h3>
        </div>
      </div>
      
      <div className="p-10 flex-grow flex flex-col relative z-10">
        <p className="text-slate-400 text-sm mb-10 flex-grow font-medium leading-relaxed">
          {product.description}
        </p>
        
        <div className="grid grid-cols-1 gap-4 mb-10">
          {product.specs.slice(0, 2).map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full bg-${accent}-500`} />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{s}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-10 pt-10 border-t border-slate-800/50">
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Fee Basis</span>
             <span className="text-3xl font-black text-white">${product.price.toLocaleString()}<span className="text-xs text-slate-500 font-bold">{product.billingModel === 'Subscription' ? '/mo' : ''}</span></span>
           </div>
           <button onClick={() => onViewDetails(product)} className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all">
              <ArrowUpRight className="w-6 h-6" />
           </button>
        </div>

        <button 
          onClick={() => onAddToCart(product)}
          className={`w-full bg-white hover:bg-indigo-600 text-slate-950 hover:text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-indigo-500/20`}
        >
          <CreditCard className="w-4 h-4" />
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};
