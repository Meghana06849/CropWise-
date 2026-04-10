import { cn } from '../../lib/utils';

export function Card({ className = '', ...props }) {
  return <div className={cn('rounded-3xl border border-crop-100 bg-white/95 p-6 shadow-sm backdrop-blur', className)} {...props} />;
}

export function CardHeader({ className = '', ...props }) {
  return <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props} />;
}

export function CardTitle({ className = '', ...props }) {
  return <h3 className={cn('text-lg font-semibold text-slate-900', className)} {...props} />;
}

export function CardDescription({ className = '', ...props }) {
  return <p className={cn('text-sm text-slate-500', className)} {...props} />;
}

export function CardContent({ className = '', ...props }) {
  return <div className={cn('space-y-4', className)} {...props} />;
}
