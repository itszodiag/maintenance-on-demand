import { http } from './client';

const dashboardApi = {
  getAdminAnalytics: async () => {
    const response = await http.get('/dashboard/admin/analytics');
    return response.data;
  },

  getCompanyAnalytics: async () => {
    const response = await http.get('/dashboard/company/analytics');
    return response.data;
  },

  getVendorAnalytics: async () => {
    const response = await http.get('/dashboard/vendor/analytics');
    return response.data;
  },

  getTechAnalytics: async () => {
    const response = await http.get('/dashboard/technician/analytics');
    return response.data;
  },
};

export default dashboardApi;
