import { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/button';
import { formatDateTime } from '../../lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();

  return (
    <div className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-crop-100 bg-white text-crop-700 hover:bg-crop-50"
        onClick={() => {
          setOpen((value) => !value);
          markAllRead();
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-96 rounded-3xl border border-crop-100 bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={clearAll}><Trash2 className="h-4 w-4" />Clear</Button>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {notifications.length ? (
              notifications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-crop-100 bg-crop-50/40 p-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.message}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">{formatDateTime(item.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-crop-100 p-5 text-center text-sm text-slate-500">No notifications yet</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
