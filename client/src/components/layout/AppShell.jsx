import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { RealtimeBridge } from '../realtime/RealtimeBridge';

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(63,156,83,0.14),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(111,188,121,0.16),_transparent_30%),linear-gradient(180deg,_#f7fcf7_0%,_#eef7f0_100%)] text-slate-900">
      <RealtimeBridge />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 md:p-6">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
