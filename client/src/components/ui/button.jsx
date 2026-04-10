import { cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils';

export function Button({ className = '', variant = 'default', size = 'md', asChild = false, children, ...props }) {
  const Comp = asChild ? 'span' : 'button';
  const variants = {
    default: 'bg-crop-600 text-white hover:bg-crop-700 shadow-glow',
    secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
    outline: 'border border-crop-200 bg-white text-crop-900 hover:bg-crop-50',
    ghost: 'bg-transparent text-crop-700 hover:bg-crop-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const element = asChild && isValidElement(children)
    ? cloneElement(children, {
        className: cn('inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], sizes[size], className, children.props.className),
        ...props
      })
    : <Comp className={cn('inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], sizes[size], className)} {...props}>{children}</Comp>;

  return element;
}
