export const roleDashboardPaths = {
  admin: '/admin/dashboard',
  company: '/company/dashboard',
  vendor: '/vendor/dashboard',
  technician: '/tech/dashboard',
  client: '/',
};

export function getDashboardPathForRole(role) {
  return roleDashboardPaths[role] ?? '/';
}

export function getPostLoginPath(role, fallback = null) {
  if (isDashboardRole(role)) {
    return getDashboardPathForRole(role);
  }

  return fallback || getDashboardPathForRole(role);
}

export function isClientRole(role) {
  return role === 'client';
}

export function isDashboardRole(role) {
  return ['admin', 'company', 'vendor', 'technician'].includes(role);
}

export function getRoleLabel(role) {
  return (
    {
      admin: 'Administrator',
      company: 'Company',
      vendor: 'Vendor',
      technician: 'Technician',
      client: 'Client',
    }[role] ?? 'User'
  );
}
