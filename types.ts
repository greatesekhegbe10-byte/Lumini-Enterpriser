
export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  rating: number;
  specs: string[]; 
  billingModel: 'Subscription' | 'One-time' | 'Service';
  disclaimer?: string; // For Trading Bots or high-risk assets
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Completed' | 'Pending';
  paymentMethod: 'Paystack' | 'Flutterwave';
}

export enum Category {
  SAAS = 'SaaS Software',
  TRADING_BOTS = 'Trading Bots',
  TEMPLATES = 'Web Templates',
  DIGITAL_ASSETS = 'Digital Assets',
  CYBERSECURITY = 'Cybersecurity',
  ECOMMERCE_DEV = 'E-commerce Dev',
  ALL = 'All Solutions'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
