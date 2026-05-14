import { Navigate } from 'react-router-dom';
import { AdminDashboard } from '../components/dashboard/AdminDashboard.jsx';
import { CompanyDashboard } from '../components/dashboard/CompanyDashboard.jsx';
import { TechnicianDashboard } from '../components/dashboard/TechnicianDashboard.jsx';
import { VendorDashboard } from '../components/dashboard/VendorDashboard.jsx';
import { getDashboardPathForRole } from '../lib/roleRoutes.js';

const dashboardConfig = {
  admin: {
    component: AdminDashboard,
  },
  company: {
    component: CompanyDashboard,
  },
  vendor: {
    component: VendorDashboard,
  },
  technician: {
    component: TechnicianDashboard,
  },
};

export function DashboardPage({ role }) {
  const config = dashboardConfig[role];

  if (!config) {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  const DashboardView = config.component;

  return <DashboardView />;
}
