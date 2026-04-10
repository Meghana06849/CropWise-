import { cn } from '../../lib/utils';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = '', ...props }) {
  return <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props} />;
}

export function DialogTitle({ className = '', ...props }) {
  return <h3 className={cn('text-xl font-semibold text-slate-900', className)} {...props} />;
}

export function DialogDescription({ className = '', ...props }) {
  return <p className={cn('text-sm text-slate-500', className)} {...props} />;
}
