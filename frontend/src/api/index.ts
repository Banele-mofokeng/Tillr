import { api } from './client';
import type { CartItem, DailySummary, PaymentMethod, Product, Sale } from '../types';

// Auth
export const login = (slug: string, pin: string) =>
  api.post('/auth/login', { slug, pin }).then(r => r.data);

// Sales
export const getSalesToday = (businessId: string): Promise<Sale[]> =>
  api.get(`/sales/${businessId}/today`).then(r => r.data);

export const getSalesByDate = (businessId: string, date: string): Promise<Sale[]> =>
  api.get(`/sales/${businessId}/by-date`, { params: { date } }).then(r => r.data);

export const getDailySummary = (businessId: string, date?: string): Promise<DailySummary> =>
  api.get(`/sales/${businessId}/summary`, { params: { date } }).then(r => r.data);

export const createSale = (payload: {
  businessId: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}) => api.post('/sales', payload).then(r => r.data);

export const voidSale = (saleId: string, businessId: string) =>
  api.patch(`/sales/${saleId}/void`, null, { params: { businessId } }).then(r => r.data);

// Products
export const getProducts = (businessId: string): Promise<Product[]> =>
  api.get(`/products/${businessId}`).then(r => r.data);

export const getProductByBarcode = (businessId: string, barcode: string): Promise<Product> =>
  api.get(`/products/${businessId}/barcode/${encodeURIComponent(barcode)}`).then(r => r.data);

export const createProduct = (payload: {
  businessId: string;
  name: string;
  price: number;
  category: string;
  barcode?: string;
}) => api.post('/products', payload).then(r => r.data);

export const updateProduct = (productId: string, payload: {
  businessId: string;
  name: string;
  price: number;
  category: string;
  barcode?: string;
  isActive: boolean;
}) => api.put(`/products/${productId}`, { ...payload, productId }).then(r => r.data);

export const deleteProduct = (productId: string, businessId: string) =>
  api.delete(`/products/${productId}`, { params: { businessId } }).then(r => r.data);
