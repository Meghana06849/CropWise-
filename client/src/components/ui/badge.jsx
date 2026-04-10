import { cn } from '../../lib/utils';

export function Badge({ className = '', variant = 'default', ...props }) {
  const variants = {
    default: 'bg-crop-100 text-crop-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-slate-100 text-slate-700'
  };

  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variants[variant], className)} {...props} />;
}
