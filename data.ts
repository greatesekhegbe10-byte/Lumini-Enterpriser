
import { Product, Category } from './types';

export const products: Product[] = [
  // SaaS Products
  {
    id: 's1',
    name: 'TaskFlow Pro',
    category: Category.SAAS,
    price: 29.00,
    description: 'Enterprise-grade project management with real-time neural sync and team tracking.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Team Collaboration', 'Deadline Tracking', 'Cloud Sync'],
    billingModel: 'Subscription'
  },
  {
    id: 's6',
    name: 'NeuralCopy AI',
    category: Category.SAAS,
    price: 89.00,
    description: 'Advanced AI content engine for generating high-conversion marketing copy and technical docs.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['GPT-4 Integration', 'Multi-Language', 'SEO Analysis'],
    billingModel: 'Subscription'
  },
  {
    id: 's7',
    name: 'VaultGuard SIEM',
    category: Category.SAAS,
    price: 199.00,
    description: 'Security Information and Event Management platform for real-time cloud threat detection.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['Real-time Alerts', 'Log Correlation', 'Compliance Ready'],
    billingModel: 'Subscription'
  },

  // Trading Bots
  {
    id: 't1',
    name: 'CryptoBot X',
    category: Category.TRADING_BOTS,
    price: 299.00,
    description: 'Elite automated crypto bot with pre-set alpha strategies. ⚠️ Risk involved.',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Multi-Exchange API', 'Stop-Loss Logic', 'Auto-Hedging'],
    billingModel: 'One-time',
    disclaimer: 'Trading involves risk. Past performance does not guarantee future results.'
  },
  {
    id: 't6',
    name: 'Pulse Forex HFT',
    category: Category.TRADING_BOTS,
    price: 450.00,
    description: 'High-frequency forex trading bot optimized for major pairs. ⚠️ Trading involves high risk.',
    image: 'https://images.unsplash.com/photo-1611974717483-58da8d10fed0?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['Low Latency', 'MT4/MT5 Sync', 'News Filter'],
    billingModel: 'One-time',
    disclaimer: 'High risk investment. Use only risk capital.'
  },

  // Templates
  {
    id: 'w1',
    name: 'Apex Multi-Vendor',
    category: Category.TEMPLATES,
    price: 129.00,
    description: 'Full-stack marketplace template with vendor dashboard and integrated payments.',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['Next.js / Prisma', 'Stripe Ready', 'Dark Mode UI'],
    billingModel: 'One-time'
  },
  {
    id: 'w4',
    name: 'SaaS Launchpad',
    category: Category.TEMPLATES,
    price: 79.00,
    description: 'High-converting landing page for SaaS products with pricing tables and auth flows.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Framer Motion', 'Responsive', 'Lightweight'],
    billingModel: 'One-time'
  },

  // Cybersecurity
  {
    id: 'c1',
    name: 'Full Pentest Audit',
    category: Category.CYBERSECURITY,
    price: 899.00,
    description: 'Deep security penetration testing for web and mobile apps with remediation report.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['OWASP Top 10', 'API Fuzzing', 'Fix Roadmap'],
    billingModel: 'Service'
  },
  {
    id: 'c6',
    name: 'Ransomware Shield',
    category: Category.CYBERSECURITY,
    price: 350.00,
    description: 'Advanced endpoint protection and data recovery backup systems.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['AI Threat Defense', 'Zero-Day Patching', 'Immutable Backups'],
    billingModel: 'Service'
  },

  // E-Commerce Delivery
  {
    id: 'e1',
    name: 'ReadyStore Enterprise',
    category: Category.ECOMMERCE_DEV,
    price: 1499.00,
    description: 'End-to-end bespoke Shopify or Custom build. We handle design, stock, and SEO.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['14-Day Delivery', 'Custom Design', 'SEO Pack'],
    billingModel: 'Service'
  },
  {
    id: 'e6',
    name: 'Growth Optimization',
    category: Category.ECOMMERCE_DEV,
    price: 499.00,
    description: 'Technical CRO and speed optimization for existing e-commerce storefronts.',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['A/B Testing', 'Speed Hardening', 'Cart Recovery'],
    billingModel: 'Service'
  }
];

export const faqs = [
  {
    q: "How does digital product delivery work?",
    a: "Immediately after checkout, assets like templates and trading bot source code are available for download in your User Dashboard."
  },
  {
    q: "What is your refund policy on services?",
    a: "Services like Pentesting and E-commerce delivery are non-refundable once the tactical briefing has commenced."
  }
];
