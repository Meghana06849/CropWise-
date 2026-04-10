import { Button } from '../ui/button';

export function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-crop-200 bg-white/80 px-6 py-12 text-center">
      {icon ? <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-crop-50 text-crop-700">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-lg text-sm text-slate-500">{description}</p>
      {actionLabel ? <Button className="mt-5" onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
