import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { products as defaultProducts, faqs } from './data';
import { Product, CartItem, Category, Order } from './types';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AIChat } from './components/AIChat';
import { semanticSearchProducts } from './services/geminiService';
import { 
  ShoppingBag, Search, Menu, Shield, ChevronRight, Star, Lock, 
  ShieldCheck, Loader2, X, Globe, User, 
  LogOut, Download, CheckCircle, Mail, ArrowRight, Zap, 
  Bot, ShoppingCart, SlidersHorizontal, CreditCard, 
  MessageCircle, Twitter, Plus, Trash2, Key, BarChart3, Package, Users, ChevronDown,
  RefreshCw, Save, Database, AlertTriangle, Edit, Upload, FileJson
} from 'lucide-react';

const ADMIN_PASSCODE = '09162502987';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800';

const App: React.FC = () => {
  // Persistence states
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lumina_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lumina_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // System Status State
  const [systemStatus, setSystemStatus] = useState<'Synced' | 'Writing...'>('Synced');

  // UI States
  const [view, setView] = useState<'store' | 'checkout' | 'admin-login' | 'admin-dashboard' | 'about'>('store');
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({ name: '', email: '' });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Admin States
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState<'overview' | 'orders' | 'inventory' | 'backup'>('overview');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.SAAS,
    billingModel: 'Subscription',
    specs: ['Enterprise Grade', 'Provisioned Instant'],
    rating: 5.0
  });

  // Filters
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);

  // Persistence Effects with Status Feedback
  useEffect(() => { 
    setSystemStatus('Writing...');
    localStorage.setItem('lumina_products', JSON.stringify(allProducts)); 
    const timer = setTimeout(() => setSystemStatus('Synced'), 600);
    return () => clearTimeout(timer);
  }, [allProducts]);

  useEffect(() => { 
    setSystemStatus('Writing...');
    localStorage.setItem('lumina_orders', JSON.stringify(orders)); 
    const timer = setTimeout(() => setSystemStatus('Synced'), 600);
    return () => clearTimeout(timer);
  }, [orders]);

  const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);

  const flutterwaveConfig = {
    public_key: 'FLWPUBK-2283d9d85c854253a59b635a730a2c8d-X',
    tx_ref: `lumina_${Date.now()}`,
    amount: cartTotal,
    currency: 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: { email: checkoutDetails.email, name: checkoutDetails.name },
    customizations: { title: 'Lumina Secure Ecosystem', logo: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png' },
  };

  const handleFlutterwave = useFlutterwave(flutterwaveConfig);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeItem = (id: string) => setCartItems(prev => prev.filter(item => item.id !== id));

  const navigateTo = (newView: typeof view) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  const processOrderSuccess = (method: 'Flutterwave' | 'Paystack') => {
    setIsProcessingCheckout(true);
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerName: checkoutDetails.name,
      customerEmail: checkoutDetails.email,
      items: [...cartItems],
      total: cartTotal,
      date: new Date().toISOString(),
      status: 'Completed',
      paymentMethod: method
    };
    setOrders(prev => [newOrder, ...prev]);
    setTimeout(() => {
      setCartItems([]);
      setIsProcessingCheckout(false);
      setCheckoutStep(3);
    }, 1500);
  };

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setSemanticResults(null); return; }
    setIsSearching(true);
    try {
      const results = await semanticSearchProducts(searchQuery, allProducts);
      setSemanticResults(results && results.length > 0 ? results : null);
    } catch (err) {
      setSemanticResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (selectedCategory !== Category.ALL) result = result.filter(p => p.category === selectedCategory);
    result = result.filter(p => p.price <= priceRange && p.rating >= minRating);
    if (semanticResults) {
      result = result.filter(p => semanticResults.includes(p.id));
    } else if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return result;
  }, [selectedCategory, searchQuery, semanticResults, priceRange, minRating, allProducts]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFactoryReset = () => {
    if (window.confirm("CRITICAL WARNING: This will permanently delete all custom assets and order history. System will revert to factory defaults. Are you sure?")) {
      setAllProducts(defaultProducts);
      setOrders([]);
      localStorage.removeItem('lumina_products');
      localStorage.removeItem('lumina_orders');
      alert("System Reset Complete.");
    }
  };

  // Admin Data Management
  const handleEditProduct = (product: Product) => {
    setNewProduct({ ...product });
    setEditingId(product.id);
    setIsAddProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if(window.confirm("Are you sure you want to permanently delete this asset?")) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = () => {
    if(!newProduct.name || !newProduct.price) return;
    
    if (editingId) {
      setAllProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...newProduct } as Product : p));
    } else {
      const finalProd: Product = {
        id: `p-${Date.now()}`,
        name: newProduct.name!,
        price: newProduct.price!,
        category: newProduct.category as Category || Category.SAAS,
        description: newProduct.description || 'Secure Asset',
        image: newProduct.image || FALLBACK_IMAGE,
        rating: newProduct.rating || 5.0,
        specs: newProduct.specs || ['Enterprise Grade', 'Provisioned Instant'],
        billingModel: newProduct.billingModel || 'One-time'
      };
      setAllProducts(prev => [...prev, finalProd]);
    }
    
    setIsAddProductModalOpen(false);
    setEditingId(null);
    setNewProduct({ category: Category.SAAS, billingModel: 'Subscription', specs: ['Enterprise Grade'], rating: 5.0 });
  };

  const handleExportData = () => {
    const data = {
      products: allProducts,
      orders: orders,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products && Array.isArray(data.products)) setAllProducts(data.products);
        if (data.orders && Array.isArray(data.orders)) setOrders(data.orders);
        alert("System Restoration & Sync Complete.");
      } catch (err) {
        alert("Error: Corrupt or Invalid Data File.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderAbout = () => (
    <div className="max-w-4xl mx-auto px-4 py-32 space-y-24">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-black uppercase tracking-tighter">The <span className="text-indigo-500">Lumina</span> Mission</h2>
        <p className="text-slate-400 text-xl font-medium leading-relaxed">
          At Lumina Secure Tech Ecosystem, we bridge the gap between enterprise security and accessible digital tools. 
          Founded by Alex Tech Enterprise, our goal is to provide elite digital assets, SaaS solutions, and high-frequency trading automation 
          within a single, hardened marketplace.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-10 rounded-[40px] border border-slate-800 space-y-4 hover:border-indigo-500 transition-colors">
           <Zap className="w-10 h-10 text-indigo-500" />
           <h3 className="text-2xl font-black uppercase">Rapid Deployment</h3>
           <p className="text-slate-500 text-sm">Our 14-day e-commerce delivery and instant SaaS provisioning ensure your business moves at the speed of light.</p>
        </div>
        <div className="bg-slate-900 p-10 rounded-[40px] border border-slate-800 space-y-4 hover:border-emerald-500 transition-colors">
           <ShieldCheck className="w-10 h-10 text-emerald-500" />
           <h3 className="text-2xl font-black uppercase">Military Security</h3>
           <p className="text-slate-500 text-sm">Every template, script, and bot in our ecosystem is audited for vulnerabilities and ransomware defense.</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-black uppercase tracking-tight">Security & <span className="text-indigo-500">Protocol</span> FAQ</h3>
          <p className="text-slate-500 text-sm uppercase font-bold tracking-widest">Everything you need to know about our tactical operations</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-lg font-black uppercase tracking-tight pr-8">{faq.q}</span>
                <ChevronDown className={`w-6 h-6 text-indigo-500 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-8 pt-0 text-slate-400 font-medium leading-relaxed border-t border-slate-800/50">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-10 text-center">
        <button onClick={() => navigateTo('store')} className="bg-white text-slate-950 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl">Return to Hub Marketplace</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 h-20 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => navigateTo('store')} className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-black uppercase tracking-tighter">Lumina<span className="text-indigo-500">.</span></span>
          </button>
          <div className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <button onClick={() => navigateTo('store')} className="hover:text-white">Marketplace</button>
            <button onClick={() => navigateTo('about')} className="hover:text-white">About Mission</button>
            <button onClick={() => setView('admin-login')} className="hover:text-indigo-500">Command Center</button>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsCartOpen(true)} className="relative p-2">
                <ShoppingBag className="w-6 h-6" />
                {cartItems.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-full text-[9px] flex items-center justify-center font-bold">{cartItems.length}</span>}
              </button>
          </div>
        </div>
      </nav>

      {/* Main View Router */}
      <main className="flex-grow">
        {view === 'store' && (
          <>
            <header className="relative pt-32 pb-20 px-4 overflow-hidden text-center">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Digital</span> Hub.</h1>
               <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12">Provisioning enterprise SaaS, automated trading bots, and bespoke e-commerce engines globally.</p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                 <form onSubmit={handleAISearch} className="w-full relative group">
                   <input 
                     type="text" 
                     placeholder="State your operational objective..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                   />
                   <button type="submit" className="absolute right-2 top-2 p-3 bg-indigo-600 rounded-xl text-white">{isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}</button>
                 </form>
               </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 mb-16 flex gap-3 overflow-x-auto no-scrollbar pb-4">
              {Object.values(Category).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{cat}</button>
              ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-40">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetails={setActiveProduct} />
                  ))}
               </div>
            </div>
          </>
        )}

        {view === 'about' && renderAbout()}

        {view === 'checkout' && (
          <div className="max-w-7xl mx-auto px-4 py-20">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] space-y-10 shadow-2xl">
                   {checkoutStep === 1 ? (
                     <>
                       <h2 className="text-3xl font-black uppercase tracking-tighter">Client <span className="text-indigo-500">Identification</span></h2>
                       <div className="space-y-6">
                          <input type="text" placeholder="Full Name" value={checkoutDetails.name} onChange={e => setCheckoutDetails({...checkoutDetails, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5" />
                          <input type="email" placeholder="Email Address" value={checkoutDetails.email} onChange={e => setCheckoutDetails({...checkoutDetails, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5" />
                          <button onClick={() => checkoutDetails.name && checkoutDetails.email ? setCheckoutStep(2) : alert("Complete details.")} className="w-full bg-indigo-600 py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Authorize Payment Gateway</button>
                       </div>
                     </>
                   ) : checkoutStep === 2 ? (
                     <>
                       <h2 className="text-3xl font-black uppercase tracking-tighter">Secure <span className="text-indigo-500">Gateway</span></h2>
                       <div className="space-y-4">
                          <div className="text-2xl font-black pt-4 flex justify-between uppercase">Total Fee: <span className="text-indigo-500">${cartTotal.toLocaleString()}</span></div>
                          <button onClick={() => handleFlutterwave({ callback: (res) => { if(res.status === 'successful') processOrderSuccess('Flutterwave'); closePaymentModal(); }, onClose: () => {} })} className="w-full bg-amber-600 py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl"><CreditCard /> Pay with Flutterwave</button>
                          <button onClick={() => setCheckoutStep(1)} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">Edit Identification</button>
                       </div>
                     </>
                   ) : (
                     <div className="text-center py-10 space-y-6">
                        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Authorized.</h2>
                        <p className="text-slate-400">Assets are being provisioned to your email.</p>
                        <button onClick={() => setView('store')} className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl">Back to Hub</button>
                     </div>
                   )}
                </div>
                <div className="hidden lg:block space-y-8">
                   <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl">
                      <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-slate-500">Provisioning Queue</h4>
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between py-4 border-b border-slate-800">
                           <span className="font-bold">{item.name} x {item.quantity}</span>
                           <span className="font-black text-indigo-500">${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {view === 'admin-login' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 p-12 rounded-[40px] border border-slate-800 space-y-8 shadow-2xl">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-center">Admin <span className="text-indigo-500">Command</span></h2>
              <input type="password" value={adminPasscodeInput} onChange={e => setAdminPasscodeInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-3xl font-black" placeholder="••••" />
              <button onClick={() => adminPasscodeInput === ADMIN_PASSCODE ? (setAdminAuthenticated(true), setView('admin-dashboard')) : alert("Unauthorized")} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase shadow-xl">Login</button>
              <button onClick={() => setView('store')} className="w-full text-slate-500 text-[10px] uppercase font-black tracking-widest">Abort</button>
            </div>
          </div>
        )}

        {view === 'admin-dashboard' && adminAuthenticated && (
          <div className="min-h-screen flex bg-slate-950">
             {/* Admin Sidebar */}
             <div className="w-64 border-r border-slate-800 p-8 flex flex-col gap-6 overflow-y-auto">
                <div className="text-xl font-black uppercase text-indigo-500 flex items-center gap-2"><Key className="w-5 h-5" /> Ops Console</div>
                
                <div className="py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 mb-4 flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${systemStatus === 'Synced' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                   <span className="text-[9px] uppercase font-black text-slate-400">{systemStatus === 'Synced' ? 'Database Secure' : 'Syncing Core...'}</span>
                </div>

                <div className="space-y-2">
                  <button onClick={() => setAdminTab('overview')} className={`w-full p-4 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-900'}`}>Overview</button>
                  <button onClick={() => setAdminTab('inventory')} className={`w-full p-4 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-900'}`}>Assets Inventory</button>
                  <button onClick={() => setAdminTab('orders')} className={`w-full p-4 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-900'}`}>Order Log</button>
                  <button onClick={() => setAdminTab('backup')} className={`w-full p-4 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'backup' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-900'}`}>System Backup</button>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-800">
                  <button onClick={() => setView('store')} className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white"><LogOut className="w-4 h-4" /> Exit Console</button>
                </div>
             </div>

             {/* Admin Content */}
             <div className="flex-grow p-10 overflow-y-auto max-h-screen">
                {adminTab === 'overview' && (
                  <div className="space-y-8">
                     <h2 className="text-3xl font-black uppercase tracking-tighter">System <span className="text-indigo-500">Metrics</span></h2>
                     <div className="grid grid-cols-3 gap-6">
                        <div className="bg-slate-900 p-8 rounded-[30px] border border-slate-800">
                           <div className="flex items-center gap-4 mb-2 text-slate-500">
                              <Package className="w-5 h-5" />
                              <span className="text-xs font-black uppercase tracking-widest">Active Assets</span>
                           </div>
                           <div className="text-4xl font-black text-white">{allProducts.length}</div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[30px] border border-slate-800">
                           <div className="flex items-center gap-4 mb-2 text-slate-500">
                              <Users className="w-5 h-5" />
                              <span className="text-xs font-black uppercase tracking-widest">Total Clients</span>
                           </div>
                           <div className="text-4xl font-black text-white">{new Set(orders.map(o => o.customerEmail)).size}</div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[30px] border border-slate-800">
                           <div className="flex items-center gap-4 mb-2 text-slate-500">
                              <BarChart3 className="w-5 h-5" />
                              <span className="text-xs font-black uppercase tracking-widest">Revenue</span>
                           </div>
                           <div className="text-4xl font-black text-emerald-500">${orders.reduce((a, b) => a + b.total, 0).toLocaleString()}</div>
                        </div>
                     </div>
                  </div>
                )}

                {adminTab === 'inventory' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black uppercase tracking-tighter">Asset <span className="text-indigo-500">Control</span></h2>
                      <button onClick={() => { setEditingId(null); setIsAddProductModalOpen(true); }} className="bg-indigo-600 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-indigo-500 transition-colors"><Plus className="w-4 h-4" /> Deploy New Asset</button>
                    </div>

                    <div className="bg-slate-900 rounded-[30px] border border-slate-800 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950 border-b border-slate-800 text-xs font-black uppercase tracking-widest text-slate-500">
                          <tr>
                            <th className="p-6">Asset Name</th>
                            <th className="p-6">Category</th>
                            <th className="p-6">Value</th>
                            <th className="p-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {allProducts.map(p => (
                            <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="p-6 font-bold">{p.name}</td>
                              <td className="p-6 text-sm text-slate-400">{p.category}</td>
                              <td className="p-6 font-mono text-emerald-500">${p.price}</td>
                              <td className="p-6 flex items-center justify-end gap-3">
                                <button onClick={() => handleEditProduct(p)} className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-slate-800 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminTab === 'backup' && (
                   <div className="space-y-8">
                      <h2 className="text-3xl font-black uppercase tracking-tighter">System <span className="text-indigo-500">Persistence</span></h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] space-y-6">
                            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500 mb-4"><Save className="w-8 h-8" /></div>
                            <h3 className="text-xl font-black uppercase">Create System Backup</h3>
                            <p className="text-slate-400 text-sm">Download a JSON snapshot of your current inventory, products, and order history.</p>
                            <button onClick={handleExportData} className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-500">
                               <Download className="w-4 h-4" /> Download Snapshot
                            </button>
                         </div>

                         <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] space-y-6 relative overflow-hidden">
                            <div className="w-16 h-16 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-4"><Database className="w-8 h-8" /></div>
                            <h3 className="text-xl font-black uppercase">Restore System</h3>
                            <p className="text-slate-400 text-sm">Upload a previously saved JSON snapshot to restore your system state.</p>
                            <div className="relative">
                               <input type="file" accept=".json" onChange={handleImportData} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                               <button className="w-full bg-slate-800 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-700">
                                  <Upload className="w-4 h-4" /> Upload Snapshot
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="mt-12 p-8 border border-red-900/50 bg-red-900/10 rounded-[30px] flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <div>
                               <h4 className="font-black text-red-500 uppercase tracking-widest">Factory Reset</h4>
                               <p className="text-red-400/60 text-xs mt-1">Irreversible action. Wipes all local data.</p>
                            </div>
                         </div>
                         <button onClick={handleFactoryReset} className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">Initiate Reset</button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* Modals & Drawers */}
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cartItems} 
          onUpdateQuantity={updateQuantity} 
          onRemove={removeItem}
          onCheckout={() => { setIsCartOpen(false); navigateTo('checkout'); }}
        />

        {activeProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={() => setActiveProduct(null)} />
            <div className="relative bg-slate-900 w-full max-w-4xl rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
               <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-slate-800">
                  <img src={activeProduct.image} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  <div className="absolute bottom-8 left-8">
                     <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-4">{activeProduct.category}</div>
                     <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{activeProduct.name}</h2>
                  </div>
               </div>
               <div className="p-10 md:w-1/2 overflow-y-auto">
                  <p className="text-slate-400 font-medium leading-relaxed mb-8">{activeProduct.description}</p>
                  {activeProduct.disclaimer && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-8 flex gap-3">
                       <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                       <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wide leading-relaxed">{activeProduct.disclaimer}</p>
                    </div>
                  )}
                  <div className="space-y-3 mb-8">
                     {activeProduct.specs.map((s, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-bold text-slate-300">{s}</span>
                       </div>
                     ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-8">
                     <div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">Total Investment</span>
                        <span className="text-3xl font-black text-white">${activeProduct.price.toLocaleString()}</span>
                     </div>
                     <button onClick={() => { addToCart(activeProduct); setActiveProduct(null); }} className="bg-white hover:bg-indigo-600 text-slate-900 hover:text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl">
                        Add to Cart
                     </button>
                  </div>
                  <button onClick={() => setActiveProduct(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm"><X className="w-5 h-5" /></button>
               </div>
            </div>
          </div>
        )}

        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={() => setIsAddProductModalOpen(false)} />
            <div className="relative bg-slate-900 w-full max-w-lg p-8 rounded-[30px] border border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
               <h3 className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Asset' : 'Deploy New Asset'}</h3>
               <div className="space-y-4">
                  <input placeholder="Asset Name" value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl" />
                  <input placeholder="Price (USD)" type="number" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl" />
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-slate-400">
                     {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <textarea placeholder="Description" value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl h-24" />
                  <input placeholder="Image URL" value={newProduct.image || ''} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl" />
               </div>
               <button onClick={handleSaveProduct} className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500">
                  {editingId ? 'Update Asset' : 'Confirm Deployment'}
               </button>
            </div>
          </div>
        )}

        <AIChat products={allProducts} />
      </main>
    </div>
  );
};

export default App;