import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getInvestments, createInvestment, deleteInvestment } from '../services/investmentService';
import { getPortfolios } from '../services/portfolioService';
import { getAssets } from '../services/assetService';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export default function InvestmentsPage() {
  const { data: investments, loading, execute: refetch } = useApi(getInvestments);
  const { data: portfolios } = useApi(getPortfolios);
  const { data: assets } = useApi(getAssets);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ portfolio_id: '', asset_id: '', quantity: '', purchase_price: '' });
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createInvestment(form);
      success('Investment added!');
      setShowModal(false);
      refetch();
    } catch (err) { toastError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this investment?')) return;
    try { await deleteInvestment(id); success('Removed'); refetch(); }
    catch { toastError('Failed'); }
  };

  const columns = [
    { key: 'portfolio_name', label: 'Portfolio', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'asset_name', label: 'Asset' },
    { key: 'asset_class', label: 'Class' },
    { key: 'quantity', label: 'Qty', render: (val) => <span className="font-mono">{val}</span> },
    { key: 'purchase_price', label: 'Purchase Price', render: (val) => <span className="font-mono">${Number(val).toLocaleString()}</span> },
    {
      key: 'investment_id', label: 'Actions',
      render: (id) => (
        <button onClick={() => handleDelete(id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Investments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{(investments || []).length} investment positions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Investment</button>
      </div>

      <div className="card p-5">
        {loading ? <SkeletonTable /> : (investments || []).length === 0 ? (
          <EmptyState title="No investments yet" />
        ) : <DataTable columns={columns} data={investments || []} />}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Investment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Portfolio</label>
            <select className="input" value={form.portfolio_id} onChange={(e) => setForm({ ...form, portfolio_id: e.target.value })} required>
              <option value="">Select portfolio</option>
              {(portfolios || []).map((p) => <option key={p.portfolio_id} value={p.portfolio_id}>{p.name || p.portfolio_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Asset</label>
            <select className="input" value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })} required>
              <option value="">Select asset</option>
              {(assets || []).map((a) => <option key={a.asset_id} value={a.asset_id}>{a.name || a.asset_name} ({a.asset_class || a.class_name || 'Asset'})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Quantity</label><input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" min="1" required /></div>
            <div><label className="label">Purchase Price ($)</label><input type="number" className="input" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} placeholder="0.00" min="0" step="0.01" required /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}