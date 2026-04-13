import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailySummary, getSalesToday } from '../../api';
import { useAuthStore } from '../../store/authStore';
import type { DailySummary, Sale } from '../../types';
import { formatZAR, formatTime } from '../../utils/format';

export default function DashboardPage() {
  const { business } = useAuthStore();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;
    Promise.all([
      getDailySummary(business.businessId),
      getSalesToday(business.businessId),
    ]).then(([s, sales]) => {
      setSummary(s);
      setRecentSales(sales.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [business]);

  if (loading) return <div className="p-6 text-neutral-500 text-sm">Loading...</div>;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Today's total */}
      <div className="bg-amber-400 rounded-2xl p-6">
        <p className="text-amber-900 text-xs font-semibold uppercase tracking-wider">Today's Revenue</p>
        <p className="text-4xl font-black text-black mt-1">
          {formatZAR(summary?.totalRevenue ?? 0)}
        </p>
        <p className="text-amber-800 text-sm mt-1">{summary?.totalTransactions ?? 0} transactions</p>
      </div>

      {/* Payment breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Cash', value: summary?.cashTotal ?? 0 },
          { label: 'Card', value: summary?.cardTotal ?? 0 },
          { label: 'Other', value: summary?.otherTotal ?? 0 },
        ].map((item) => (
          <div key={item.label} className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
            <p className="text-neutral-500 text-xs">{item.label}</p>
            <p className="text-white font-bold text-sm mt-1">{formatZAR(item.value)}</p>
          </div>
        ))}
      </div>

      {/* New Sale CTA */}
      <button
        onClick={() => navigate('/sales/new')}
        className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400 rounded-2xl py-4 text-white font-bold text-sm transition-all"
      >
        + New Sale
      </button>

      {/* Recent sales */}
      {recentSales.length > 0 && (
        <div>
          <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-2">Recent</p>
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-sm font-semibold">
                    #{sale.reference}
                    {sale.customerName && <span className="text-neutral-400 font-normal"> · {sale.customerName}</span>}
                  </p>
                  <p className="text-neutral-500 text-xs">{formatTime(sale.createdAt)} · {sale.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${sale.status === 'Voided' ? 'text-red-400 line-through' : 'text-white'}`}>
                    {formatZAR(sale.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
