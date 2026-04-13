import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSale, getProductByBarcode, getProducts } from '../../api';
import CameraScanner from '../../components/ui/CameraScanner';
import { useHidScanner } from '../../hooks/useHidScanner';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import type { PaymentMethod, Product } from '../../types';
import { formatZAR } from '../../utils/format';

export default function NewSalePage() {
  const { business } = useAuthStore();
  const navigate = useNavigate();
  const cart = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [tendered, setTendered] = useState('');
  const [charging, setCharging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (business) getProducts(business.businessId).then(setProducts);
    cart.clearCart();
  }, []);

  const handleBarcodeScan = useCallback(async (barcode: string) => {
    if (!business) return;
    setShowCamera(false);
    try {
      const product = await getProductByBarcode(business.businessId, barcode);
      cart.addItem({ productId: product.id, name: product.name, quantity: 1, unitPrice: product.price });
      setScanFeedback({ message: `✓ ${product.name} added`, type: 'success' });
    } catch {
      setScanFeedback({ message: `No product found for barcode: ${barcode}`, type: 'error' });
    }
    setTimeout(() => setScanFeedback(null), 2500);
  }, [business, cart]);

  useHidScanner(handleBarcodeScan, !showCamera);

  const addProduct = (p: Product) =>
    cart.addItem({ productId: p.id, name: p.name, quantity: 1, unitPrice: p.price });

  const addManual = () => {
    if (!manualName || !manualPrice) return;
    cart.addItem({ name: manualName, quantity: parseFloat(manualQty) || 1, unitPrice: parseFloat(manualPrice) });
    setManualName(''); setManualPrice(''); setManualQty('1');
  };

  const total = cart.total();
  const tenderedAmount = parseFloat(tendered) || 0;
  const change = tenderedAmount - total;

  // Quick cash amounts — round numbers above the total
  const quickAmounts = [10, 20, 50, 100, 200].filter(n => n >= Math.ceil(total));

  const handleCharge = async () => {
    if (!business || cart.items.length === 0 || !selectedMethod) return;
    if (selectedMethod === 'Cash' && tenderedAmount < total) return;
    setCharging(true);
    try {
      const result = await createSale({
        businessId: business.businessId,
        customerName: cart.customerName || undefined,
        paymentMethod: selectedMethod,
        items: cart.items,
      });
      navigate(`/sales/confirm/${result.saleId}?ref=${result.reference}&change=${change > 0 ? change.toFixed(2) : 0}`);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setCharging(false);
    }
  };

  const openPayment = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setTendered('');
  };

  return (
    <>
      {showCamera && <CameraScanner onScan={handleBarcodeScan} onClose={() => setShowCamera(false)} />}

      <div className="p-4 max-w-lg mx-auto space-y-4 pb-36">
        {/* Customer name */}
        <input
          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
          placeholder="Customer / table name (optional)"
          value={cart.customerName}
          onChange={(e) => cart.setCustomerName(e.target.value)}
        />

        {/* Scan feedback */}
        {scanFeedback && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${scanFeedback.type === 'success' ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'}`}>
            {scanFeedback.message}
          </div>
        )}

        {/* Scan controls */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowCamera(true)} className="bg-neutral-900 border border-neutral-700 hover:border-amber-400 rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all">
            <span className="text-lg">📷</span> Scan with Camera
          </button>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-3 text-sm text-neutral-500 flex items-center justify-center gap-2">
            <span className="text-lg">🔫</span> Scanner ready
          </div>
        </div>

        {/* Product shortcuts */}
        {products.length > 0 && (
          <div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-2">Quick Add</p>
            <div className="grid grid-cols-3 gap-2">
              {products.filter(p => p.isActive).map((p) => (
                <button key={p.id} onClick={() => addProduct(p)} className="bg-neutral-900 border border-neutral-800 hover:border-amber-400 rounded-xl p-3 text-left transition-all">
                  <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-amber-400 text-xs mt-1">{formatZAR(p.price)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual item */}
        <div>
          <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-2">Add Item Manually</p>
          <div className="flex gap-2">
            <input className="flex-1 bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600" placeholder="Item name" value={manualName} onChange={(e) => setManualName(e.target.value)} />
            <input className="w-20 bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600" placeholder="Price" type="number" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} />
            <input className="w-14 bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600" placeholder="Qty" type="number" value={manualQty} onChange={(e) => setManualQty(e.target.value)} />
            <button onClick={addManual} className="bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl px-4 text-sm transition-colors">+</button>
          </div>
        </div>

        {/* Cart */}
        {cart.items.length > 0 && (
          <div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-2">Cart</p>
            <div className="space-y-2">
              {cart.items.map((item, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-neutral-500 text-xs">{formatZAR(item.unitPrice)} × {item.quantity}</p>
                  </div>
                  <p className="text-white font-bold text-sm">{formatZAR(item.lineTotal)}</p>
                  <button onClick={() => cart.removeItem(i)} className="text-neutral-600 hover:text-red-400 text-lg">×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom charge bar */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-neutral-950 border-t border-neutral-800">
          {!showPayment ? (
            <div className="p-4">
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black text-lg rounded-xl py-4 transition-colors"
              >
                Charge {formatZAR(total)}
              </button>
            </div>
          ) : !selectedMethod ? (
            /* Step 1 — pick payment method */
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">How are they paying?</p>
                <button onClick={() => setShowPayment(false)} className="text-neutral-600 hover:text-white text-sm">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'Card', 'Other'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => openPayment(method)}
                    className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-white font-bold rounded-xl py-3 text-sm transition-all"
                  >
                    {method === 'Cash' ? '💵' : method === 'Card' ? '💳' : '🔄'} {method}
                  </button>
                ))}
              </div>
            </div>
          ) : selectedMethod === 'Cash' ? (
            /* Step 2 — cash change calculator */
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Cash Payment</p>
                <button onClick={() => setSelectedMethod(null)} className="text-neutral-600 hover:text-white text-sm">← Back</button>
              </div>

              {/* Total due */}
              <div className="flex justify-between items-center bg-neutral-900 rounded-xl px-4 py-3">
                <span className="text-neutral-400 text-sm">Total due</span>
                <span className="text-white font-black text-lg">{formatZAR(total)}</span>
              </div>

              {/* Amount tendered */}
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Amount received</label>
                <input
                  className="mt-1 w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={tendered}
                  onChange={(e) => setTendered(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.slice(0, 5).map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTendered(amount.toString())}
                    className={`flex-1 min-w-12 py-2 rounded-xl text-sm font-bold transition-all border ${tendered === amount.toString() ? 'bg-amber-400 text-black border-amber-400' : 'bg-neutral-800 text-white border-neutral-700 hover:border-amber-400'}`}
                  >
                    R{amount}
                  </button>
                ))}
              </div>

              {/* Change display */}
              {tenderedAmount > 0 && (
                <div className={`rounded-xl px-4 py-3 flex justify-between items-center ${change >= 0 ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
                  <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {change >= 0 ? 'Change to give' : 'Still owes'}
                  </span>
                  <span className={`text-xl font-black ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {formatZAR(Math.abs(change))}
                  </span>
                </div>
              )}

              <button
                onClick={handleCharge}
                disabled={charging || tenderedAmount < total}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-base rounded-xl py-4 transition-colors"
              >
                {charging ? 'Processing...' : tenderedAmount < total ? `Need ${formatZAR(total - tenderedAmount)} more` : 'Confirm Sale'}
              </button>
            </div>
          ) : (
            /* Step 2 — Card / Other (no change needed) */
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">{selectedMethod} Payment</p>
                <button onClick={() => setSelectedMethod(null)} className="text-neutral-600 hover:text-white text-sm">← Back</button>
              </div>
              <div className="flex justify-between items-center bg-neutral-900 rounded-xl px-4 py-3">
                <span className="text-neutral-400 text-sm">Total due</span>
                <span className="text-white font-black text-lg">{formatZAR(total)}</span>
              </div>
              <button
                onClick={handleCharge}
                disabled={charging}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black text-base rounded-xl py-4 transition-colors"
              >
                {charging ? 'Processing...' : 'Confirm Sale'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
