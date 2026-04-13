import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const [slug, setSlug] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!slug || !pin) return;
    setLoading(true);
    setError('');
    try {
      const result = await login(slug.trim().toLowerCase(), pin.trim());
      setAuth(result);
      navigate('/dashboard');
    } catch {
      setError('Invalid business ID or PIN. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="text-4xl font-black tracking-tight text-white">
            till<span className="text-amber-400">r</span>
          </span>
          <p className="text-neutral-500 text-sm mt-1">Sales management, simplified</p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-6 space-y-4 border border-neutral-800">
          <div>
            <label className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Business ID</label>
            <input
              className="mt-1 w-full bg-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
              placeholder="e.g. mama-kitchen"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              autoCapitalize="none"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 font-medium uppercase tracking-wider">PIN</label>
            <input
              className="mt-1 w-full bg-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
              placeholder="••••"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold rounded-xl py-3 text-sm transition-colors"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
