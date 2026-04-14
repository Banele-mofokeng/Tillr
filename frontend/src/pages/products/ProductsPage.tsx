import { useCallback, useEffect, useState } from 'react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../api';
import CameraScanner from '../../components/ui/CameraScanner';
import { useHidScanner } from '../../hooks/useHidScanner';
import { useAuthStore } from '../../store/authStore';
import type { Product } from '../../types';
import { formatZAR } from '../../utils/format';

type Category = 'Food' | 'Retail';

interface FormState {
  name: string;
  price: string;
  category: Category;
  barcode: string;
  isActive: boolean;
}

const emptyForm = (): FormState => ({
  name: '',
  price: '',
  category: 'Retail',
  barcode: '',
  isActive: true,
});

export default function ProductsPage() {
  const { business } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = () => {
    if (!business) return;
    setLoading(true);
    // Fetch all including inactive for management view
    getProducts(business.businessId)
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [business]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price.toString(),
      category: p.category,
      barcode: p.barcode ?? '',
      isActive: p.isActive,
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!business) return;
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('Valid price is required.'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        businessId: business.businessId,
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category,
        barcode: form.barcode.trim() || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!business || !confirmDeleteId) return;
    await deleteProduct(confirmDeleteId, business.businessId);
    setConfirmDeleteId(null);
    load();
  };

  // Barcode scan into the form field
  const handleBarcodeScan = useCallback((barcode: string) => {
    setForm(f => ({ ...f, barcode }));
    setShowCamera(false);
  }, []);

  useHidScanner(handleBarcodeScan, showForm && !showCamera);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode ?? '').includes(search)
  );

  return (
    <>
      {showCamera && (
        <CameraScanner onScan={handleBarcodeScan} onClose={() => setShowCamera(false)} />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div>
              <p className="text-white font-bold text-base">Remove this product?</p>
              <p className="text-neutral-400 text-sm mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl py-3 text-sm transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-base">
                {editingId ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider">Name</label>
              <input
                className="mt-1 w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
                placeholder="e.g. Coke 500ml"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Price (R)</label>
                <input
                  className="mt-1 w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Category</label>
                <select
                  className="mt-1 w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                >
                  <option value="Retail">Retail</option>
                  <option value="Food">Food</option>
                </select>
              </div>
            </div>

            {/* Barcode */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider">Barcode (optional)</label>
              <div className="flex gap-2 mt-1">
                <input
                  className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
                  placeholder="Scan or type barcode"
                  value={form.barcode}
                  onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                />
                <button
                  onClick={() => setShowCamera(true)}
                  className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-3 text-lg transition-colors"
                  title="Scan barcode with camera"
                >
                  📷
                </button>
              </div>
              <p className="text-neutral-600 text-xs mt-1">USB scanner: just scan the product while this field is focused</p>
            </div>

            {/* Active toggle (edit only) */}
            {editingId && (
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-amber-400' : 'bg-neutral-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-neutral-300">{form.isActive ? 'Active' : 'Hidden from till'}</span>
              </label>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold rounded-xl py-3 text-sm transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main page */}
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            Products · {products.filter(p => p.isActive).length} active
          </p>
          <button
            onClick={openCreate}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl px-4 py-2 transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Search */}
        <input
          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-neutral-600"
          placeholder="Search by name or barcode..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* List */}
        {loading ? (
          <p className="text-neutral-500 text-sm py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-neutral-600 text-sm">No products yet.</p>
            <p className="text-neutral-700 text-xs">Add your first product to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div
                key={p.id}
                className={`bg-neutral-900 border rounded-xl px-4 py-3 flex items-center gap-3 ${p.isActive ? 'border-neutral-800' : 'border-neutral-800 opacity-50'}`}
              >
                {/* Category pill */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${p.category === 'Food' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
                  {p.category}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                  {p.barcode && (
                    <p className="text-neutral-600 text-xs font-mono mt-0.5">{p.barcode}</p>
                  )}
                </div>

                {/* Price */}
                <p className="text-amber-400 font-bold text-sm shrink-0">{formatZAR(p.price)}</p>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-neutral-500 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="text-neutral-600 hover:text-red-400 text-sm px-2 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
