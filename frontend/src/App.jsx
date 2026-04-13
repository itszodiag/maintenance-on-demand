import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { DashboardLayout } from './components/dashboard/DashboardLayout.jsx';
import { useNotificationPolling } from './state/notificationStore.js';
import { useAuthStore } from './state/authStore.js';
import { useFavoritesStore } from './state/favoritesStore.js';
import { AuthPage } from './pages/AuthPage.jsx';
import { AdminCompaniesPage } from './pages/AdminCompaniesPage.jsx';
import { AdminProductsPage } from './pages/AdminProductsPage.jsx';
import { AdminRequestsPage } from './pages/AdminRequestsPage.jsx';
import { AdminOrdersPage } from './pages/AdminOrdersPage.jsx';
import { AdminReviewsPage } from './pages/AdminReviewsPage.jsx';
import { AdminServicesPage } from './pages/AdminServicesPage.jsx';
import { AdminUsersPage } from './pages/AdminUsersPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DashboardServicesPage } from './pages/DashboardServicesPage.jsx';
import { DashboardProductsPage } from './pages/DashboardProductsPage.jsx';
import { CompanyRequestsPage } from './pages/CompanyRequestsPage.jsx';
import { CompanyTechniciansPage } from './pages/CompanyTechniciansPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { MarketplacePage } from './pages/MarketplacePage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { PaymentPage } from './pages/PaymentPage.jsx';
import { ProductDetailsPage } from './pages/ProductDetailsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage.jsx';
import { ServicesPage } from './pages/ServicesPage.jsx';
import { TechnicianReportsPage } from './pages/TechnicianReportsPage.jsx';
import { TechnicianTasksPage } from './pages/TechnicianTasksPage.jsx';
import { TechnicianInvitationsPage } from './pages/TechnicianInvitationsPage.jsx';
import { VendorOrdersPage } from './pages/VendorOrdersPage.jsx';
import { getDashboardPathForRole, isClientRole } from './lib/roleRoutes.js';

function LoadingRoute() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      Loading workspace...
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles = null }) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const location = useLocation();

  if (!initialized) {
    return <LoadingRoute />;
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
}

function DashboardRoleRoute({ allowedRoles, children }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>
  );
}

function AuthEntryRoute() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return <LoadingRoute />;
  }

  if (user) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return <AuthPage />;
}

function ClientEntryRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return <LoadingRoute />;
  }

  if (user && !isClientRole(user.role)) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
}

function LegacyDashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const location = useLocation();

  if (!initialized) {
    return <LoadingRoute />;
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );
  }

  return <Navigate to={getDashboardPathForRole(user.role)} replace />;
}

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const startNotifications = useNotificationPolling((state) => state.start);
  const stopNotifications = useNotificationPolling((state) => state.stop);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate);
  const resetFavorites = useFavoritesStore((state) => state.reset);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!initialized) {
      return undefined;
    }

    if (user) {
      startNotifications();
      return () => stopNotifications();
    }

    stopNotifications();
    return undefined;
  }, [initialized, startNotifications, stopNotifications, user]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (user) {
      hydrateFavorites(user.id);
      return;
    }

    resetFavorites();
  }, [hydrateFavorites, initialized, resetFavorites, user]);

  return (
    <Routes>
      <Route path="/auth" element={<AuthEntryRoute />} />
      <Route
        path="/"
        element={
          <ClientEntryRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ClientEntryRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ClientEntryRoute>
            <AppLayout>
              <ServicesPage />
            </AppLayout>
          </ClientEntryRoute>
        }
      />
      <Route
        path="/services/:serviceId"
        element={
          <ClientEntryRoute>
            <AppLayout>
              <ServiceDetailsPage />
            </AppLayout>
          </ClientEntryRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ClientEntryRoute>
            <AppLayout>
              <MarketplacePage />
            </AppLayout>
          </ClientEntryRoute>
        }
      />
      <Route
        path="/products/:productId"
        element={
          <ClientEntryRoute>
            <AppLayout>
              <ProductDetailsPage />
            </AppLayout>
          </ClientEntryRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CartPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/:paymentType/:paymentId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PaymentPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<LegacyDashboardRedirect />} />
      <Route
        path="/admin/dashboard"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <DashboardPage role="admin" />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <AdminCompaniesPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <AdminServicesPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <AdminProductsPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <AdminRequestsPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <AdminOrdersPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <DashboardRoleRoute allowedRoles={['admin']}>
            <AdminReviewsPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/company/dashboard"
        element={
          <DashboardRoleRoute allowedRoles={['company']}>
            <DashboardPage role="company" />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/company/services"
        element={
          <DashboardRoleRoute allowedRoles={['company']}>
            <DashboardShell
              title="Service Management"
              subtitle="Create, update, and monitor published services."
            >
              <DashboardServicesPage />
            </DashboardShell>
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/company/requests"
        element={
          <DashboardRoleRoute allowedRoles={['company']}>
            <CompanyRequestsPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/company/technicians"
        element={
          <DashboardRoleRoute allowedRoles={['company']}>
            <CompanyTechniciansPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/vendor/dashboard"
        element={
          <DashboardRoleRoute allowedRoles={['vendor']}>
            <DashboardPage role="vendor" />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/vendor/products"
        element={
          <DashboardRoleRoute allowedRoles={['vendor']}>
            <DashboardShell
              title="Product Catalog"
              subtitle="Manage inventory, pricing, and marketplace visibility."
            >
              <DashboardProductsPage />
            </DashboardShell>
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/vendor/orders"
        element={
          <DashboardRoleRoute allowedRoles={['vendor']}>
            <VendorOrdersPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/tech/dashboard"
        element={
          <DashboardRoleRoute allowedRoles={['technician']}>
            <DashboardPage role="technician" />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/tech/services"
        element={
          <DashboardRoleRoute allowedRoles={['technician']}>
            <DashboardShell
              title="Service Management"
              subtitle="Create, update, and monitor your service offerings."
            >
              <DashboardServicesPage />
            </DashboardShell>
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/tech/tasks"
        element={
          <DashboardRoleRoute allowedRoles={['technician']}>
            <TechnicianTasksPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/tech/reports"
        element={
          <DashboardRoleRoute allowedRoles={['technician']}>
            <TechnicianReportsPage />
          </DashboardRoleRoute>
        }
      />
      <Route
        path="/tech/invitations"
        element={
          <DashboardRoleRoute allowedRoles={['technician']}>
            <TechnicianInvitationsPage />
          </DashboardRoleRoute>
        }
      />
    </Routes>
  );
}

function DashboardShell({ title, subtitle, children }) {
  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      {children}
    </DashboardLayout>
  );
}
