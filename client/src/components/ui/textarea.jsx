import { cn } from '../../lib/utils';

export function Textarea({ className = '', ...props }) {
  return <textarea className={cn('min-h-28 w-full rounded-2xl border border-crop-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-crop-500 focus:ring-4 focus:ring-crop-100', className)} {...props} />;
}
