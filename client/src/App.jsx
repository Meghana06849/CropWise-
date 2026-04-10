import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const PredictPage = lazy(() => import('./pages/PredictPage').then((module) => ({ default: module.PredictPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })));
const CropsPage = lazy(() => import('./pages/CropsPage').then((module) => ({ default: module.CropsPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((module) => ({ default: module.CommunityPage })));

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-sm text-slate-500">
      Loading page...
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/crops" element={<CropsPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
