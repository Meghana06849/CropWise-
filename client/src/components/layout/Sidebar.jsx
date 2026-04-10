import { NavLink } from 'react-router-dom';
import { BarChart3, Sprout, History, Users, Leaf, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from '../ui/button';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/predict', label: 'Predict', icon: Sprout },
  { to: '/history', label: 'History', icon: History },
  { to: '/crops', label: 'Crops', icon: Leaf },
  { to: '/community', label: 'Community', icon: Users }
];

export function Sidebar() {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-crop-gradient text-white shadow-glow">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight text-slate-900">CropWise</div>
          <div className="text-xs text-slate-500">AI for Indian farms</div>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-crop-600 text-white shadow-glow' : 'text-slate-700 hover:bg-crop-50'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-crop-gradient p-5 text-white shadow-glow">
        <p className="text-sm font-semibold">Weather-aware predictions</p>
        <p className="mt-2 text-xs leading-5 text-white/80">
          CropWise fetches real-time weather, calls Gemini through the backend, and stores each prediction for analysis.
        </p>
      </div>
    </aside>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <Button className="sm:hidden" variant="outline" onClick={onClick} type="button">
      <Menu className="h-4 w-4" />
      Menu
    </Button>
  );
}
