import { useMemo } from 'react';
import { Leaf, TrendingUp } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { usePredictions } from '../hooks/useCropwiseQueries';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { formatNumber, formatCurrency } from '../lib/utils';
import { getApiErrorMessage } from '../lib/api';

export function CropsPage() {
  const predictionsQuery = usePredictions();
  const predictions = predictionsQuery.data?.data || [];

  const cropInsights = useMemo(() => {
    const grouped = predictions.reduce((acc, item) => {
      const key = item.predicted_crop;
      if (!acc[key]) {
        acc[key] = { count: 0, yield: 0, revenue: 0, confidence: 0, tips: new Set() };
      }
      acc[key].count += 1;
      acc[key].yield += Number(item.expected_yield || 0);
      acc[key].revenue += Number(item.estimated_revenue || 0);
      acc[key].confidence += Number(item.confidence || 0);
      if (item.soil_tips) acc[key].tips.add(item.soil_tips);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([crop, stats]) => ({
        crop,
        count: stats.count,
        avgYield: stats.yield / stats.count,
        avgRevenue: stats.revenue / stats.count,
        avgConfidence: stats.confidence / stats.count,
        tips: Array.from(stats.tips)
      }))
      .sort((a, b) => b.count - a.count);
  }, [predictions]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Crop intelligence"
        title="Crop performance insights"
        description="Use the stored predictions to understand which crops are surfacing most often and which ones deliver stronger output."
      />

      {predictionsQuery.isLoading ? (
        <Card><CardContent>Loading crop insights...</CardContent></Card>
      ) : predictionsQuery.isError ? (
        <ErrorState
          title="Crop insights failed to load"
          description={getApiErrorMessage(predictionsQuery.error)}
          onRetry={() => predictionsQuery.refetch()}
        />
      ) : cropInsights.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {cropInsights.map((item) => (
            <Card key={item.crop}>
              <CardContent>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-crop-700">{item.crop}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">{item.count} predictions</h3>
                  </div>
                  <Badge variant={item.avgConfidence >= 70 ? 'success' : 'warning'}>
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {formatNumber(item.avgConfidence, 0)}% confidence
                  </Badge>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <Metric label="Avg yield" value={`${formatNumber(item.avgYield)} t/ha`} />
                  <Metric label="Avg revenue" value={formatCurrency(item.avgRevenue)} />
                  <Metric label="Mentions" value={item.count} />
                </div>
                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-900">Soil tips captured from reports</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tips.slice(0, 4).map((tip, index) => <Badge key={index} variant="default">{tip}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Leaf className="h-6 w-6" />}
          title="No crop intelligence yet"
          description="This page becomes useful once at least one prediction exists. Generate predictions to see crop-level performance, confidence, and soil notes."
        />
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-crop-100 bg-crop-50/60 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-crop-700">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
