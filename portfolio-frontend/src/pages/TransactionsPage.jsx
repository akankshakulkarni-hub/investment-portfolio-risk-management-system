import { useState } from 'react';
import { Plus, Download, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getTransactions, createTransaction } from '../services/transactionService';
import { getPortfolios } from '../services/portfolioService';
import { getAssets } from '../services/assetService';
import { exportTransactionsCSV } from '../services/reportService';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export default function TransactionsPage() {
  const { data: transactions, loading, execute: refetch } = useApi(getTransactions);
  const { data: portfolios } = useApi(getPortfolios);
  const { data: assets } = useApi(getAssets);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ portfolio_id: '', asset_id: '', type: 'buy', amount: '', quantity: '' });
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const { success, error: toastError, info } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTransaction({ ...form, transaction_date: new Date().toISOString() });
      success('Transaction recorded!');
      setShowModal(false);
      refetch();
    } catch (err) { toastError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    try { info('Preparing CSV...'); await exportTransactionsCSV(); success('CSV downloaded!'); }
    catch { toastError('Export failed'); }
  };

  const filtered = (transactions || []).filter((t) => {
    if (!typeFilter) return true;
    const tType = String(t.type || t.transaction_type || '').toLowerCase();
    return tType === typeFilter.toLowerCase();
  });

  const columns = [
    {
      key: 'type', label: 'Type',
      render: (val, row) => {
        const typeStr = String(val || row?.transaction_type || '').toLowerCase();
        const isBuy = typeStr === 'buy';
        return (
          <div className="flex items-center gap-2">
            {isBuy ? <ArrowUpCircle size={15} className="text-emerald-500" /> : <ArrowDownCircle size={15} className="text-red-500" />}
            <Badge label={typeStr.toUpperCase() || 'TXN'} variant={isBuy ? 'success' : 'danger'} />
          </div>
        );
      },
    },
    { key: 'portfolio_name', label: 'Portfolio' },
    { key: 'asset_name', label: 'Asset' },
    { key: 'quantity', label: 'Qty', render: (val) => <span className="font-mono">{val}</span> },
    { key: 'amount', label: 'Amount', render: (val) => <span className="font-mono font-semibold">${Number(val).toLocaleString()}</span> },
    { key: 'transaction_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{(transactions || []).length} total records</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={handleExport}><Download size={15} /> Export CSV</button>
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Transaction</button>
        </div>
      </div>

      <div className="flex gap-2">
        {['', 'buy', 'sell'].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? 'bg-brand-500 text-white' : 'bg-white dark:bg-surface-dark-secondary text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card p-5">
        {loading ? <SkeletonTable /> : filtered.length === 0 ? (
          <EmptyState title="No transactions found" />
        ) : <DataTable columns={columns} data={filtered} />}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Transaction">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
                {(assets || []).map((a) => <option key={a.asset_id} value={a.asset_id}>{a.name || a.asset_name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Transaction Type</label>
            <div className="flex gap-3">
              {['buy', 'sell'].map((t) => (
                <label key={t} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${form.type === t ? (t === 'buy' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400') : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={(e) => setForm({ ...form, type: e.target.value })} className="sr-only" />
                  {t === 'buy' ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Quantity</label><input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" min="1" required /></div>
            <div><label className="label">Amount ($)</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" min="0" step="0.01" required /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Record'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}