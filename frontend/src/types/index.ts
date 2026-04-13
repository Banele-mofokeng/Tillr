export type PaymentMethod = 'Cash' | 'Card' | 'Other';
export type SaleStatus = 'Completed' | 'Voided';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Food' | 'Retail';
  barcode?: string;
  isActive: boolean;
}

export interface SaleItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  reference: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  status: SaleStatus;
  createdAt: string;
  items: SaleItem[];
}

export interface DailySummary {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  cashTotal: number;
  cardTotal: number;
  otherTotal: number;
}

// Cart types (frontend only)
export interface CartItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Business {
  businessId: string;
  businessName: string;
  slug: string;
}
