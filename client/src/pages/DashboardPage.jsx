import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Binary, Sprout } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { MetricCard } from '../components/common/MetricCard';
import { Card, CardContent } from '../components/ui/card';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PredictionCharts } from '../components/charts/PredictionCharts';
import { usePredictions } from '../hooks/useCropwiseQueries';
import { formatNumber } from '../lib/utils';
import { getApiErrorMessage } from '../lib/api';

export function DashboardPage() {
  const predictionsQuery = usePredictions();
  const predictions = predictionsQuery.data?.data || [];

  const stats = useMemo(() => {
    if (!predictions.length) {
      return { total: 0, avgYield: 0, avgConfidence: 0 };
    }

    const totalYield = predictions.reduce((sum, item) => sum + Number(item.expected_yield || 0), 0);
    const totalConfidence = predictions.reduce((sum, item) => sum + Number(item.confidence || 0), 0);

    return {
      total: predictions.length,
      avgYield: totalYield / predictions.length,
      avgConfidence: totalConfidence / predictions.length
    };
  }, [predictions]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Overview"
        title="Production dashboard"
        description="Monitor prediction activity, yield quality, and confidence trends from live backend records."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total predictions" value={stats.total} detail="Stored in MongoDB" icon={<Binary className="h-5 w-5" />} />
        <MetricCard label="Average yield" value={`${formatNumber(stats.avgYield)} t/ha`} detail="Across all predictions" icon={<Sprout className="h-5 w-5" />} tone="success" />
        <MetricCard label="Average confidence" value={`${formatNumber(stats.avgConfidence, 0)}%`} detail="Gemini-backed score" icon={<ShieldCheck className="h-5 w-5" />} tone="info" />
        <MetricCard label="Prediction health" value={stats.avgConfidence > 70 ? 'Strong' : 'Needs review'} detail="Based on confidence average" icon={<TrendingUp className="h-5 w-5" />} tone="warning" />
      </div>

      {predictionsQuery.isLoading ? (
        <Card>
          <CardContent>Loading dashboard data...</CardContent>
        </Card>
      ) : predictionsQuery.isError ? (
        <ErrorState
          title="Dashboard failed to load"
          description={getApiErrorMessage(predictionsQuery.error)}
          onRetry={() => predictionsQuery.refetch()}
        />
      ) : predictions.length ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <PredictionCharts predictions={predictions} />
        </motion.div>
      ) : (
        <EmptyState
          icon={<Sprout className="h-6 w-6" />}
          title="No predictions yet"
          description="Generate your first prediction from the Predict page to populate dashboard metrics and charts."
        />
      )}
    </div>
  );
}
