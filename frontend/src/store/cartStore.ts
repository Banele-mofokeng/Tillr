import { create } from 'zustand';
import type { CartItem, PaymentMethod } from '../types';

interface CartState {
  items: CartItem[];
  customerName: string;
  paymentMethod: PaymentMethod;
  setCustomerName: (name: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  addItem: (item: Omit<CartItem, 'lineTotal'>) => void;
  updateQty: (index: number, qty: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerName: '',
  paymentMethod: 'Cash',
  setCustomerName: (name) => set({ customerName: name }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, lineTotal: item.quantity * item.unitPrice },
      ],
    })),

  updateQty: (index, qty) =>
    set((state) => ({
      items: state.items.map((item, i) =>
        i === index
          ? { ...item, quantity: qty, lineTotal: qty * item.unitPrice }
          : item
      ),
    })),

  removeItem: (index) =>
    set((state) => ({ items: state.items.filter((_, i) => i !== index) })),

  clearCart: () => set({ items: [], customerName: '', paymentMethod: 'Cash' }),

  total: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),
}));
