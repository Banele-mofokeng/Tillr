import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NewSalePage from './pages/sales/NewSalePage';
import SaleConfirmPage from './pages/sales/SaleConfirmPage';
import HistoryPage from './pages/history/HistoryPage';
import SummaryPage from './pages/summary/SummaryPage';
import ProductsPage from './pages/products/ProductsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const business = useAuthStore((s) => s.business);
  if (!business) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sales/new" element={<NewSalePage />} />
          <Route path="sales/confirm/:saleId" element={<SaleConfirmPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="summary" element={<SummaryPage />} />
          <Route path="products" element={<ProductsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
