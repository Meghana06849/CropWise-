import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatCurrency, formatDateTime, formatNumber } from '../../lib/utils';

const getSoilRecommendation = (prediction) => {
  if (prediction?.soil_tips) return String(prediction.soil_tips);
  if (prediction?.soil_recommendation) return String(prediction.soil_recommendation);
  if (Array.isArray(prediction?.recommendations) && prediction.recommendations.length) {
    return String(prediction.recommendations[0]);
  }
  return 'No soil recommendation available';
};

export function PredictionDetailsDialog({ prediction, open, onOpenChange, onExport }) {
  if (!prediction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div>
          <DialogTitle>{prediction.predicted_crop}</DialogTitle>
          <DialogDescription>
            {prediction.state}, {prediction.district} • {prediction.season}
          </DialogDescription>
        </div>
        <Badge variant="default">{formatNumber(prediction.confidence, 0)}% confidence</Badge>
      </DialogHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Detail label="Created" value={formatDateTime(prediction.createdAt)} />
        <Detail label="Expected Yield" value={`${formatNumber(prediction.expected_yield)} t/ha`} />
        <Detail label="Expected Production" value={`${formatNumber(prediction.expected_production)} tonnes`} />
        <Detail label="Estimated Revenue" value={formatCurrency(prediction.estimated_revenue)} />
        <Detail label="Market Price" value={formatCurrency(prediction.market_price)} />
        <Detail label="Price Trend" value={prediction.price_trend} />
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Recommendations</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">
            {prediction.recommendations?.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Soil Tips</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{getSoilRecommendation(prediction)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        <Button onClick={() => onExport(prediction)}>Export PDF</Button>
      </div>
    </Dialog>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-crop-100 bg-crop-50/60 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-crop-700">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
