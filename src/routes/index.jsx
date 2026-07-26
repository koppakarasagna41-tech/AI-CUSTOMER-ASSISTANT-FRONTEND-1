/**
 * routes/index.jsx — Centralised route configuration
 *
 * Route tree:
 *
 *  /                      → PublicRoute (redirect if authed)
 *    login                → LoginPage   (inside AuthLayout)
 *    register             → RegisterPage
 *
 *  /                      → ProtectedRoute (redirect if not authed)
 *    /                    → MainLayout
 *      /                  → HomePage
 *      /chat              → ChatPage
 *      /history           → HistoryPage
 *      /analytics         → AnalyticsPage
 *      /settings          → SettingsPage
 *
 *  *                      → NotFoundPage  (no layout wrapper)
 */

import { Routes, Route, Navigate } from 'react-router-dom';

// ── Layouts ──────────────────────────────────────────────────
import MainLayout  from '@/layouts/MainLayout';
import AuthLayout  from '@/layouts/AuthLayout';

// ── Route guards ─────────────────────────────────────────────
import ProtectedRoute from './ProtectedRoute';
import PublicRoute    from './PublicRoute';

// ── Pages ─────────────────────────────────────────────────────
import HomePage      from '@/pages/HomePage';
import LoginPage     from '@/pages/LoginPage';
import RegisterPage  from '@/pages/RegisterPage';
import ChatPage      from '@/pages/ChatPage';
import HistoryPage   from '@/pages/HistoryPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage  from '@/pages/SettingsPage';
import NotFoundPage  from '@/pages/NotFoundPage';

// ── Constants ─────────────────────────────────────────────────
import { ROUTES } from '@/utils/constants';

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public (auth) routes ──────────────────────────── */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>
      </Route>

      {/* ── Protected (app) routes ───────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index                      element={<HomePage />} />
          <Route path={ROUTES.CHAT}         element={<ChatPage />} />
          <Route path={ROUTES.HISTORY}      element={<HistoryPage />} />
          <Route path={ROUTES.ANALYTICS}    element={<AnalyticsPage />} />
          <Route path={ROUTES.SETTINGS}     element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ── 404 ─────────────────────────────────────────── */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />

    </Routes>
  );
}
