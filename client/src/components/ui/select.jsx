import { cn } from '../../lib/utils';

export function Select({ className = '', children, ...props }) {
  return (
    <select className={cn('h-11 w-full rounded-2xl border border-crop-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-crop-500 focus:ring-4 focus:ring-crop-100', className)} {...props}>
      {children}
    </select>
  );
}
