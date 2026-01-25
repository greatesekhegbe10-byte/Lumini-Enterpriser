
import { Product, Category } from './types';

export const products: Product[] = [
  // Category 1: SaaS & Software Products
  {
    id: 's1',
    name: 'TaskFlow Pro',
    category: Category.SAAS,
    price: 29.00,
    description: 'Cloud-based project management software to track tasks, teams, and deadlines with real-time sync.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Team Collaboration', 'Deadline Tracking', 'Cloud Sync'],
    billingModel: 'Subscription'
  },
  {
    id: 's2',
    name: 'Insight CRM',
    category: Category.SAAS,
    price: 49.00,
    description: 'Advanced customer relationship management software with built-in analytics and lead automation.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['Lead Scoring', 'Email Automation', 'Sales Pipeline'],
    billingModel: 'Subscription'
  },
  {
    id: 's3',
    name: 'MarketAI',
    category: Category.SAAS,
    price: 39.00,
    description: 'AI-powered marketing automation platform for cross-channel email and social media campaigns.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['AI Copywriting', 'Social Scheduling', 'A/B Testing'],
    billingModel: 'Subscription'
  },
  {
    id: 's4',
    name: 'DataViz Analytics',
    category: Category.SAAS,
    price: 59.00,
    description: 'Real-time analytics dashboard for monitoring websites, sales volume, and key business KPIs.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    specs: ['Live Reporting', 'Custom Dashboards', 'API Export'],
    billingModel: 'Subscription'
  },
  {
    id: 's5',
    name: 'TimeTracker Plus',
    category: Category.SAAS,
    price: 19.00,
    description: 'Lightweight time tracking and productivity software for agile teams and independent operatives.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    specs: ['Invoicing', 'Pomodoro Timer', 'Activity Reports'],
    billingModel: 'Subscription'
  },

  // Category 2: Trading Bots & Financial Tools
  {
    id: 't1',
    name: 'CryptoBot X',
    category: Category.TRADING_BOTS,
    price: 99.00,
    description: 'Automated cryptocurrency trading bot with pre-set strategies. Includes risk management v2. ⚠️ Trading involves risk. Past performance does not guarantee future results.',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Multi-Exchange API', 'Stop-Loss Logic', 'Auto-Hedging'],
    billingModel: 'One-time',
    disclaimer: 'Trading involves risk. Past performance does not guarantee future results.'
  },
  {
    id: 't2',
    name: 'StockTrader AI',
    category: Category.TRADING_BOTS,
    price: 149.00,
    description: 'Stock market trading automation with deep backtesting capabilities. ⚠️ Trading involves risk. Past performance does not guarantee future results.',
    image: 'https://images.unsplash.com/photo-1611974717483-58da8d10fed0?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['Backtesting Engine', 'Algorithmic Execution', 'NYSE/NASDAQ Data'],
    billingModel: 'One-time',
    disclaimer: 'Trading involves risk. Past performance does not guarantee future results.'
  },
  {
    id: 't3',
    name: 'SignalGen Pro',
    category: Category.TRADING_BOTS,
    price: 49.00,
    description: 'High-accuracy trading signal generation tool for crypto and stock markets. ⚠️ Trading involves risk. Past performance does not guarantee future results.',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['Telegram Alerts', 'Custom Indicators', 'Mobile Push'],
    billingModel: 'Subscription',
    disclaimer: 'Trading involves risk. Past performance does not guarantee future results.'
  },
  {
    id: 't4',
    name: 'Portfolio Manager',
    category: Category.TRADING_BOTS,
    price: 29.00,
    description: 'Unified tactical dashboard to track all cross-platform investments in one secure place.',
    image: 'https://images.unsplash.com/photo-1579621970795-87faff2f916a?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    specs: ['Multi-Asset Tracking', 'Net Worth Chart', 'Dividend Logs'],
    billingModel: 'Subscription'
  },
  {
    id: 't5',
    name: 'TradeSim',
    category: Category.TRADING_BOTS,
    price: 39.00,
    description: 'Advanced backtesting and simulation software for stress-testing your own trading strategies.',
    image: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    specs: ['Historical Replay', 'Performance Stats', 'Strategy Builder'],
    billingModel: 'One-time'
  },

  // Category 3: Digital Products & Templates
  {
    id: 'w1',
    name: 'WebStart Template',
    category: Category.TEMPLATES,
    price: 49.00,
    description: 'Fully responsive, high-speed website template built with React and Tailwind CSS for startups.',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['React Based', 'Tailwind Ready', 'SEO Optimized'],
    billingModel: 'One-time'
  },
  {
    id: 'w2',
    name: 'Shopify E-Store Kit',
    category: Category.TEMPLATES,
    price: 79.00,
    description: 'Premium, pre-built Liquid-based Shopify templates designed for high-conversion retail.',
    image: 'https://images.unsplash.com/photo-1522204538344-922f76eba0a4?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Section-Based', 'Cart Drawers', 'Mobile Focused'],
    billingModel: 'One-time'
  },
  {
    id: 'w3',
    name: 'LandingPro',
    category: Category.TEMPLATES,
    price: 29.00,
    description: 'A collection of high-converting landing page templates optimized for PPC and social campaigns.',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['Single Page', 'Lead Forms', 'Fast Load'],
    billingModel: 'One-time'
  },
  {
    id: 'd1',
    name: 'UIUX Design Kit',
    category: Category.DIGITAL_ASSETS,
    price: 59.00,
    description: 'A comprehensive library of UI components and dashboard layouts in Figma and Adobe XD formats.',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['Figma File', 'Icon Sets', 'Design Tokens'],
    billingModel: 'One-time'
  },
  {
    id: 'd2',
    name: 'Graphics Pack',
    category: Category.DIGITAL_ASSETS,
    price: 19.00,
    description: 'Elite collection of icons, illustrations, and 3D mockups for professional web and app design.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    specs: ['Vector Formats', '3D Renders', 'Unlimited License'],
    billingModel: 'One-time'
  },
  {
    id: 'd3',
    name: 'SlideDeck Pro',
    category: Category.DIGITAL_ASSETS,
    price: 29.00,
    description: 'Ultra-modern presentation templates for high-stakes business pitches and data reports.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['PPTX / Keynote', 'Data Charts', 'Animation Guides'],
    billingModel: 'One-time'
  },

  // Category 4: E-Commerce Website Delivery Services
  {
    id: 'e1',
    name: 'ReadyStore',
    category: Category.ECOMMERCE_DEV,
    price: 499.00,
    description: 'Full end-to-end e-commerce setup on Shopify or Webflow. We build the store, you own the profits.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['Domain Setup', 'Theme Install', '5 Core Pages'],
    billingModel: 'Service'
  },
  {
    id: 'e2',
    name: 'StoreSpeed',
    category: Category.ECOMMERCE_DEV,
    price: 149.00,
    description: 'Technical performance optimization to achieve 90+ PageSpeed scores on mobile and desktop.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Image Compression', 'Script Deferral', 'CDN Config'],
    billingModel: 'Service'
  },
  {
    id: 'e3',
    name: 'Custom Theme',
    category: Category.ECOMMERCE_DEV,
    price: 299.00,
    description: 'Fully bespoke visual design and template development for a unique digital brand identity.',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['Brand Design', 'Custom Code', 'Unique UX'],
    billingModel: 'Service'
  },
  {
    id: 'e4',
    name: 'IntegratePro',
    category: Category.ECOMMERCE_DEV,
    price: 199.00,
    description: 'Seamless integration of payment gateways, analytics pixels, and CRM pipelines.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['Stripe/PayPal', 'FB/GA4 Pixels', 'Zapier Hooks'],
    billingModel: 'Service'
  },
  {
    id: 'e5',
    name: 'Maintenance Plan',
    category: Category.ECOMMERCE_DEV,
    price: 49.00,
    description: 'Recurring monthly technical support, security patches, and content updates for your store.',
    image: 'https://images.unsplash.com/photo-1581092921461-7033e85ac34a?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    specs: ['Daily Backups', 'App Updates', 'Priority Support'],
    billingModel: 'Subscription'
  },

  // Category 5: Cybersecurity Services
  {
    id: 'c1',
    name: 'Security Audit',
    category: Category.CYBERSECURITY,
    price: 299.00,
    description: 'Comprehensive penetration testing and vulnerability assessment for your cloud infrastructure.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['Pentesting', 'Risk Report', 'Fix Roadmap'],
    billingModel: 'Service'
  },
  {
    id: 'c2',
    name: 'CloudSecure',
    category: Category.CYBERSECURITY,
    price: 199.00,
    description: 'Expert cloud security hardening for AWS, Azure, and GCP environments.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['IAM Hardening', 'VPC Config', 'Encryption Set'],
    billingModel: 'Service'
  },
  {
    id: 'c3',
    name: 'MonitoringPro',
    category: Category.CYBERSECURITY,
    price: 49.00,
    description: '24/7 continuous security monitoring and real-time alerts for unauthorized access attempts.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Log Analysis', 'IP Blacklisting', 'Instant Alerts'],
    billingModel: 'Subscription'
  },
  {
    id: 'c4',
    name: 'SSL Setup',
    category: Category.CYBERSECURITY,
    price: 49.00,
    description: 'End-to-end SSL certificate management and implementation for enterprise domains.',
    image: 'https://images.unsplash.com/photo-1510511459019-5dee99c48db8?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['HTTPS Forced', 'Auto-Renewal', 'CORS Config'],
    billingModel: 'One-time'
  },
  {
    id: 'c5',
    name: 'CyberConsult',
    category: Category.CYBERSECURITY,
    price: 99.00,
    description: 'Hourly private security consultation and risk mitigation planning with elite engineers.',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['Incident Plan', 'Staff Training', 'Risk Scorecard'],
    billingModel: 'Service'
  }
];

