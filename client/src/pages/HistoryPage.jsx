import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Search, Trash2, Eye } from 'lucide-react';
import { useDeletePrediction, usePredictions } from '../hooks/useCropwiseQueries';
import { SectionHeading } from '../components/common/SectionHeading';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PredictionDetailsDialog } from '../components/predictions/PredictionDetailsDialog';
import { downloadPredictionPdf } from '../lib/pdf';
import { getApiErrorMessage } from '../lib/api';
import { formatCurrency, formatDateTime, formatNumber } from '../lib/utils';

const getSoilRecommendation = (prediction) => {
  if (prediction?.soil_tips) return String(prediction.soil_tips);
  if (prediction?.soil_recommendation) return String(prediction.soil_recommendation);
  if (Array.isArray(prediction?.recommendations) && prediction.recommendations.length) {
    return String(prediction.recommendations[0]);
  }
  return 'No soil recommendation available';
};

const HISTORY_SEARCH_KEY = 'cropwise_history_search';
const HISTORY_PAGE_SIZE_KEY = 'cropwise_history_page_size';

const getInitialSearch = () => {
  try {
    return localStorage.getItem(HISTORY_SEARCH_KEY) || '';
  } catch (_error) {
    return '';
  }
};

const getInitialPageSize = () => {
  try {
    const value = Number(localStorage.getItem(HISTORY_PAGE_SIZE_KEY));
    return [10, 25, 50].includes(value) ? value : 10;
  } catch (_error) {
    return 10;
  }
};

export function HistoryPage() {
  const [search, setSearch] = useState(getInitialSearch);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(getInitialPageSize);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const predictionsQuery = usePredictions();
  const deleteMutation = useDeletePrediction();
  const deferredSearch = useDeferredValue(search);

  const predictions = predictionsQuery.data?.data || [];

  const filtered = useMemo(() => {
    const term = deferredSearch.toLowerCase().trim();
    if (!term) return predictions;
    return predictions.filter((item) =>
      [item.state, item.district, item.season, item.predicted_crop]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [predictions, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedPredictions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prediction?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setPageSize(10);
    setPage(1);

    try {
      localStorage.removeItem(HISTORY_SEARCH_KEY);
      localStorage.removeItem(HISTORY_PAGE_SIZE_KEY);
    } catch (_error) {
      // Ignore storage write failures.
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_SEARCH_KEY, search);
    } catch (_error) {
      // Ignore storage write failures.
    }
    setPage(1);
  }, [search]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_PAGE_SIZE_KEY, String(pageSize));
    } catch (_error) {
      // Ignore storage write failures.
    }
    setPage(1);
  }, [pageSize]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Audit trail"
        title="Prediction history"
        description="Search saved predictions, inspect full details, or remove stale entries."
        action={<div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10 md:w-80" placeholder="Search state, district, crop, season" value={search} onChange={(event) => setSearch(event.target.value)} /></div>}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-crop-100 bg-white/70 px-4 py-3">
        <p className="text-sm text-slate-600">Showing {pagedPredictions.length} of {filtered.length} predictions</p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>Rows per page</span>
          <select
            className="h-9 rounded-xl border border-crop-200 bg-white px-3"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>Reset filters</Button>
        </div>
      </div>

      {predictionsQuery.isLoading ? (
        <Card><CardContent>Loading history...</CardContent></Card>
      ) : predictionsQuery.isError ? (
        <ErrorState
          title="History failed to load"
          description={getApiErrorMessage(predictionsQuery.error)}
          onRetry={() => predictionsQuery.refetch()}
        />
      ) : filtered.length ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-crop-100 text-left text-sm">
              <thead className="bg-crop-50 text-xs uppercase tracking-[0.18em] text-crop-700">
                <tr>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Crop</th>
                  <th className="px-5 py-4">Soil recommendation</th>
                  <th className="px-5 py-4">Yield</th>
                  <th className="px-5 py-4">Confidence</th>
                  <th className="px-5 py-4">Revenue</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crop-50 bg-white">
                {pagedPredictions.map((prediction) => (
                  <tr key={prediction._id} className="hover:bg-crop-50/50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{prediction.state}</div>
                      <div className="text-xs text-slate-500">{prediction.district} • {prediction.season}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{prediction.predicted_crop}</td>
                    <td className="max-w-[280px] px-5 py-4 text-slate-700">
                      <p className="line-clamp-2">{getSoilRecommendation(prediction)}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{formatNumber(prediction.expected_yield)} t/ha</td>
                    <td className="px-5 py-4"><Badge variant="default">{formatNumber(prediction.confidence, 0)}%</Badge></td>
                    <td className="px-5 py-4 text-slate-700">{formatCurrency(prediction.estimated_revenue)}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDateTime(prediction.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedPrediction(prediction); setDetailsOpen(true); }}><Eye className="h-4 w-4" />View</Button>
                        <Button variant="outline" size="sm" onClick={() => downloadPredictionPdf(prediction)}><Eye className="h-4 w-4" />PDF</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(prediction._id)} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" />Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-crop-100 bg-crop-50/40 px-4 py-3">
            <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1}>Previous</Button>
            <span className="px-2 text-sm text-slate-600">Page {safePage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage >= totalPages}>Next</Button>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No matching predictions"
          description="Try a different filter or create a new prediction to add data to the history table."
        />
      )}

      <PredictionDetailsDialog
        prediction={selectedPrediction}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onExport={downloadPredictionPdf}
      />
    </div>
  );
}
