import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { AdminDashboard } from '../components/dashboard/AdminDashboard.jsx';
import { CompanyDashboard } from '../components/dashboard/CompanyDashboard.jsx';
import { TechnicianDashboard } from '../components/dashboard/TechnicianDashboard.jsx';
import { VendorDashboard } from '../components/dashboard/VendorDashboard.jsx';
import { getDashboardPathForRole } from '../lib/roleRoutes.js';

const dashboardConfig = {
  admin: {
    title: 'Admin Control Center',
    subtitle: 'Monitor platform activity, moderation queues, and system health.',
    component: AdminDashboard,
  },
  company: {
    title: 'Company Operations',
    subtitle: 'Track service demand, manage teams, and keep delivery moving.',
    component: CompanyDashboard,
  },
  vendor: {
    title: 'Vendor Commerce Hub',
    subtitle: 'Watch inventory, sales flow, and recent order activity in one place.',
    component: VendorDashboard,
  },
  technician: {
    title: 'Technician Workspace',
    subtitle: 'Stay on top of assigned tasks, availability, and delivery progress.',
    component: TechnicianDashboard,
  },
};

export function DashboardPage({ role }) {
  const config = dashboardConfig[role];

  if (!config) {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  const DashboardView = config.component;

  return (
    <DashboardLayout title={config.title} subtitle={config.subtitle}>
      <DashboardView />
    </DashboardLayout>
  );
}
