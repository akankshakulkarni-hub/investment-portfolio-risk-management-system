import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Download } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getPortfolios, createPortfolio, deletePortfolio } from '../services/portfolioService';
import { getInvestors } from '../services/investorService';
import { exportPortfolioPDF } from '../services/reportService';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export default function PortfoliosPage() {
  const { data: portfolios, loading, execute: refetch } = useApi(getPortfolios);
  const { data: investors } = useApi(getInvestors);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', investor_id: '', total_value: '' });
  const [saving, setSaving] = useState(false);
  const { success, error: toastError, info } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPortfolio(form);
      success('Portfolio created!');
      setShowModal(false);
      setForm({ name: '', investor_id: '', total_value: '' });
      refetch();
    } catch (err) { toastError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this portfolio?')) return;
    try { await deletePortfolio(id); success('Deleted'); refetch(); }
    catch { toastError('Delete failed'); }
  };

  const handleExportPDF = async (id) => {
    try { info('Generating PDF...'); await exportPortfolioPDF(id); success('PDF downloaded!'); }
    catch { toastError('Export failed'); }
  };

  const columns = [
    { key: 'name', label: 'Portfolio', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'investor_name', label: 'Investor' },
    {
      key: 'total_value', label: 'Total Value',
      render: (val) => <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">${Number(val || 0).toLocaleString()}</span>,
    },
    { key: 'created_at', label: 'Created', render: (val) => new Date(val).toLocaleDateString() },
    {
      key: 'portfolio_id', label: 'Actions',
      render: (id) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleExportPDF(id)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all" title="Export PDF">
            <Download size={14} />
          </button>
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
          <h1 className="page-title">Portfolios</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{(portfolios || []).length} portfolios managed</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Portfolio</button>
      </div>

      <div className="card p-5">
        {loading ? <SkeletonTable /> : (portfolios || []).length === 0 ? (
          <EmptyState title="No portfolios yet" action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create</button>} />
        ) : (
          <DataTable columns={columns} data={portfolios || []} />
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Portfolio">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Portfolio Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Growth Portfolio" required />
          </div>
          <div>
            <label className="label">Investor</label>
            <select className="input" value={form.investor_id} onChange={(e) => setForm({ ...form, investor_id: e.target.value })} required>
              <option value="">Select investor</option>
              {(investors || []).map((inv) => <option key={inv.investor_id} value={inv.investor_id}>{inv.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Initial Value ($)</label>
            <input type="number" className="input" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: e.target.value })} placeholder="0.00" min="0" step="0.01" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}