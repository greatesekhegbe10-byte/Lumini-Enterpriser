
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
  Bot, Layout, ShoppingCart, Briefcase, Rocket, Filter, SlidersHorizontal,
  MessageSquare, Send
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
  const [ownedProducts, setOwnedProducts] = useState<Product[]>([]);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  
  // Advanced Filters
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

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
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    setView('checkout');
    setCheckoutStep(1);
    window.scrollTo(0, 0);
  };

  const processOrder = () => {
    setIsProcessingCheckout(true);
    setTimeout(() => {
      const newOwned = [...ownedProducts, ...cartItems.map(item => ({ ...item }))];
      setOwnedProducts(newOwned);
      localStorage.setItem('lumina_owned', JSON.stringify(newOwned));
      setCartItems([]);
      setIsProcessingCheckout(false);
      setCheckoutStep(3);
    }, 2500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== Category.ALL) result = result.filter(p => p.category === selectedCategory);
    result = result.filter(p => p.price <= priceRange && p.rating >= minRating);

    if (semanticResults) {
      result = result.filter(p => semanticResults.includes(p.id));
    } else if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, searchQuery, semanticResults, priceRange, minRating]);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setSemanticResults(null); return; }
    setIsSearching(true);
    try {
      const results = await semanticSearchProducts(searchQuery);
      setSemanticResults(results && results.length > 0 ? results : null);
    } catch (err) {
      setSemanticResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const resetFilters = () => {
    setPriceRange(5000);
    setMinRating(0);
    setSearchQuery('');
    setSemanticResults(null);
    setSelectedCategory(Category.ALL);
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-slate-900/50 rounded-[40px] h-[500px] border border-slate-800 animate-pulse flex flex-col p-10 space-y-6">
          <div className="w-full h-48 bg-slate-800 rounded-[32px]" />
          <div className="h-8 bg-slate-800 rounded-full w-3/4" />
          <div className="mt-auto h-16 bg-slate-800 rounded-2xl" />
        </div>
      ))}
    </div>
  );

  const renderCheckout = () => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-grow">
            {checkoutStep === 1 && (
              <div className="space-y-8">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Secure <span className="text-indigo-500">Checkout</span></h2>
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8 shadow-2xl">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-3"><User className="text-indigo-500" /> Identity Verification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input type="text" placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="email" placeholder="Business Email" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-3"><CreditCard className="text-indigo-500" /> Secure Payment</h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
                      <input type="text" placeholder="Card Number" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 text-sm outline-none" />
                      <div className="grid grid-cols-2 gap-6">
                        <input type="text" placeholder="MM/YY" className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-sm outline-none" />
                        <input type="text" placeholder="CVV" className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-sm outline-none" />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="w-full bg-indigo-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-2xl">Review Strategy Order</button>
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Strategy <span className="text-indigo-500">Review</span></h2>
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8 shadow-2xl">
                  <div className="divide-y divide-slate-800">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-6">
                          <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border border-slate-800" />
                          <div>
                            <h4 className="font-black text-white uppercase tracking-tight">{item.name}</h4>
                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">{item.billingModel} x {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-black text-lg">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 flex justify-between items-center text-3xl font-black border-t border-slate-800">
                    <span className="uppercase tracking-tighter">Total Investment</span>
                    <span className="text-indigo-500">${total.toLocaleString()}</span>
                  </div>
                  <button 
                    disabled={isProcessingCheckout}
                    onClick={processOrder} 
                    className="w-full bg-emerald-500 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 shadow-2xl disabled:opacity-50 flex items-center justify-center gap-4 transition-all"
                  >
                    {isProcessingCheckout ? <><Loader2 className="animate-spin" /> Authorizing...</> : <><ShieldCheck className="w-6 h-6" /> Execute Full Provisioning</>}
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="text-center py-32 space-y-10">
                <div className="w-32 h-32 bg-emerald-500 text-white rounded-[48px] flex items-center justify-center mx-auto shadow-2xl">
                  <CheckCircle className="w-16 h-16" />
                </div>
                <h2 className="text-5xl font-black uppercase">Order Securely Provisioned.</h2>
                <button onClick={() => { setView('dashboard'); setCheckoutStep(1); }} className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                  Enter Command Hub
                </button>
              </div>
            )}
          </div>
          {checkoutStep < 3 && (
            <div className="w-full lg:w-96">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-xl space-y-6">
                <div className="flex items-center gap-4"><ShieldCheck className="text-emerald-500" /> <span className="text-xs font-black uppercase tracking-widest">256-Bit SSL Secured</span></div>
                <div className="flex items-center gap-4"><Globe className="text-blue-500" /> <span className="text-xs font-black uppercase tracking-widest">Global Compliance</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-64 space-y-4">
          <button className="w-full flex items-center gap-4 px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-4 px-8 py-5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-[24px] font-black text-xs uppercase tracking-widest" onClick={() => setView('store')}>
            <ShoppingCart className="w-5 h-5" /> Marketplace
          </button>
          <button className="w-full flex items-center gap-4 px-8 py-5 text-red-500 hover:bg-red-500/10 rounded-[24px] font-black text-xs uppercase tracking-widest mt-8" onClick={() => { setView('store'); resetFilters(); }}>
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
        <div className="flex-1 space-y-12">
          <h3 className="text-3xl font-black tracking-tight uppercase">Strategic Assets</h3>
          {ownedProducts.length === 0 ? (
            <div className="bg-slate-900/30 border-2 border-slate-800 border-dashed rounded-[56px] p-20 text-center">
              <p className="text-slate-500 text-xl font-bold mb-6">No tactical assets deployed yet.</p>
              <button onClick={() => setView('store')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">Deploy Solutions</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {ownedProducts.map((p, i) => (
                <div key={`${p.id}-${i}`} className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 flex items-center justify-between group hover:border-indigo-500 transition-all">
                  <div className="flex items-center gap-8">
                    <Cpu className="text-indigo-500 w-8 h-8" />
                    <div>
                      <h4 className="font-black text-white uppercase tracking-tight">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.category}</p>
                    </div>
                  </div>
                  <button className="p-5 bg-slate-800 hover:bg-indigo-600 rounded-2xl text-white transition-all"><Download className="w-6 h-6" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020617] p-8 animate-in fade-in slide-in-from-right-10 flex flex-col">
          <div className="flex justify-between items-center mb-16">
            <span className="text-2xl font-black tracking-tighter uppercase">Lumina<span className="text-indigo-500">Secure</span></span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-900 rounded-full"><X /></button>
          </div>
          <div className="flex flex-col gap-8 text-4xl font-black uppercase tracking-tighter">
            <button onClick={() => { setView('store'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">Marketplace</button>
            <button onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">Dashboard</button>
            <button onClick={() => { setView('about'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">The Edge</button>
            <button onClick={() => { setView('contact'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">Establish Contact</button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-4 lg:gap-10">
              <button onClick={() => { setView('store'); resetFilters(); window.scrollTo(0,0); }} className="flex items-center gap-3 group outline-none">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Lumina<span className="text-indigo-500">Secure</span></span>
              </button>
              <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <button onClick={() => { setView('store'); setSelectedCategory(Category.ALL); }} className={`hover:text-white transition-colors ${view === 'store' && selectedCategory === Category.ALL ? 'text-white' : ''}`}>Marketplace</button>
                <button onClick={() => { setView('store'); setSelectedCategory(Category.TRADING_BOTS); }} className={`hover:text-white transition-colors ${view === 'store' && selectedCategory === Category.TRADING_BOTS ? 'text-white' : ''}`}>Bots</button>
                <button onClick={() => setView('about')} className={`hover:text-white transition-colors ${view === 'about' ? 'text-white' : ''}`}>The Edge</button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-6">
              <form onSubmit={handleAISearch} className="hidden sm:flex relative">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Analyze mission needs..." className="w-40 md:w-64 bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2.5 text-xs outline-none" />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                {isSearching && <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-indigo-500 animate-spin" />}
              </form>
              <button onClick={() => setView('dashboard')} className={`p-2.5 rounded-full border border-slate-800 transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-900 hover:bg-slate-800'}`}>
                <User className="w-5 h-5" />
              </button>
              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-full">
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
          {/* Hero */}
          <section className="relative h-[750px] md:h-[900px] overflow-hidden flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-[#020617] to-emerald-900/10" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center sm:text-left">
              <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mx-auto sm:mx-0">
                  <Rocket className="w-4 h-4 text-indigo-500" /> Platform Release v4.0.2
                </div>
                <h1 className="text-6xl md:text-[10rem] font-black leading-[0.82] tracking-tighter uppercase">BUILD. SELL. <br /> AUTOMATE. <br /> <span className="text-indigo-500">SECURE.</span></h1>
                <p className="text-xl md:text-3xl text-slate-400 font-medium leading-relaxed max-w-3xl">Professional software products, website templates, trading bots, and fully delivered e-commerce websites—powered by secure technology.</p>
                <div className="flex flex-col sm:flex-row gap-8 pt-10">
                  <button onClick={() => document.getElementById('marketplace')?.scrollIntoView({behavior:'smooth'})} className="bg-white text-slate-900 px-14 py-7 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl">Explore Inventory</button>
                  <button onClick={() => { setSelectedCategory(Category.ECOMMERCE_DEV); document.getElementById('marketplace')?.scrollIntoView({behavior:'smooth'}); }} className="bg-slate-900 border border-slate-800 text-white px-14 py-7 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Launch My Store</button>
                </div>
              </div>
            </div>
          </section>

          {/* Marketplace */}
          <main id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-slate-900">
            <div className="space-y-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-8">
                  <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase">The <span className="text-indigo-500">Stacks.</span></h2>
                  <div className="flex flex-wrap gap-4">
                    {Object.values(Category).map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-[10px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-2xl border transition-all ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}>
                  <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
              {showFilters && (
                <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[40px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500"><span>Max Investment</span> <span>${priceRange}</span></div>
                    <input type="range" min="0" max="5000" step="100" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full accent-indigo-500" />
                  </div>
                  <div className="flex items-end"><button onClick={resetFilters} className="w-full bg-slate-800 py-4 rounded-xl text-[10px] font-black uppercase text-slate-300">Reset Parameters</button></div>
                </div>
              )}
              {isSearching ? renderSkeleton() : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetails={setActiveProduct} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {view === 'checkout' && renderCheckout()}
      {view === 'dashboard' && renderDashboard()}
      
      {view === 'about' && (
        <section className="max-w-7xl mx-auto px-4 py-40 animate-in fade-in">
          <div className="max-w-4xl space-y-20">
            <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter uppercase leading-[0.82]">THE <br /><span className="text-indigo-500">LUMINA</span> <br />EDGE.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6 p-12 bg-slate-900 rounded-[48px] border border-slate-800">
                <Zap className="w-12 h-12 text-indigo-500" />
                <h3 className="text-3xl font-black uppercase">Rapid Ops</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">Built for zero-friction deployment. Our tech allows you to go from concept to production in days.</p>
              </div>
              <div className="space-y-6 p-12 bg-slate-900 rounded-[48px] border border-slate-800">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
                <h3 className="text-3xl font-black uppercase">Hardened Tech</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">Security is pre-audited by elite penetration testers for every template and bot we offer.</p>
              </div>
            </div>
            <button onClick={() => setView('store')} className="text-indigo-500 font-black uppercase text-xs tracking-[0.4em] flex items-center gap-4 hover:translate-x-4 transition-transform">Return to command center <ArrowRight /></button>
          </div>
        </section>
      )}

      {view === 'contact' && (
        <section className="max-w-7xl mx-auto px-4 py-40 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-12">
              <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85]">Establish <br /><span className="text-indigo-500">Contact.</span></h2>
              {contactSubmitted ? (
                <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] animate-in zoom-in-95">
                  <h4 className="text-2xl font-black text-emerald-500 uppercase">Transmission Received.</h4>
                  <p className="text-slate-400 mt-2 font-medium">A tactical specialist will reach out within 24 operational hours.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-8 p-10 bg-slate-900 rounded-[40px] border border-slate-800">
                    <Mail className="w-10 h-10 text-indigo-500" />
                    <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-2">Technical Ops</p><p className="text-2xl font-black">ops@luminasecure.io</p></div>
                  </div>
                </div>
              )}
            </div>
            {!contactSubmitted && (
              <div className="bg-slate-900 p-12 rounded-[56px] border border-slate-800 shadow-2xl">
                <form className="space-y-8" onSubmit={handleContactSubmit}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-1">Identity</label>
                    <input required type="text" placeholder="Agent Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-1">Specs</label>
                    <textarea required placeholder="Mission requirements..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm outline-none h-48 resize-none" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-xl">Deploy Inquiry</button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/98 backdrop-blur-xl" onClick={() => setActiveProduct(null)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-[56px] overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-in zoom-in-95 h-[90vh] lg:h-auto">
            <button onClick={() => setActiveProduct(null)} className="absolute top-8 right-8 p-4 bg-slate-800 hover:bg-red-500 rounded-full text-white z-20 transition-all"><X /></button>
            <div className="lg:w-1/2 h-64 lg:h-auto shrink-0"><img src={activeProduct.image} className="w-full h-full object-cover opacity-60" /></div>
            <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center overflow-y-auto">
              <span className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.5em] mb-6">{activeProduct.category}</span>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter uppercase">{activeProduct.name}</h2>
              <p className="text-slate-400 mb-10 leading-relaxed font-medium text-lg">{activeProduct.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {activeProduct.specs.map(s => (
                  <div key={s} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-300 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/30">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {s}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-10 border-t border-slate-800 mt-auto">
                <div><p className="text-slate-500 text-[10px] font-black uppercase mb-1">Fee</p><p className="text-5xl font-black">${activeProduct.price.toLocaleString()}<span className="text-sm text-slate-500 font-bold ml-1">{activeProduct.billingModel === 'Subscription' ? '/mo' : ''}</span></p></div>
                <button onClick={() => { addToCart(activeProduct); setActiveProduct(null); }} className="bg-white text-slate-900 px-14 py-7 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95">Deploy Asset</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={updateQuantity} onRemove={removeItem} onCheckout={navigateToCheckout} />
      <AIChat />

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-slate-800 pt-40 pb-20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 mb-40">
          <div className="space-y-10">
            <div className="flex items-center gap-4"><Shield className="w-12 h-12 text-indigo-500" /><span className="text-3xl font-black uppercase tracking-tighter">Lumina</span></div>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">Securing the global digital frontier through autonomous intelligence and elite protection.</p>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-10">Marketplace</h5>
            <ul className="space-y-6 text-slate-500 text-xs font-black uppercase tracking-widest">
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.TRADING_BOTS); window.scrollTo(0,0); }} className="hover:text-white transition-colors">AI Trading Bots</button></li>
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.SAAS); window.scrollTo(0,0); }} className="hover:text-white transition-colors">SaaS & Apps</button></li>
              <li><button onClick={() => { setView('store'); setSelectedCategory(Category.ECOMMERCE_DEV); window.scrollTo(0,0); }} className="hover:text-white transition-colors">Store Delivery</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-10">Operational</h5>
            <ul className="space-y-6 text-slate-500 text-xs font-black uppercase tracking-widest">
              <li><button onClick={() => { setView('about'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">The Vision</button></li>
              <li><button onClick={() => { setView('contact'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">Contact HQ</button></li>
              <li><button onClick={() => { setView('dashboard'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">Tactical Dashboard</button></li>
            </ul>
          </div>
          <div className="space-y-10">
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-10">Secure Briefing</h5>
            <div className="flex bg-slate-900 border border-slate-800 rounded-[20px] overflow-hidden shadow-xl">
              <input type="email" placeholder="agent@org.io" className="bg-transparent px-6 py-5 w-full text-xs outline-none" />
              <button className="bg-indigo-600 p-5 hover:bg-indigo-500 transition-colors"><ChevronRight className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 gap-8">
          <p>© 2024 LUMINA SECURE SYSTEMS. WORLDWIDE ENCRYPTED OPS.</p>
          <div className="flex flex-wrap justify-center gap-12">
            <a href="#" className="hover:text-white transition-colors">Privacy Shell</a>
            <a href="#" className="hover:text-white transition-colors">Service Terms</a>
            <a href="#" className="hover:text-white transition-colors">Risk Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