export const testimonials = [
  {
    name: "Marcus Vane",
    role: "CTO, CloudScale Inc.",
    content: "Lumina Secure transformed our security posture from reactive to proactive. Their penetration testing was the most rigorous we've ever faced.",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  },
  {
    name: "Elena Rodriguez",
    role: "CEO, NexaFlow",
    content: "The ReadyStore service delivered our storefront in record time. The integrated security and speed gave us an immediate edge.",
    avatar: "https://i.pravatar.cc/150?u=elena"
  },
  {
    name: "Dr. Julian Black",
    role: "Lead Quant, Alpha Hedge",
    content: "The CryptoBot X is significantly more sophisticated than public alternatives. The trend accuracy in volatile markets is remarkable.",
    avatar: "https://i.pravatar.cc/150?u=julian"
  }
];

export const faqs = [
  {
    q: "How does digital product delivery work?",
    a: "Immediately after checkout, assets like templates and trading bot source code are available for download in your User Dashboard."
  },
  {
    q: "Is the ReadyStore delivery truly custom?",
    a: "Yes. Our agile delivery model ensures that once the requirements are locked, your secure storefront goes live with a unique build."
  },
  {
    q: "Can I cancel my SaaS subscription anytime?",
    a: "Absolutely. All subscriptions are manageable via the dashboard with no long-term lock-ins unless enterprise contracts are specified."
  }
];
