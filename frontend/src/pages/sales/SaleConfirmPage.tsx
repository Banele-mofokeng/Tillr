import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { formatZAR } from '../../utils/format';

export default function SaleConfirmPage() {
  const { saleId } = useParams();
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const change = parseFloat(params.get('change') ?? '0');
  const navigate = useNavigate();

  const sendWhatsApp = () => {
    const changeText = change > 0 ? `\nChange: ${formatZAR(change)}` : '';
    const msg = encodeURIComponent(`Receipt\nSale #${ref}${changeText}\nThank you for your purchase!`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl">
          ✓
        </div>

        <div>
          <p className="text-white text-2xl font-black">Sale Confirmed</p>
          <p className="text-neutral-400 text-sm mt-1">Reference #{ref}</p>
        </div>

        {/* Change display */}
        {change > 0 && (
          <div className="bg-green-900 border border-green-700 rounded-2xl px-6 py-4">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">Change to give</p>
            <p className="text-green-300 text-4xl font-black mt-1">{formatZAR(change)}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={sendWhatsApp}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl py-3 text-sm transition-colors"
          >
            Send WhatsApp Receipt
          </button>
          <button
            onClick={() => navigate('/sales/new')}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl py-3 text-sm transition-colors"
          >
            New Sale
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-neutral-500 hover:text-white text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
