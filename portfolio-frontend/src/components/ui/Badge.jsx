const variants = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400',
};

export default function Badge({ label, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {label}
    </span>
  );
}