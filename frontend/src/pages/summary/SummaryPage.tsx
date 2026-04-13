import { useEffect, useState } from 'react';
import { getDailySummary } from '../../api';
import { useAuthStore } from '../../store/authStore';
import type { DailySummary } from '../../types';
import { formatDate, formatZAR } from '../../utils/format';

export default function SummaryPage() {
  const { business } = useAuthStore();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;
    getDailySummary(business.businessId).then(setSummary).finally(() => setLoading(false));
  }, [business]);

  if (loading) return <div className="p-6 text-neutral-500 text-sm">Loading...</div>;
  if (!summary) return null;

  const rows = [
    { label: 'Total Transactions', value: summary.totalTransactions.toString(), highlight: false },
    { label: 'Cash Sales', value: formatZAR(summary.cashTotal), highlight: false },
    { label: 'Card Sales', value: formatZAR(summary.cardTotal), highlight: false },
    { label: 'Other', value: formatZAR(summary.otherTotal), highlight: false },
    { label: 'Total Revenue', value: formatZAR(summary.totalRevenue), highlight: true },
  ];

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div>
        <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">End of Day</p>
        <p className="text-white font-bold text-lg mt-1">{formatDate(summary.date)}</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
        {rows.map((row) => (
          <div key={row.label} className={`flex items-center justify-between px-4 py-4 ${row.highlight ? 'bg-neutral-800' : ''}`}>
            <span className={`text-sm ${row.highlight ? 'text-white font-bold' : 'text-neutral-400'}`}>{row.label}</span>
            <span className={`text-sm font-bold ${row.highlight ? 'text-amber-400 text-lg' : 'text-white'}`}>{row.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          const text = rows.map(r => `${r.label}: ${r.value}`).join('\n');
          const msg = encodeURIComponent(`End of Day Summary\n${formatDate(summary.date)}\n\n${text}`);
          window.open(`https://wa.me/?text=${msg}`, '_blank');
        }}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl py-3 text-sm transition-colors"
      >
        Share via WhatsApp
      </button>
    </div>
  );
}
