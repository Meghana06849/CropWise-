import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/predict', label: 'Predict' },
  { to: '/history', label: 'History' },
  { to: '/crops', label: 'Crops' },
  { to: '/community', label: 'Community' }
];

export function MobileNav({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 p-4 backdrop-blur-sm sm:hidden" onClick={onClose}>
      <div className="mx-auto mt-16 max-w-sm rounded-[2rem] border border-white/10 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">CropWise</div>
            <div className="text-xs text-slate-500">AI agricultural advisory</div>
          </div>
          <Button variant="ghost" onClick={onClose} type="button"><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-crop-600 text-white' : 'bg-crop-50 text-slate-800'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
