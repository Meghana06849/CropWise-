import { Link, useLocation } from 'react-router-dom';
import { MobileMenuButton } from './Sidebar';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../realtime/NotificationBell';

const titles = {
  '/dashboard': 'Dashboard',
  '/predict': 'Predict Crop',
  '/history': 'Prediction History',
  '/crops': 'Crop Intelligence',
  '/community': 'Community Feed'
};

export function Topbar({ onMenuClick }) {
  const location = useLocation();
  const title = titles[location.pathname] || 'CropWise';
  const { user, logout } = useAuth();
  const name = user?.name?.trim() || 'Account';
  const role = user?.role ? String(user.role).toUpperCase() : '';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-center gap-3">
        <MobileMenuButton onClick={onMenuClick} />
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-crop-700">CropWise</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-crop-100 text-sm font-bold text-crop-800 sm:flex" aria-label="Profile avatar">
          {initials}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</p>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          {role ? <p className="text-[10px] uppercase tracking-[0.18em] text-crop-700">{role}</p> : null}
        </div>
        <Button variant="outline" onClick={logout} type="button">Logout</Button>
        <Button asChild variant="ghost">
          <Link to="/predict">New Prediction</Link>
        </Button>
      </div>
    </header>
  );
}
