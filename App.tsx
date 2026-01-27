
import React, { useState, useMemo, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { products as defaultProducts, faqs } from './data';
import { Product, CartItem, Category, Order } from './types';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AIChat } from './components/AIChat';
import { semanticSearchProducts } from './services/geminiService';
import { 
  ShoppingBag, Search, Menu, Shield, ChevronRight, Star, Lock, 
  ShieldCheck, Terminal, Loader2, X, Globe, Database, User, 
  LayoutDashboard, LogOut, Settings, Download, 
  CheckCircle, HelpCircle, Mail, ArrowRight, Zap, Cpu, 
  Bot, ShoppingCart, Rocket, Filter, SlidersHorizontal,
  CreditCard, Smartphone, Check, Send, Scale, FileText, AlertTriangle,
  MessageCircle, Twitter, Plus, Trash2, Key, BarChart3, Package, Users
} from 'lucide-react';

// Payment Keys
const PAYSTACK_KEY = 'pk_live_5cd9061dc23feea681bde61151e06200251bb359';
const FLUTTERWAVE_KEY = 'FLWPUBK-2283d9d85c854253a59b635a730a2c8d-X';
const ADMIN_PASSCODE = '09162502987';

const App: React.FC = () => {
  // Main Data State
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lumina_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lumina_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'store' | 'dashboard' | 'checkout' | 'about' | 'contact' | 'legal' | 'admin-login' | 'admin-dashboard'>('store');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [ownedProducts, setOwnedProducts] = useState<Product[]>([]);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({ name: '', email: '' });
  
  // Admin State
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState<'overview' | 'orders' | 'inventory'>('overview');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.SAAS,
    billingModel: 'Subscription',
    specs: [],
    rating: 5.0
  });

  // Advanced Filters
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lumina_products', JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    localStorage.setItem('lumina_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_owned');
    if (saved) setOwnedProducts(JSON.parse(saved));
  }, []);

  // Global Scroll-to-Top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  // Derived State
  const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);

  // Payment Configs
  const paystackConfig = useMemo(() => ({
    reference: `lumina_${new Date().getTime()}`,
    email: checkoutDetails.email,
    amount: cartTotal * 100, // Paystack expects Kobo
    publicKey: PAYSTACK_KEY,
    currency: 'USD',
  }), [checkoutDetails.email, cartTotal]);

  const flutterwaveConfig = useMemo(() => ({
    public_key: FLUTTERWAVE_KEY,
    tx_ref: `lumina_${Date.now()}`,
    amount: cartTotal,
    currency: 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: checkoutDetails.email,
      phone_number: '',
      name: checkoutDetails.name,
    },
    customizations: {
      title: 'Lumina Secure Ecosystem',
      description: 'Enterprise Asset Provisioning',
      logo: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
    },
  }), [checkoutDetails, cartTotal]);

  // Payment Hooks
  const initializePaystack = usePaystackPayment(paystackConfig);
  const handleFlutterwave = useFlutterwave(flutterwaveConfig);

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
  };

  const processOrderSuccess = (method: 'Paystack' | 'Flutterwave') => {
    setIsProcessingCheckout(true);
    
    // Create new order record
    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
      const newOwned = [...ownedProducts, ...cartItems.map(item => ({ ...item }))];
      setOwnedProducts(newOwned);
      localStorage.setItem('lumina_owned', JSON.stringify(newOwned));
      setCartItems([]);
      setIsProcessingCheckout(false);
      setCheckoutStep(3);
    }, 2000);
  };

  const handlePaystackPayment = () => {
    initializePaystack({
      onSuccess: () => processOrderSuccess('Paystack'),
      onClose: () => setIsProcessingCheckout(false),
    });
  };

  const handleFlutterwavePayment = () => {
    handleFlutterwave({
      callback: (response) => {
        closePaymentModal();
        if (response.status === "successful") {
          processOrderSuccess('Flutterwave');
        }
      },
      onClose: () => setIsProcessingCheckout(false),
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSubscribed(true);
    setTimeout(() => setNewsletterSubscribed(false), 5000);
  };

  const filteredProducts = useMemo(() => {
    let result = allProducts;
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
  }, [selectedCategory, searchQuery, semanticResults, priceRange, minRating, allProducts]);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setSemanticResults(null); return; }
    setIsSearching(true);
    try {
      // Pass allProducts to the search service
      const results = await semanticSearchProducts(searchQuery, allProducts);
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

  const navigateTo = (newView: typeof view, sectionId?: string) => {
    setView(newView);
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Admin Functions
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscodeInput === ADMIN_PASSCODE) {
      setAdminAuthenticated(true);
      setView('admin-dashboard');
      setAdminPasscodeInput('');
    } else {
      alert("Access Denied: Invalid Security Clearance");
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    
    const product: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name!,
      price: Number(newProduct.price),
      category: newProduct.category as Category,
      description: newProduct.description || 'New secure asset.',
      image: newProduct.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
      rating: 5.0,
      specs: newProduct.specs || ['Enterprise Ready', 'Secure'],
      billingModel: newProduct.billingModel as any
    };

    setAllProducts(prev => [product, ...prev]);
    setIsAddProductModalOpen(false);
    setNewProduct({ category: Category.SAAS, billingModel: 'Subscription', specs: [], rating: 5.0 });
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Confirm deletion of this asset? This action is irreversible.")) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-slate-900/50 rounded-[40px] h-[550px] border border-slate-800 animate-pulse p-10 space-y-8">
          <div className="w-full h-48 bg-slate-800/50 rounded-[32px]" />
          <div className="h-10 bg-slate-800/50 rounded-full w-3/4" />
          <div className="mt-auto h-16 bg-slate-800/50 rounded-2xl" />
        </div>
      ))}
    </div>
  );

  const renderCheckout = () => {
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
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Legal Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe" 
                          value={checkoutDetails.name}
                          onChange={(e) => setCheckoutDetails(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Business Email</label>
                        <input 
                          type="email" 
                          placeholder="john@company.io" 
                          value={checkoutDetails.email}
                          onChange={(e) => setCheckoutDetails(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (checkoutDetails.name && checkoutDetails.email) {
                        setCheckoutStep(2);
                      } else {
                        alert("Please complete identity verification to proceed.");
                      }
                    }} 
                    className="w-full bg-indigo-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-2xl"
                  >
                    Initialize Secure Gateway
                  </button>
                </div>
              </div>
            )}
            {checkoutStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Order <span className="text-indigo-500">Summary</span></h2>
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
                    <span className="text-indigo-500">${cartTotal.toLocaleString()}</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Select Payment Vector</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        disabled={isProcessingCheckout}
                        onClick={handlePaystackPayment}
                        className="w-full bg-[#0ba4db] py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0993c4] shadow-2xl shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                      >
                        {isProcessingCheckout ? <Loader2 className="animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        Pay with Paystack
                      </button>
                      <button 
                        disabled={isProcessingCheckout}
                        onClick={handleFlutterwavePayment}
                        className="w-full bg-[#f5a623] text-slate-950 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#df951c] shadow-2xl shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                      >
                         {isProcessingCheckout ? <Loader2 className="animate-spin" /> : <Zap className="w-5 h-5" />}
                        Pay with Flutterwave
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {checkoutStep === 3 && (
              <div className="text-center py-32 space-y-10">
                <div className="w-32 h-32 bg-emerald-500 text-white rounded-[48px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                  <CheckCircle className="w-16 h-16" />
                </div>
                <h2 className="text-6xl font-black uppercase tracking-tighter">System <br /><span className="text-indigo-500">Authorized.</span></h2>
                <p className="text-slate-400 text-xl font-medium max-w-lg mx-auto leading-relaxed">Your digital assets and services have been provisioned. Access them immediately via your technical hub.</p>
                <button onClick={() => navigateTo('dashboard')} className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
                  Go to Tactical Hub
                </button>
              </div>
            )}
          </div>
          {checkoutStep < 3 && (
            <div className="w-full lg:w-96 space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-xl space-y-6">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 pb-4 border-b border-slate-800">Security Credentials</h4>
                <div className="flex items-center gap-4"><ShieldCheck className="text-emerald-500" /> <span className="text-xs font-black uppercase tracking-widest">256-Bit SSL Secured</span></div>
                <div className="flex items-center gap-4"><Globe className="text-blue-500" /> <span className="text-xs font-black uppercase tracking-widest">GDPR & PCI Compliant</span></div>
                <div className="flex items-center gap-4"><Lock className="text-indigo-500" /> <span className="text-xs font-black uppercase tracking-widest">Tier 1 Data Security</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 p-10 rounded-[40px] border border-slate-800 shadow-2xl space-y-8 animate-in zoom-in-95">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Admin <span className="text-indigo-500">Clearance</span></h2>
          <p className="text-slate-500 text-sm font-medium">Restricted Access. Enter Passcode.</p>
        </div>
        <form onSubmit={handleAdminLogin} className="space-y-6">
           <input 
             type="password" 
             value={adminPasscodeInput}
             onChange={(e) => setAdminPasscodeInput(e.target.value)}
             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-indigo-500 transition-colors"
             placeholder="••••"
           />
           <button type="submit" className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-xl">
             Authenticate
           </button>
           <button type="button" onClick={() => navigateTo('store')} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white">
             Return to Marketplace
           </button>
        </form>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="min-h-screen bg-[#020617] flex">
      {/* Admin Sidebar */}
      <div className="w-20 lg:w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col p-4 gap-4">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-4 gap-3 text-indigo-500 mb-8">
          <ShieldCheck className="w-8 h-8" />
          <span className="hidden lg:block font-black uppercase tracking-tight text-white">Lumina<span className="text-indigo-500">Ops</span></span>
        </div>
        
        <button onClick={() => setAdminTab('overview')} className={`p-4 lg:px-6 rounded-2xl flex items-center gap-4 transition-all ${adminTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
          <BarChart3 className="w-5 h-5" /> <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Overview</span>
        </button>
        <button onClick={() => setAdminTab('orders')} className={`p-4 lg:px-6 rounded-2xl flex items-center gap-4 transition-all ${adminTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
          <Users className="w-5 h-5" /> <span className="hidden lg:block text-xs font-black uppercase tracking-widest">User Orders</span>
        </button>
        <button onClick={() => setAdminTab('inventory')} className={`p-4 lg:px-6 rounded-2xl flex items-center gap-4 transition-all ${adminTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
          <Package className="w-5 h-5" /> <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Inventory</span>
        </button>

        <div className="mt-auto">
          <button onClick={() => { setAdminAuthenticated(false); navigateTo('store'); }} className="w-full p-4 lg:px-6 rounded-2xl flex items-center gap-4 text-red-500 hover:bg-red-500/10 transition-all">
             <LogOut className="w-5 h-5" /> <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Exit Console</span>
          </button>
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">{adminTab === 'overview' ? 'Mission Control' : adminTab === 'orders' ? 'Transaction Logs' : 'Asset Management'}</h1>

        {adminTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><CreditCard /></div>
              <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Revenue</p><h4 className="text-4xl font-black">${orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}</h4></div>
            </div>
            <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Users /></div>
              <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Orders</p><h4 className="text-4xl font-black">{orders.length}</h4></div>
            </div>
            <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 space-y-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500"><Package /></div>
              <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active Assets</p><h4 className="text-4xl font-black">{allProducts.length}</h4></div>
            </div>
          </div>
        )}

        {adminTab === 'orders' && (
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-6">Order ID</th>
                    <th className="p-6">Customer</th>
                    <th className="p-6">Items</th>
                    <th className="p-6">Total</th>
                    <th className="p-6">Method</th>
                    <th className="p-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="p-10 text-center text-slate-500">No transactions recorded.</td></tr>
                  ) : orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-800/50">
                      <td className="p-6 font-mono text-xs">{order.id}</td>
                      <td className="p-6">
                        <div className="font-bold text-white">{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.customerEmail}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          {order.items.map((item, i) => (
                             <span key={i} className="bg-slate-800 px-2 py-1 rounded text-[10px] w-fit">{item.name} (x{item.quantity})</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-6 font-bold text-emerald-400">${order.total.toLocaleString()}</td>
                      <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.paymentMethod === 'Paystack' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>{order.paymentMethod}</span></td>
                      <td className="p-6 text-slate-500 text-xs">{new Date(order.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'inventory' && (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button onClick={() => setIsAddProductModalOpen(true)} className="bg-indigo-600 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg">
                <Plus className="w-4 h-4" /> Add Asset
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.map(product => (
                <div key={product.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex flex-col gap-4 relative group hover:border-indigo-500/50 transition-all">
                  <button onClick={() => handleDeleteProduct(product.id)} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <img src={product.image} className="w-full h-40 object-cover rounded-2xl opacity-70" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{product.category}</span>
                    <h4 className="text-lg font-black leading-tight mt-1">{product.name}</h4>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-bold">${product.price}</span>
                    <span className="text-xs text-slate-500">{product.billingModel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-slate-900 w-full max-w-2xl rounded-[40px] border border-slate-800 p-8 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black uppercase tracking-tighter">Deploy New Asset</h3>
               <button onClick={() => setIsAddProductModalOpen(false)}><X className="w-6 h-6" /></button>
             </div>
             <div className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Asset Name</label>
                   <input type="text" value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Price ($)</label>
                   <input type="number" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm" />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description</label>
                 <textarea value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm h-24" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Category</label>
                   <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm">
                     {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Billing Model</label>
                   <select value={newProduct.billingModel} onChange={e => setNewProduct({...newProduct, billingModel: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm">
                     {['Subscription', 'One-time', 'Service'].map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                 </div>
               </div>
               <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Image URL</label>
                   <input type="text" value={newProduct.image || ''} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm" placeholder="https://..." />
               </div>
               <button onClick={handleAddProduct} className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all mt-4">Confirm Deployment</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-64 space-y-4">
          <button className="w-full flex items-center gap-4 px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20">
            <LayoutDashboard className="w-5 h-5" /> Hub Overview
          </button>
          <button className="w-full flex items-center gap-4 px-8 py-5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-[24px] font-black text-xs uppercase tracking-widest" onClick={() => navigateTo('store')}>
            <ShoppingCart className="w-5 h-5" /> Marketplace
          </button>
          <button className="w-full flex items-center gap-4 px-8 py-5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-[24px] font-black text-xs uppercase tracking-widest">
            <Settings className="w-5 h-5" /> My Configs
          </button>
          <button className="w-full flex items-center gap-4 px-8 py-5 text-red-500 hover:bg-red-500/10 rounded-[24px] font-black text-xs uppercase tracking-widest mt-12" onClick={() => { navigateTo('store'); resetFilters(); }}>
            <LogOut className="w-5 h-5" /> Deactivate Session
          </button>
        </div>
        <div className="flex-1 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800">
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Active Assets</p>
               <h4 className="text-5xl font-black">{ownedProducts.length.toString().padStart(2, '0')}</h4>
            </div>
            <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800">
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Uptime Status</p>
               <h4 className="text-5xl font-black text-emerald-400">NOMINAL</h4>
            </div>
            <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800">
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Security Tier</p>
               <h4 className="text-5xl font-black text-indigo-400">P-SEC</h4>
            </div>
          </div>
          <h3 className="text-3xl font-black tracking-tight uppercase">Tactical Inventory</h3>
          {ownedProducts.length === 0 ? (
            <div className="bg-slate-900/30 border-2 border-slate-800 border-dashed rounded-[56px] p-24 text-center">
              <Terminal className="w-16 h-16 text-slate-800 mx-auto mb-6" />
              <p className="text-slate-500 text-xl font-bold mb-8">No tactical assets deployed yet.</p>
              <button onClick={() => navigateTo('store')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Deploy New Solutions</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {ownedProducts.map((p, i) => (
                <div key={`${p.id}-${i}`} className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 flex items-center justify-between group hover:border-indigo-500 transition-all shadow-xl">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Cpu className="text-indigo-500 w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase tracking-tight text-lg">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.category} | Secured</p>
                    </div>
                  </div>
                  <button className="p-5 bg-slate-800 hover:bg-indigo-600 rounded-2xl text-white transition-all shadow-lg active:scale-90"><Download className="w-6 h-6" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLegal = () => (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in">
      <div className="space-y-16">
        <div className="flex items-center gap-6">
          <Scale className="w-12 h-12 text-indigo-500" />
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Legal <br /><span className="text-indigo-500">Framework.</span></h2>
        </div>

        <section id="privacy-policy" className="scroll-mt-32 space-y-8 bg-slate-900 p-12 rounded-[48px] border border-slate-800">
           <div className="flex items-center gap-4 text-indigo-500">
             <Shield className="w-6 h-6" />
             <h3 className="text-2xl font-black uppercase tracking-tight">Privacy Shell (Policy)</h3>
           </div>
           <div className="space-y-4 text-slate-400 leading-relaxed font-medium">
             <p>Lumina Secure operates on a principle of radical data sovereignty. We collect minimal telemetry required for operational authorization. Your source code, proprietary algorithms, and tactical data remain encrypted with zero-knowledge architecture.</p>
             <p>We do not sell data to third-party aggregators. All communication is routed through encrypted nodes and scrubbed for identifiable metadata beyond technical requirements.</p>
           </div>
        </section>

        <section id="service-terms" className="scroll-mt-32 space-y-8 bg-slate-900 p-12 rounded-[48px] border border-slate-800">
           <div className="flex items-center gap-4 text-emerald-500">
             <FileText className="w-6 h-6" />
             <h3 className="text-2xl font-black uppercase tracking-tight">Service Terms</h3>
           </div>
           <div className="space-y-4 text-slate-400 leading-relaxed font-medium">
             <p>By deploying assets from the Lumina Stacks, you agree to our Acceptable Use Policy. Assets may not be used for unauthorized penetration of critical infrastructure without explicit government authorization.</p>
             <p>Subscriptions are billed on a recurring basis. Termination of a subscription results in the de-provisioning of cloud-hosted licenses within 72 operational hours.</p>
           </div>
        </section>

        <section id="risk-disclaimer" className="scroll-mt-32 space-y-8 bg-slate-900 p-12 rounded-[48px] border border-slate-800">
           <div className="flex items-center gap-4 text-amber-500">
             <AlertTriangle className="w-6 h-6" />
             <h3 className="text-2xl font-black uppercase tracking-tight">Risk Disclaimer</h3>
           </div>
           <div className="space-y-4 text-slate-400 leading-relaxed font-medium">
             <p>Trading bots and automated financial assets carry significant technical and market risk. Past performance recorded in our simulation environments does not guarantee future operational success. Lumina is not a financial advisor; we are a technology provider.</p>
             <p>Cybersecurity services provide point-in-time assessments. No system can be rendered 100% impenetrable. Our audits reflect current industry hardening standards at the time of testing.</p>
           </div>
        </section>

        <button onClick={() => navigateTo('store')} className="text-indigo-500 font-black uppercase text-xs tracking-[0.5em] flex items-center gap-4 hover:translate-x-4 transition-transform">
          <ArrowRight className="rotate-180" /> Return to Marketplace
        </button>
      </div>
    </div>
  );

  // If Admin is authenticated, render dashboard full screen
  if (view === 'admin-dashboard' && adminAuthenticated) {
    return renderAdminDashboard();
  }
  
  // If in Admin Login View
  if (view === 'admin-login') {
    return renderAdminLogin();
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020617] p-8 animate-in fade-in slide-in-from-right-10 flex flex-col">
          <div className="flex justify-between items-center mb-16">
            <span className="text-2xl font-black tracking-tighter uppercase">Lumina<span className="text-indigo-500">Secure</span></span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-900 rounded-full hover:bg-red-500 transition-colors"><X /></button>
          </div>
          <div className="flex flex-col gap-8 text-4xl font-black uppercase tracking-tighter">
            <button onClick={() => { navigateTo('store'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">Marketplace</button>
            <button onClick={() => { navigateTo('dashboard'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">Command Hub</button>
            <button onClick={() => { navigateTo('about'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">Our Vision</button>
            <button onClick={() => { navigateTo('contact'); setIsMobileMenuOpen(false); }} className="text-left hover:text-indigo-500 transition-colors">Establish Contact</button>
            <button onClick={() => { navigateTo('admin-login'); setIsMobileMenuOpen(false); }} className="text-left text-indigo-500 hover:text-white transition-colors">Staff Access</button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-4 lg:gap-10">
              <button onClick={() => { navigateTo('store'); resetFilters(); }} className="flex items-center gap-3 group outline-none">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all group-hover:scale-110">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Lumina<span className="text-indigo-500">Secure</span></span>
              </button>
              <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <button onClick={() => { navigateTo('store'); setSelectedCategory(Category.ALL); }} className={`hover:text-white transition-colors ${view === 'store' && selectedCategory === Category.ALL ? 'text-white border-b-2 border-indigo-500 pb-1' : ''}`}>Marketplace</button>
                <button onClick={() => { navigateTo('store'); setSelectedCategory(Category.TRADING_BOTS); }} className={`hover:text-white transition-colors ${view === 'store' && selectedCategory === Category.TRADING_BOTS ? 'text-white border-b-2 border-indigo-500 pb-1' : ''}`}>Trading Bots</button>
                <button onClick={() => navigateTo('about')} className={`hover:text-white transition-colors ${view === 'about' ? 'text-white border-b-2 border-indigo-500 pb-1' : ''}`}>The Edge</button>
                <button onClick={() => navigateTo('contact')} className={`hover:text-white transition-colors ${view === 'contact' ? 'text-white border-b-2 border-indigo-500 pb-1' : ''}`}>Establish Contact</button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-6">
              <form onSubmit={handleAISearch} className="hidden sm:flex relative">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Analyze requirements..." className="w-40 md:w-64 bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                {isSearching && <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-indigo-500 animate-spin" />}
              </form>
              <button onClick={() => navigateTo('dashboard')} className={`p-2.5 rounded-full border border-slate-800 transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 hover:bg-slate-800'}`}>
                <User className="w-5 h-5" />
              </button>
              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-all">
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-lg ring-2 ring-[#020617]">!</span>}
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
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mx-auto sm:mx-0 backdrop-blur-md">
                  <Rocket className="w-4 h-4 text-indigo-500" /> Enterprise Release v4.2.0
                </div>
                <h1 className="text-6xl md:text-[10rem] font-black leading-[0.82] tracking-tighter uppercase">BUILD. SELL. <br /> AUTOMATE. <br /> <span className="text-indigo-500">SECURE.</span></h1>
                <p className="text-xl md:text-3xl text-slate-400 font-medium leading-relaxed max-w-3xl">Professional software products, website templates, trading bots, and fully delivered e-commerce websites—powered by high-encryption technology.</p>
                <div className="flex flex-col sm:flex-row gap-8 pt-10">
                  <button onClick={() => document.getElementById('marketplace')?.scrollIntoView({behavior:'smooth'})} className="bg-white text-slate-900 px-14 py-7 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-[0_30px_70px_rgba(79,70,229,0.5)] group flex items-center justify-center gap-4">
                    Explore Inventory <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button onClick={() => { setSelectedCategory(Category.ECOMMERCE_DEV); document.getElementById('marketplace')?.scrollIntoView({behavior:'smooth'}); }} className="bg-slate-900 border border-slate-800 text-white px-14 py-7 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-4">
                    Launch Store Hub
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Pillars */}
          <section className="py-32 bg-[#020617] relative border-y border-slate-900">
             <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {[
                  { icon: <Smartphone className="text-indigo-500" />, title: "Mobile Optimized", desc: "Experience zero latency across any device or OS." },
                  { icon: <ShieldCheck className="text-emerald-500" />, title: "Hardened Security", desc: "Enterprise SSL and PCI-compliant processing." },
                  { icon: <Zap className="text-amber-500" />, title: "Rapid Delivery", desc: "Digital assets provisioned instantly post-payment." },
                  { icon: <Database className="text-blue-500" />, title: "Global Scale", desc: "Cloud-native infrastructure built for growth." }
                ].map((pillar, i) => (
                  <div key={i} className="space-y-6 group p-8 bg-slate-900/20 rounded-[40px] border border-transparent hover:border-indigo-500/30 transition-all">
                     <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 shadow-xl group-hover:scale-110 transition-transform">
                        {pillar.icon}
                     </div>
                     <h4 className="text-xl font-black uppercase tracking-tight">{pillar.title}</h4>
                     <p className="text-slate-500 font-medium text-sm leading-relaxed">{pillar.desc}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Stacks */}
          <main id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="space-y-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-8">
                  <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase">The <span className="text-indigo-500">Stacks.</span></h2>
                  <div className="flex flex-wrap gap-4">
                    {Object.values(Category).map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-[10px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-2xl border transition-all ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}>
                  <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Advanced Filters
                </button>
              </div>

              {showFilters && (
                <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[40px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500"><span>Maximum Investment</span> <span>${priceRange.toLocaleString()}</span></div>
                    <input type="range" min="0" max="5000" step="50" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500"><span>Min Rating</span> <span className="text-white flex items-center gap-1">{minRating} <Star className="w-3 h-3 fill-amber-500 text-amber-500" /></span></div>
                    <div className="flex gap-2">
                       {[0, 3, 4, 4.5, 5].map(r => (
                         <button key={r} onClick={() => setMinRating(r)} className={`flex-grow py-3 rounded-xl border text-[10px] font-black transition-all ${minRating === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}>{r}+</button>
                       ))}
                    </div>
                  </div>
                  <div className="flex items-end"><button onClick={resetFilters} className="w-full bg-slate-800 py-4 rounded-xl text-[10px] font-black uppercase text-slate-300 hover:bg-slate-700 transition-all tracking-widest">Reset Filters</button></div>
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
      {view === 'legal' && renderLegal()}
      
      {view === 'about' && (
        <section className="max-w-7xl mx-auto px-4 py-40 animate-in fade-in">
          <div className="max-w-5xl space-y-24">
            <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter uppercase leading-[0.82]">THE <br /><span className="text-indigo-500">LUMINA</span> <br />OPERATIVE.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8 p-12 bg-slate-900 rounded-[56px] border border-slate-800 shadow-2xl">
                <Zap className="w-12 h-12 text-indigo-500" />
                <h3 className="text-4xl font-black uppercase tracking-tighter">Tactical Speed</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">Built for zero-friction deployment. Our templates and bots allow you to go from concept to live production in hours.</p>
              </div>
              <div className="space-y-8 p-12 bg-slate-900 rounded-[56px] border border-slate-800 shadow-2xl">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
                <h3 className="text-4xl font-black uppercase tracking-tighter">Military Grade</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">Every asset is pre-audited by top-tier penetration testers and hardened against modern threat vectors.</p>
              </div>
            </div>
            <button onClick={() => navigateTo('store')} className="mt-16 text-indigo-500 font-black uppercase text-xs tracking-[0.5em] flex items-center gap-6 hover:translate-x-6 transition-transform group">
              Deploy Solutions Now <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>
      )}

      {view === 'contact' && (
        <section className="max-w-7xl mx-auto px-4 py-40 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-16">
              <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85]">Establish <br /><span className="text-indigo-500">Contact.</span></h2>
              {contactSubmitted ? (
                <div className="p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-[56px] animate-in zoom-in-95 shadow-2xl">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-8" />
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Transmission Successful.</h4>
                  <p className="text-slate-400 mt-4 text-lg font-medium">Brief received. Expect a response on secure channels within 12 operational hours.</p>
                </div>
              ) : (
                <div className="space-y-10">
                   <p className="text-xl text-slate-400 font-medium">Choose your preferred channel for infrastructure hardening inquiries or mission briefings.</p>
                   <div className="space-y-6">
                      <a href="mailto:alextechenterprise@gmail.com" className="flex items-center gap-8 p-10 bg-slate-900 rounded-[48px] border border-slate-800 shadow-xl group hover:border-indigo-500 transition-all outline-none">
                        <Mail className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-2">Technical HQ (Gmail)</p><p className="text-2xl font-black">alextechenterprise@gmail.com</p></div>
                      </a>
                      <a href="https://wa.me/2348072760199" target="_blank" rel="noopener noreferrer" className="flex items-center gap-8 p-10 bg-slate-900 rounded-[48px] border border-slate-800 shadow-xl group hover:border-emerald-500 transition-all outline-none">
                        <MessageCircle className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-2">WhatsApp Business</p><p className="text-2xl font-black">08072760199</p></div>
                      </a>
                      <a href="https://x.com/esekhegbe70321" target="_blank" rel="noopener noreferrer" className="flex items-center gap-8 p-10 bg-slate-900 rounded-[48px] border border-slate-800 shadow-xl group hover:border-blue-400 transition-all outline-none">
                        <Twitter className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                        <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-2">Social Matrix (X)</p><p className="text-2xl font-black">@esekhegbe70321</p></div>
                      </a>
                   </div>
                </div>
              )}
            </div>
            {!contactSubmitted && (
              <div className="bg-slate-900 p-12 rounded-[64px] border border-slate-800 shadow-2xl">
                <form className="space-y-10" onSubmit={handleContactSubmit}>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2">Operative Name</label>
                    <input required type="text" placeholder="Identity Verification" className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-7 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2">Briefing</label>
                    <textarea required placeholder="Requirements..." className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-7 text-sm outline-none h-48 resize-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 py-7 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-2xl flex items-center justify-center gap-4">
                    Send Secure Transmission <Send className="w-4 h-4" />
                  </button>
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
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-[64px] overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-in zoom-in-95 h-[90vh] lg:h-auto">
            <button onClick={() => setActiveProduct(null)} className="absolute top-10 right-10 p-5 bg-slate-800 hover:bg-red-500 rounded-full text-white z-20 transition-all"><X className="w-6 h-6" /></button>
            <div className="lg:w-1/2 h-80 lg:h-auto shrink-0 relative overflow-hidden">
               <img src={activeProduct.image} className="w-full h-full object-cover opacity-60" alt={activeProduct.name} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>
            <div className="lg:w-1/2 p-14 lg:p-24 flex flex-col justify-center overflow-y-auto">
              <span className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.6em] mb-8 block">{activeProduct.category}</span>
              <h2 className="text-4xl md:text-7xl font-black mb-10 leading-[0.9] tracking-tighter uppercase">{activeProduct.name}</h2>
              <p className="text-slate-400 mb-12 leading-relaxed font-medium text-xl">{activeProduct.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                {activeProduct.specs.map(s => (
                  <div key={s} className="flex items-center gap-5 text-[11px] font-black uppercase tracking-widest text-slate-300 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/30 group">
                    <CheckCircle className="w-5 h-5 text-emerald-500 group-hover:scale-125 transition-transform" /> {s}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-12 border-t border-slate-800 mt-auto">
                <div>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Fee</p>
                   <p className="text-5xl font-black">${activeProduct.price.toLocaleString()}<span className="text-sm text-slate-500 font-bold ml-2">{activeProduct.billingModel === 'Subscription' ? '/mo' : ''}</span></p>
                </div>
                <button onClick={() => { addToCart(activeProduct); setActiveProduct(null); }} className="bg-white text-slate-900 px-16 py-8 rounded-[32px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95">
                  Deploy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={updateQuantity} onRemove={removeItem} onCheckout={navigateToCheckout} />
      <AIChat products={allProducts} />

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-slate-800 pt-40 pb-20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 mb-40">
          <div className="space-y-12">
            <button onClick={() => navigateTo('store')} className="flex items-center gap-5 outline-none text-left">
              <Shield className="w-14 h-14 text-indigo-500" />
              <span className="text-4xl font-black uppercase tracking-tighter">Lumina</span>
            </button>
            <p className="text-slate-500 text-xl font-medium leading-relaxed">Securing the digital frontier through autonomous intelligence and military-grade protection.</p>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-12">Marketplace</h5>
            <ul className="space-y-7 text-slate-500 text-[11px] font-black uppercase tracking-widest">
              <li><button onClick={() => { navigateTo('store'); setSelectedCategory(Category.TRADING_BOTS); }} className="hover:text-white transition-colors">Trading Bots</button></li>
              <li><button onClick={() => { navigateTo('store'); setSelectedCategory(Category.SAAS); }} className="hover:text-white transition-colors">SaaS Infrastructure</button></li>
              <li><button onClick={() => { navigateTo('store'); setSelectedCategory(Category.TEMPLATES); }} className="hover:text-white transition-colors">Templates</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-12">Connect</h5>
            <ul className="space-y-7 text-slate-500 text-[11px] font-black uppercase tracking-widest">
              <li><a href="mailto:alextechenterprise@gmail.com" className="hover:text-white transition-colors flex items-center gap-3"><Mail className="w-4 h-4" /> Email Technical HQ</a></li>
              <li><a href="https://wa.me/2348072760199" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-3"><MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp Direct</a></li>
              <li><a href="https://x.com/esekhegbe70321" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-3"><Twitter className="w-4 h-4 text-blue-400" /> X (Twitter)</a></li>
            </ul>
          </div>
          <div className="space-y-12">
            <h5 className="font-black text-xs uppercase tracking-[0.5em] text-slate-300 mb-12">Secure Briefing</h5>
            {newsletterSubscribed ? (
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl animate-in fade-in">
                  <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Authorized Transmission Active.</p>
               </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl focus-within:ring-2 ring-indigo-500 transition-all">
                <input required type="email" placeholder="agent@org.io" className="bg-transparent px-7 py-6 w-full text-xs outline-none font-medium" />
                <button type="submit" className="bg-indigo-600 p-6 hover:bg-indigo-500 transition-colors"><ChevronRight className="w-7 h-7" /></button>
              </form>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 gap-8">
          <p>© 2024 LUMINA SECURE SYSTEMS. ALL OPS PROTECTED WORLDWIDE.</p>
          <div className="flex flex-wrap justify-center gap-12">
            <button onClick={() => navigateTo('legal', 'privacy-policy')} className="hover:text-white transition-colors">Privacy Shell</button>
            <button onClick={() => navigateTo('legal', 'service-terms')} className="hover:text-white transition-colors">Service Terms</button>
            <button onClick={() => navigateTo('legal', 'risk-disclaimer')} className="hover:text-white transition-colors">Risk Disclaimer</button>
            <button onClick={() => navigateTo('admin-login')} className="hover:text-indigo-500 transition-colors flex items-center gap-2"><Key className="w-3 h-3" /> System Access</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
