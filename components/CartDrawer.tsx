
import React from 'react';
import { CartItem } from '../types';
import { X, Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Lock } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full sm:max-w-md w-full bg-[#020617] shadow-2xl flex flex-col border-l border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <ShoppingBag className="w-6 h-6 text-indigo-500" /> Provisioning
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center">
                <Lock className="w-10 h-10 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">No active provisioning requests.</p>
                <button onClick={onClose} className="text-indigo-500 font-black uppercase text-xs tracking-widest mt-4 hover:underline">Return to Marketplace</button>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-5 items-start">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; e.currentTarget.onerror = null; }}
                  className="w-20 h-20 object-cover rounded-2xl border border-slate-800 bg-slate-800" 
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-100 text-sm leading-tight uppercase tracking-tight">{item.name}</h4>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{item.billingModel}</p>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition-all"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center border border-slate-800 rounded-lg hover:bg-slate-800 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-black text-sm">${item.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-slate-800 bg-slate-900/50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Investment</span>
              <span className="text-3xl font-black">${total.toLocaleString()}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <ShieldCheck className="w-5 h-5" /> Execute Secure Order
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
              <Lock className="w-3 h-3" /> Verified Secure Gateway
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
