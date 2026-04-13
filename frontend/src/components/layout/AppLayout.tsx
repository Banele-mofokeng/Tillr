import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '⊞' },
  { to: '/sales/new', label: 'New Sale', icon: '+' },
  { to: '/history', label: 'History', icon: '☰' },
  { to: '/products', label: 'Products', icon: '▦' },
  { to: '/summary', label: 'Summary', icon: '◎' },
];

export default function AppLayout() {
  const { business, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-black tracking-tight">
          till<span className="text-amber-400">r</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">{business?.businessName}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <nav className="bg-neutral-900 border-t border-neutral-800 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
