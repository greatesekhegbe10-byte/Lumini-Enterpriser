
import React, { useState, useMemo, useEffect } from 'react';
import { products, testimonials, faqs } from './data';
import { Product, CartItem, Category } from './types';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AIChat } from './components/AIChat';
import { semanticSearchProducts } from './services/geminiService';
import { 
  ShoppingBag, Search, Menu, Shield, ChevronRight, Star, Lock, 
  ShieldCheck, Terminal, Loader2, X, Globe, Database, User, 
  LayoutDashboard, LogOut, CreditCard, Settings, Download, 
  CheckCircle, HelpCircle, Mail, ArrowRight, Zap, Cpu, 
  Bot, Layout, ShoppingCart, Briefcase, Rocket
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'store' | 'dashboard' | 'checkout' | 'about' | 'contact'>('store');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [ownedProducts, setOwnedProducts] = useState<Product[]>([]);

  // Local Storage for mock persistence
  useEffect(() => {
    const saved = localStorage.getItem('lumina_owned');
    if (saved) setOwnedProducts(JSON.parse(saved));
  }, []);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const navigateToCheckout = () => {
    setIsCartOpen(false);
    setView('checkout');
    setCheckoutStep(1);
    window.scrollTo(0, 0);
  };

  const processOrder = () => {
    setIsProcessingCheckout(true);
    // Simulate payment processing
    setTimeout(() => {
      const newOwned = [...ownedProducts, ...cartItems.map(item => ({ ...item }))];
      setOwnedProducts(newOwned);
      localStorage.setItem('lumina_owned', JSON.stringify(newOwned));
      setCartItems([]);
      setIsProcessingCheckout(false);
      setOrderComplete(true);
      setCheckoutStep(3);
    }, 2500);
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== Category.ALL) result = result.filter(p => p.category === selectedCategory);
    if (semanticResults) result = result.filter(p => semanticResults.includes(p.id));
    else if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [selectedCategory, searchQuery, semanticResults]);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setSemanticResults(null); return; }
    setIsSearching(true);
    const results = await semanticSearchProducts(searchQuery);
    setSemanticResults(results.length > 0 ? results : null);
    setIsSearching(false);
  };

  const renderCheckout = () => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-grow">
            {checkoutStep === 1 && (
              <div className="space-y-8">
                <h2 className="text-4xl font-black tracking-tighter">SECURE <span className="text-indigo-500">CHECKOUT</span></h2>
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black">Identity Verification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name" className="bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="email" placeholder="Business Email" className="bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-black">Secure Payment</h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-4 text-slate-500 mb-4">
                        <Lock className="w-4 h-4" /> SSL Encrypted Gateway
                      </div>
                      <input type="text" placeholder="Card Number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" className="bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none" />
                        <input type="text" placeholder="CVC" className="bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none" />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="w-full bg-indigo-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 shadow-2xl">Review Order</button>
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-4xl font-black tracking-tighter">ORDER <span className="text-indigo-500">REVIEW</span></h2>
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-4 border-b border-slate-800">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-black text-white">{item.name}</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase">{item.billingModel}</p>
                        </div>
                      </div>
                      <p className="font-black">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="pt-6 flex justify-between items-center text-2xl font-black">
                    <span>Total Investment</span>
                    <span className="text-indigo-500">${total.toLocaleString()}</span>
                  </div>
                  <button 
                    disabled={isProcessingCheckout}
                    onClick={processOrder} 
                    className="w-full bg-emerald-500 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessingCheckout ? <><Loader2 className="animate-spin" /> Authorizing...</> : <><ShieldCheck className="w-5 h-5" /> Execute Order</>}
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="text-center py-20 space-y-8">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter uppercase">Mission Accomplished.</h2>
                  <p className="text-slate-400 text-xl font-medium max-w-lg mx-auto">Your technical assets have been provisioned and are ready for download in your tactical hub.</p>
                </div>
                <button onClick={() => { setView('dashboard'); window.scrollTo(0,0); }} className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl">
                  Access Hub
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {checkoutStep < 3 && (
            <div className="w-full lg:w-96 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px]">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6">Trust Signal</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold"><ShieldCheck className="text-emerald-500" /> SSL SECURED</div>
                  <div className="flex items-center gap-3 text-sm font-bold"><Globe className="text-blue-500" /> GDPR COMPLIANT</div>
                  <div className="flex items-center gap-3 text-sm font-bold"><Lock className="text-indigo-500" /> 256-BIT ENCRYPTED</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button className="w-full flex items-center gap-4 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20">
            <LayoutDashboard className="w-5 h-5" /> Hub Overview
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
            <Download className="w-5 h-5" /> Assets Library
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
            <Settings className="w-5 h-5" /> Security HQ
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Systems Online</p>
              <h4 className="text-4xl font-black">{ownedProducts.length.toString().padStart(2, '0')}</h4>
            </div>
            <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Build Status</p>
              <h4 className="text-4xl font-black text-indigo-400">ACTIVE</h4>
            </div>
            <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Threat Level</p>
              <h4 className="text-4xl font-black text-emerald-400">ZERO</h4>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tight">MY TACTICAL ASSETS</h3>
            {ownedProducts.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[40px] p-20 text-center space-y-6">
                <Terminal className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-500 font-bold">No assets provisioned. Visit the marketplace to deploy solutions.</p>
                <button onClick={() => setView('store')} className="text-indigo-400 font-black uppercase text-xs tracking-widest hover:underline">Marketplace</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {ownedProducts.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Cpu className="text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-tight">{p.name}</h4>
                        <p className="text-xs text-slate-500 font-bold">{p.category}</p>
                      </div>
                    </div>
                    <button className="p-4 bg-slate-800 hover:bg-indigo-600 rounded-2xl text-white transition-all active:scale-95">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-4 lg:gap-10">
              <button onClick={() => setView('store')} className="flex items-center gap-3 group outline-none">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Lumina<span className="text-indigo-500">Secure</span></span>
              </button>

              <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <button onClick={() => { setView('store'); setSelectedCategory(Category.ALL); }} className={`hover:text-white transition-colors py-1 ${view === 'store' && selectedCategory === Category.ALL ? 'text-white' : ''}`}>Marketplace</button>
                <button onClick={() => { setView('store'); setSelectedCategory(Category.TRADING_BOTS); }} className={`hover:text-white transition-colors py-1 ${view === 'store' && selectedCategory === Category.TRADING_BOTS ? 'text-white' : ''}`}>Bots</button>
                <button onClick={() => { setView('store'); setSelectedCategory(Category.ECOMMERCE_DEV); }} className={`hover:text-white transition-colors py-1 ${view === 'store' && selectedCategory === Category.ECOMMERCE_DEV ? 'text-white' : ''}`}>Development</button>
                <button onClick={() => setView('about')} className="hover:text-white transition-colors py-1">Tech Hub</button>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <form onSubmit={handleAISearch} className="hidden sm:flex relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Automate my workflow..."
                  className="w-40 md:w-64 bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                {isSearching && <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-indigo-500 animate-spin" />}
              </form>

              <button onClick={() => setView('dashboard')} className={`p-2.5 rounded-full border border-slate-800 transition-all ${view === 'dashboard' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 text-slate-100 hover:bg-slate-800'}`}>
                <User className="w-5 h-5" />
              </button>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-all">
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">!</span>}
              </button>
              
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2.5 bg-slate-900 border border-slate-800 rounded-full">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'store' && (
        <>
          {/* Hero Section */}
          <section className="relative h-[700px] md:h-[850px] overflow-hidden flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-[#020617] to-emerald-900/10" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center sm:text-left">
              <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mx-auto sm:mx-0 backdrop-blur">
                  <Lock className="w-3.5 h-3.5" /> High-Encryption Ecosystem
                </div>
                <h1 className="text-6xl md:text-[9rem] font-black leading-[0.85] tracking-tighter uppercase">
                  BUILD. SELL. <br />
                  AUTOMATE. <br />
                  <span className="text-indigo-500">SECURE.</span>
                </h1>
                <p className="text-xl md:text-3xl text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto sm:mx-0">
                  Professional software, website templates, trading bots, and fully delivered e-commerce websites—powered by secure, scalable technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 pt-10">
                  <button onClick={() => document.getElementById('marketplace')?.scrollIntoView({behavior:'smooth'})} className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-[0_25px_60px_rgba(79,70,229,0.5)] flex items-center justify-center gap-4">
                    Explore Products <ArrowRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setView('store'); setSelectedCategory(Category.ECOMMERCE_DEV); }} className="bg-slate-900 border border-slate-800 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all backdrop-blur flex items-center justify-center gap-4">
                    Launch My Store
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Signals Section */}
          <section className="py-24 bg-slate-950 border-y border-slate-900">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
              <div className="space-y-4">
                <Zap className="w-10 h-10 text-indigo-500 mx-auto md:mx-0" />
                <h4 className="text-lg font-black uppercase tracking-tight">Scalable SaaS</h4>
                <p className="text-slate-500 text-sm font-medium">Cloud-native tools built for extreme growth and performance.</p>
              </div>
              <div className="space-y-4">
                <Bot className="w-10 h-10 text-amber-500 mx-auto md:mx-0" />
                <h4 className="text-lg font-black uppercase tracking-tight">Trading Bots</h4>
                <p className="text-slate-500 text-sm font-medium">Automated wealth generation with neural market analysis.</p>
              </div>
              <div className="space-y-4">
                <ShoppingCart className="w-10 h-10 text-emerald-500 mx-auto md:mx-0" />
                <h4 className="text-lg font-black uppercase tracking-tight">Done-For-You</h4>
                <p className="text-slate-500 text-sm font-medium">Complete e-commerce website delivery in record time.</p>
              </div>
              <div className="space-y-4">
                <ShieldCheck className="w-10 h-10 text-red-500 mx-auto md:mx-0" />
                <h4 className="text-lg font-black uppercase tracking-tight">Cybersecurity</h4>
                <p className="text-slate-500 text-sm font-medium">Enterprise-grade audits to protect your digital domain.</p>
              </div>
            </div>
          </section>

          {/* Marketplace */}
          <main id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase">DIGITAL <span className="text-indigo-500">ASSETS.</span></h2>
                <div className="flex flex-wrap gap-4">
                  {Object.values(Category).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[10px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-2xl border transition-all ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetails={setActiveProduct} />
              ))}
            </div>
          </main>

          {/* Special Service Delivery Section */}
          <section className="py-40 bg-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <h2 className="text-5xl md:text-[7rem] font-black leading-[0.9] text-white tracking-tighter uppercase">READY-TO-SHIP <br />STORES.</h2>
                <p className="text-2xl text-indigo-100 font-medium leading-relaxed">Helping businesses launch faster, sell smarter, and stay secure—on any device, anywhere.</p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20">
                    <h4 className="text-white font-black text-4xl mb-2">14</h4>
                    <p className="text-indigo-100 font-black uppercase text-[10px] tracking-widest">Day Delivery</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20">
                    <h4 className="text-white font-black text-4xl mb-2">99%</h4>
                    <p className="text-indigo-100 font-black uppercase text-[10px] tracking-widest">Security Score</p>
                  </div>
                </div>
                <button onClick={() => { setView('store'); setSelectedCategory(Category.ECOMMERCE_DEV); window.scrollTo(0,0); }} className="bg-white text-indigo-600 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all shadow-2xl">
                  Launch Your Store
                </button>
              </div>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200" className="rounded-[60px] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Dev Team" />
                <div className="absolute -bottom-10 -right-10 bg-slate-900 p-12 rounded-[50px] shadow-2xl border border-slate-800 hidden md:block animate-bounce">
                  <Rocket className="w-16 h-16 text-indigo-500" />
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-40 bg-[#020617]">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-20 space-y-4">
                <HelpCircle className="w-16 h-16 text-indigo-500 mx-auto" />
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">TACTICAL FAQS.</h2>
              </div>
              <div className="space-y-6">
                {faqs.map((f, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] hover:border-indigo-500 transition-all group">
                    <h4 className="font-black text-xl mb-4 flex items-center gap-4">
                      <Terminal className="w-5 h-5 text-indigo-500" /> {f.q}
                    </h4>
                    <p className="text-slate-400 font-medium leading-relaxed pl-9">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {view === 'checkout' && renderCheckout()}
      {view === 'dashboard' && renderDashboard()}

      {/* Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/98 backdrop-blur-xl" onClick={() => setActiveProduct(null)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-[56px] overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-in zoom-in-95 duration-500">
            <button onClick={() => setActiveProduct(null)} className="absolute top-8 right-8 p-3 bg-slate-800 hover:bg-red-500 rounded-full text-white z-20 transition-all"><X /></button>
            <div className="lg:w-1/2 h-80 lg:h-auto relative">
              <img src={activeProduct.image} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>
            <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
              <span className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.4em] mb-6">{activeProduct.category}</span>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter uppercase">{activeProduct.name}</h2>
              <p className="text-slate-400 mb-10 leading-relaxed font-medium text-lg">{activeProduct.description}</p>
              
              {activeProduct.disclaimer && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl mb-10">
                  <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <HelpCircle className="w-4 h-4" /> Strategy Disclaimer
                  </p>
                  <p className="text-slate-300 text-xs mt-2 font-medium">{activeProduct.disclaimer}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-12">
                {activeProduct.specs.map(s => (
                  <div key={s} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-300 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {s}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-10 border-t border-slate-800 mt-auto">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-1 tracking-widest">Investment</p>
                  <p className="text-4xl font-black">${activeProduct.price.toLocaleString()}<span className="text-sm text-slate-500">{activeProduct.billingModel === 'Subscription' ? '/mo' : ''}</span></p>
                </div>
                <button onClick={() => { addToCart(activeProduct); setActiveProduct(null); }} className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95">Deploy Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity} 
        onRemove={removeItem} 
        onCheckout={navigateToCheckout} 
      />
      <AIChat />

      <footer className="bg-[#020617] border-t border-slate-800 pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 mb-40">
          <div className="space-y-10">
            <div className="flex items-center gap-4"><Shield className="w-12 h-12 text-indigo-500" /><span className="text-3xl font-black uppercase tracking-tighter">Lumina</span></div>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">The premier hub for automated business success and tactical protection.</p>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-10">Marketplace</h5>
            <ul className="space-y-6 text-slate-500 text-xs font-black uppercase tracking-widest">
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.TRADING_BOTS); }} className="hover:text-white transition-colors">AI Trading Bots</button></li>
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.SAAS); }} className="hover:text-white transition-colors">SaaS Tools</button></li>
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.TEMPLATES); }} className="hover:text-white transition-colors">Web Templates</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-10">Solutions</h5>
            <ul className="space-y-6 text-slate-500 text-xs font-black uppercase tracking-widest">
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.ECOMMERCE_DEV); }} className="hover:text-white transition-colors">E-com Delivery</button></li>
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.CYBERSECURITY); }} className="hover:text-white transition-colors">Security Audits</button></li>
              <li><button onClick={() => setView('contact')} className="hover:text-white transition-colors">Consulting</button></li>
            </ul>
          </div>
          <div className="space-y-10">
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-10">Briefings</h5>
            <div className="flex bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all shadow-2xl">
              <input type="email" placeholder="identity@org.io" className="bg-transparent px-6 py-5 w-full text-xs outline-none" />
              <button className="bg-indigo-600 p-5 hover:bg-indigo-500 transition-colors"><ChevronRight className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 gap-8">
          <p>© 2024 LUMINA SECURE SYSTEMS. ALL RIGHTS PROTECTED.</p>
          <div className="flex flex-wrap justify-center gap-12">
            <a href="#" className="hover:text-white transition-colors flex items-center gap-3"><Lock className="w-3.5 h-3.5" /> Privacy Shell</a>
            <a href="#" className="hover:text-white transition-colors">Operational Terms</a>
            <a href="#" className="hover:text-white transition-colors">Risk Disclaimers</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
