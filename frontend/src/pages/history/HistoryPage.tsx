import { useEffect, useState } from 'react';
import { getSalesToday, voidSale } from '../../api';
import { useAuthStore } from '../../store/authStore';
import type { Sale } from '../../types';
import { formatTime, formatZAR } from '../../utils/format';

export default function HistoryPage() {
  const { business } = useAuthStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!business) return;
    getSalesToday(business.businessId).then(setSales).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [business]);

  const handleVoid = async (saleId: string) => {
    if (!business) return;
    if (!confirm('Void this sale?')) return;
    await voidSale(saleId, business.businessId);
    load();
  };

  if (loading) return <div className="p-6 text-neutral-500 text-sm">Loading...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-3">
      <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">Today's Sales</p>

      {sales.length === 0 && (
        <div className="text-neutral-600 text-sm text-center py-12">No sales yet today.</div>
      )}

      {sales.map((sale) => (
        <div key={sale.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          {/* Summary row */}
          <button
            className="w-full px-4 py-3 flex items-center justify-between text-left"
            onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
          >
            <div>
              <p className="text-white text-sm font-semibold">
                #{sale.reference}
                {sale.customerName && (
                  <span className="text-neutral-400 font-normal"> · {sale.customerName}</span>
                )}
              </p>
              <p className="text-neutral-500 text-xs">{formatTime(sale.createdAt)} · {sale.paymentMethod}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold text-sm ${sale.status === 'Voided' ? 'text-red-400 line-through' : 'text-white'}`}>
                {formatZAR(sale.totalAmount)}
              </p>
              {sale.status === 'Voided' && <p className="text-red-500 text-xs">Voided</p>}
            </div>
          </button>

          {/* Expanded items */}
          {expanded === sale.id && (
            <div className="border-t border-neutral-800 px-4 pb-4 pt-3 space-y-2">
              {sale.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-neutral-300">{item.name} × {item.quantity}</span>
                  <span className="text-neutral-400">{formatZAR(item.lineTotal)}</span>
                </div>
              ))}
              <div className="border-t border-neutral-800 pt-2 flex justify-between font-bold text-sm">
                <span className="text-white">Total</span>
                <span className="text-amber-400">{formatZAR(sale.totalAmount)}</span>
              </div>
              {sale.status !== 'Voided' && (
                <button
                  onClick={() => handleVoid(sale.id)}
                  className="w-full mt-2 text-red-400 hover:text-red-300 text-xs border border-red-900 hover:border-red-500 rounded-lg py-2 transition-colors"
                >
                  Void Sale
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
