import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getAssets, createAsset, deleteAsset } from '../services/assetService';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RISK_COLOR = { low: 'success', medium: 'warning', high: 'danger' };
const CLASS_COLOR = { equity: 'brand', bond: 'info', crypto: 'warning', commodity: 'default', 'real estate': 'success' };

export default function AssetsPage() {
  const { data: assets, loading, execute: refetch } = useApi(getAssets);
  const { isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', asset_class: 'equity', risk_level: 'medium', current_price: '' });
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();
  const [filterClass, setFilterClass] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAsset(form);
      success('Asset added!');
      setShowModal(false);
      refetch();
    } catch (err) { toastError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    try { await deleteAsset(id); success('Deleted'); refetch(); }
    catch { toastError('Delete failed'); }
  };

  const filtered = (assets || []).filter((a) => !filterClass || a.asset_class === filterClass);
  const classes = [...new Set((assets || []).map((a) => a.asset_class))];

  const columns = [
    { key: 'name', label: 'Asset Name', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'asset_class', label: 'Class', render: (val) => <Badge label={val} variant={CLASS_COLOR[val] || 'default'} /> },
    { key: 'risk_level', label: 'Risk', render: (val) => <Badge label={val} variant={RISK_COLOR[val] || 'default'} /> },
    {
      key: 'current_price', label: 'Current Price',
      render: (val) => <span className="font-mono font-semibold">${Number(val || 0).toLocaleString()}</span>,
    },
    ...(isAdmin ? [{
      key: 'asset_id', label: 'Actions',
      render: (id) => (
        <button onClick={() => handleDelete(id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <Trash2 size={14} />
        </button>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{(assets || []).length} assets tracked</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Asset</button>
        )}
      </div>

      {/* Class filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterClass('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterClass ? 'bg-brand-500 text-white' : 'btn-secondary'}`}>All</button>
        {classes.map((c) => (
          <button key={c} onClick={() => setFilterClass(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterClass === c ? 'bg-brand-500 text-white' : 'btn-secondary'}`}>{c}</button>
        ))}
      </div>

      <div className="card p-5">
        {loading ? <SkeletonTable /> : filtered.length === 0 ? (
          <EmptyState title="No assets found" />
        ) : <DataTable columns={columns} data={filtered} />}
      </div>

      {isAdmin && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Asset">
          <form onSubmit={handleCreate} className="space-y-4">
            <div><label className="label">Asset Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Apple Inc." required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Asset Class</label>
                <select className="input" value={form.asset_class} onChange={(e) => setForm({ ...form, asset_class: e.target.value })}>
                  {['equity', 'bond', 'crypto', 'commodity', 'real estate'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Risk Level</label>
                <select className="input" value={form.risk_level} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                  {['low', 'medium', 'high'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Current Price ($)</label><input type="number" className="input" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: e.target.value })} placeholder="0.00" min="0" step="0.01" required /></div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Add Asset'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}