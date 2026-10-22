import { useState } from 'react';
import { Plus, Pencil, Trash2, UserCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getInvestors, createInvestor, deleteInvestor } from '../services/investorService';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

const RISK_MAP = { low: 'success', medium: 'warning', high: 'danger' };

export default function InvestorsPage() {
  const { data, loading, execute: refetch } = useApi(getInvestors);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', risk_profile: 'medium' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const { success, error: toastError } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createInvestor(form);
      success('Investor added!');
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', risk_profile: 'medium' });
      refetch();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create investor');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investor?')) return;
    try {
      await deleteInvestor(id);
      success('Investor deleted');
      refetch();
    } catch { toastError('Delete failed'); }
  };

  const filtered = (data || []).filter((inv) =>
    !filter || inv.risk_profile === filter
  );

  const columns = [
    {
      key: 'name', label: 'Investor',
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-semibold">
            {val?.[0]?.toUpperCase()}
          </div>
          <span className="font-medium">{val}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'risk_profile', label: 'Risk Profile',
      render: (val) => <Badge label={val} variant={RISK_MAP[val] || 'default'} />,
    },
    {
      key: 'investor_id', label: 'Actions',
      render: (id) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleDelete(id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Investors</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{(data || []).length} total investors</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Investor
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'low', 'medium', 'high'].map((r) => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === r
                ? 'bg-brand-500 text-white'
                : 'bg-white dark:bg-surface-dark-secondary text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-400'
            }`}>
            {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + ' Risk'}
          </button>
        ))}
      </div>

      <div className="card p-5">
        {loading ? <SkeletonTable /> : filtered.length === 0 ? (
          <EmptyState title="No investors found" description="Add your first investor to get started"
            action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Investor</button>} />
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Investor">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="label">Risk Profile</label>
            <select className="input" value={form.risk_profile} onChange={(e) => setForm({ ...form, risk_profile: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Add Investor'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
