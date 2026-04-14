import { useEffect, useState } from 'react';
import { getSalesByDate, voidSale } from '../../api';
import { useAuthStore } from '../../store/authStore';
import type { Sale } from '../../types';
import { formatTime, formatZAR } from '../../utils/format';

function toLocalDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function VoidConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <div>
          <p className="text-white font-bold text-base">Void this sale?</p>
          <p className="text-neutral-400 text-sm mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl py-3 text-sm transition-colors"
          >
            Void Sale
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { business } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [sales, setSales] = useState<Sale[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmVoidId, setConfirmVoidId] = useState<string | null>(null);

  const load = (date: string) => {
    if (!business) return;
    setLoading(true);
    getSalesByDate(business.businessId, date).then(setSales).finally(() => setLoading(false));
  };

  useEffect(() => { load(selectedDate); }, [business, selectedDate]);

  const handleVoid = async () => {
    if (!business || !confirmVoidId) return;
    await voidSale(confirmVoidId, business.businessId);
    setConfirmVoidId(null);
    load(selectedDate);
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    if (d > new Date()) return;
    setSelectedDate(toLocalDateString(d));
  };

  const isToday = selectedDate === toLocalDateString(new Date());

  return (
    <>
      {confirmVoidId && (
        <VoidConfirmDialog
          onConfirm={handleVoid}
          onCancel={() => setConfirmVoidId(null)}
        />
      )}

      <div className="p-4 max-w-lg mx-auto space-y-3">
        {/* Date navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm transition-colors"
          >
            ‹
          </button>

          <div className="flex-1 flex items-center justify-center gap-2">
            <label htmlFor="history-date" className="sr-only">Select date</label>
            <input
              id="history-date"
              type="date"
              value={selectedDate}
              max={toLocalDateString(new Date())}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
            />
            {isToday && (
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Today</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => changeDate(1)}
            disabled={isToday}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white text-sm transition-colors"
          >
            ›
          </button>
        </div>

        {loading && <div className="text-neutral-500 text-sm text-center py-8">Loading...</div>}

        {!loading && sales.length === 0 && (
          <div className="text-neutral-600 text-sm text-center py-12">No sales on this date.</div>
        )}

        {!loading && sales.map((sale) => (
          <div key={sale.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <button
              type="button"
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
                    type="button"
                    onClick={() => setConfirmVoidId(sale.id)}
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
    </>
  );
}
