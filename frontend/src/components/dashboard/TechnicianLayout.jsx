import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore.js';
import { useLayoutStore } from '../../state/layoutStore.js';
import { DashboardSidebar } from './DashboardSidebar.jsx';
import { DashboardTopbar } from './DashboardTopbar.jsx';

export function TechnicianLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { title, subtitle } = useLayoutStore();

  // DEBUG LOGGING
  useEffect(() => {
    console.log('[DEBUG] TechnicianLayout MOUNTED');
    return () => console.log('[DEBUG] TechnicianLayout UNMOUNTED');
  }, []);

  if (!user || user.role !== 'technician') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef2ff_0%,#f7f8fd_45%,#eef3ff_100%)]">
      {/* 
        Standardized Z-Index Architecture for Dashboard:
        Sidebar: z-50
        Topbar: z-40
        DropdownLayer: z-[100]
        ModalLayer: z-[200]
        ToastLayer: z-[300]
      */}
      <DashboardSidebar />

      <div className="min-h-screen lg:pl-[290px]">
        <DashboardTopbar
          title={title}
          subtitle={subtitle}
          searchPlaceholder="Search technician tasks, services..."
          user={user}
          onLogout={logout}
        />

        <main className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1480px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
