import { Card } from '../ui/card';

export function MetricCard({ label, value, detail, icon, tone = 'default' }) {
  const tones = {
    default: 'from-crop-100 to-white text-crop-800',
    success: 'from-emerald-100 to-white text-emerald-800',
    warning: 'from-amber-100 to-white text-amber-800',
    info: 'from-sky-100 to-white text-sky-800'
  };

  return (
    <Card className={`bg-gradient-to-br ${tones[tone]} border-white` }>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
        </div>
        {icon ? <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 text-crop-700 shadow-sm">{icon}</div> : null}
      </div>
    </Card>
  );
}
