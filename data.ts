
import { Product, Category } from './types';

export const products: Product[] = [
  // SaaS Products
  {
    id: 's1',
    name: 'Sentinel AI Threat Hunter',
    category: Category.SAAS,
    price: 499.00,
    description: 'Autonomous endpoint detection and response powered by neural networks. Real-time mitigation of zero-day vulnerabilities across multi-cloud environments.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['24/7 Monitoring', 'Neural Engine v4', 'Zero-Day Shield'],
    billingModel: 'Subscription'
  },
  {
    id: 's2',
    name: 'CloudScale Analytics Hub',
    category: Category.SAAS,
    price: 129.00,
    description: 'Enterprise-grade BI and data visualization platform. Scale your data processing with ease using our proprietary compression algorithms.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    specs: ['Real-time Streaming', 'Custom API Hooks', 'SSO Integrated'],
    billingModel: 'Subscription'
  },
  // Trading Bots
  {
    id: 't1',
    name: 'AlphaTrader AI Bot',
    category: Category.TRADING_BOTS,
    price: 199.00,
    description: 'Advanced high-frequency trading bot for crypto and forex. Features neural-link trend analysis and auto-hedging strategies.',
    image: 'https://images.unsplash.com/photo-1611974717483-58da8d10fed0?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['92% Trend Accuracy', 'Multi-exchange API', 'Risk Management v2'],
    billingModel: 'Subscription',
    disclaimer: 'Trading involves significant risk. Past performance does not guarantee future results.'
  },
  // Web Templates
  {
    id: 'w1',
    name: 'Lumina Next.js E-com',
    category: Category.TEMPLATES,
    price: 79.00,
    description: 'Ultra-fast, SEO-optimized e-commerce template. Built with Tailwind CSS, Framer Motion, and Next.js 14 for premium digital storefronts.',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    specs: ['PageSpeed 100', 'Mobile First', 'Source Code Access'],
    billingModel: 'One-time'
  },
  // E-commerce Dev Services
  {
    id: 'e1',
    name: 'Bespoke Store Launchpad',
    category: Category.ECOMMERCE_DEV,
    price: 2499.00,
    description: 'Full-service custom e-commerce website delivery. Design, development, payment integration, and a 12-point security audit included.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['Custom UI/UX', 'Stripe/PayPal Setup', '14 Day Delivery'],
    billingModel: 'Service'
  },
  // Cybersecurity Services
  {
    id: 'c1',
    name: 'Enterprise Penetration Test',
    category: Category.CYBERSECURITY,
    price: 4500.00,
    description: 'Comprehensive infrastructure testing and zero-trust maturity assessment by elite security engineers. Includes detailed remediation roadmap.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    specs: ['Full System Sweep', 'SOC2/GDPR Check', 'Remediation Roadmap'],
    billingModel: 'Service'
  },
  // Digital Assets
  {
    id: 'd1',
    name: 'Hardened Cloud IaC Suite',
    category: Category.DIGITAL_ASSETS,
    price: 149.00,
    description: 'Battle-tested Infrastructure-as-Code templates for AWS, Azure, and GCP. Securely deploy scalable clusters in minutes.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    specs: ['Modular Design', 'Terraform/Ansible', 'Auto-scaling Config'],
    billingModel: 'One-time'
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
    content: "The Bespoke Store Launchpad delivered our storefront in 10 days. The integrated security and speed gave us an immediate edge.",
    avatar: "https://i.pravatar.cc/150?u=elena"
  },
  {
    name: "Dr. Julian Black",
    role: "Lead Quant, Alpha Hedge",
    content: "The AlphaTrader bot is significantly more sophisticated than public alternatives. The trend accuracy in volatile markets is remarkable.",
    avatar: "https://i.pravatar.cc/150?u=julian"
  }
];

export const faqs = [
  {
    q: "How does digital product delivery work?",
    a: "Immediately after checkout, assets like templates and trading bot source code are available for download in your User Dashboard."
  },
  {
    q: "Is the Bespoke Store delivery truly in 14 days?",
    a: "Yes. Our agile delivery model ensures that once the requirements are locked, your secure storefront goes live within a 14-day sprint."
  },
  {
    q: "Can I cancel my SaaS subscription anytime?",
    a: "Absolutely. All subscriptions are manageable via the dashboard with no long-term lock-ins unless enterprise contracts are specified."
  }
];
