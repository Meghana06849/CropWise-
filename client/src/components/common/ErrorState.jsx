import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50/80 p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-100 text-red-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">{title}</h3>
          {description ? <p className="mt-2 text-sm text-red-700">{description}</p> : null}
          {onRetry ? (
            <Button className="mt-4" variant="destructive" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
