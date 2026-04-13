import { http } from './client.js';

export const authApi = {
  register: (payload) =>
    http.post('/auth/register', payload).then((response) => response.data),
  login: (payload) =>
    http.post('/auth/login', payload).then((response) => response.data),
  me: () => http.get('/auth/me').then((response) => response.data),
  logout: () => http.post('/logout').then((response) => response.data),
};

export const homeApi = {
  featuredServices: () =>
    http.get('/services/featured').then((response) => response.data),
  featuredProducts: () =>
    http.get('/products/featured').then((response) => response.data),
};

export const servicesApi = {
  list: (params) =>
    http.get('/services', { params }).then((response) => response.data),
  mine: () => http.get('/services/mine').then((response) => response.data),
  details: (id) =>
    http.get(`/services/${id}`).then((response) => response.data),
  create: (payload) =>
    http
      .post('/services', payload, multipart())
      .then((response) => response.data),
  update: (id, payload) =>
    http
      .post(`/services/${id}`, payload, multipart())
      .then((response) => response.data),
  remove: (id) =>
    http.delete(`/services/${id}`).then((response) => response.data),
};

export const productsApi = {
  list: (params) =>
    http.get('/products', { params }).then((response) => response.data),
  mine: () => http.get('/products/mine').then((response) => response.data),
  details: (id) =>
    http.get(`/products/${id}`).then((response) => response.data),
  create: (payload) =>
    http
      .post('/products', payload, multipart())
      .then((response) => response.data),
  update: (id, payload) =>
    http
      .post(`/products/${id}`, payload, multipart())
      .then((response) => response.data),
  remove: (id) =>
    http.delete(`/products/${id}`).then((response) => response.data),
};

export const serviceRequestsApi = {
  list: () => http.get('/service-requests').then((response) => response.data),
  create: (payload) =>
    http
      .post('/service-requests', payload, multipart())
      .then((response) => response.data),
  updateStatus: (id, status) =>
    http
      .patch(`/service-requests/${id}/status`, { status })
      .then((response) => response.data),
  sendPaymentRequest: (id) =>
    http
      .post(`/service-requests/${id}/payment-request`)
      .then((response) => response.data),
};

export const favoritesApi = {
  list: () => http.get('/favorites').then((response) => response.data),
  toggle: (payload) =>
    http.post('/favorites/toggle', payload).then((response) => response.data),
};

export const reviewsApi = {
  create: (payload) =>
    http.post('/reviews', payload).then((response) => response.data),
};

export const cartApi = {
  list: () => http.get('/cart').then((response) => response.data),
  add: (payload) =>
    http.post('/cart', payload).then((response) => response.data),
  update: (id, quantity) =>
    http.patch(`/cart/${id}`, { quantity }).then((response) => response.data),
  remove: (id) => http.delete(`/cart/${id}`).then((response) => response.data),
  checkout: (payload) =>
    http.post('/checkout', payload).then((response) => response.data),
};

export const ordersApi = {
  list: () => http.get('/orders').then((response) => response.data),
  updateStatus: (id, status) =>
    http
      .patch(`/orders/${id}/status`, { status })
      .then((response) => response.data),
};

export const paymentsApi = {
  details: (type, id) =>
    http.get(`/payments/${type}/${id}`).then((response) => response.data),
  cash: (type, id) =>
    http.post(`/payments/${type}/${id}/cash`).then((response) => response.data),
  stripeSession: (type, id, payload) =>
    http
      .post(`/payments/${type}/${id}/stripe-session`, payload)
      .then((response) => response.data),
  stripeConfirm: (type, id, payload) =>
    http
      .post(`/payments/${type}/${id}/stripe-confirm`, payload)
      .then((response) => response.data),
};

export const profileApi = {
  get: () => http.get('/profile').then((response) => response.data),
  update: (payload) =>
    http
      .post('/profile', payload, multipart())
      .then((response) => response.data),
  presence: (isOnline = true) =>
    http
      .post('/profile/presence', { is_online: isOnline })
      .then((response) => response.data),
};

export const conversationsApi = {
  list: () => http.get('/conversations').then((response) => response.data),
  open: (payload) =>
    http.post('/conversations', payload).then((response) => response.data),
  details: (id) =>
    http.get(`/conversations/${id}`).then((response) => response.data),
  send: (id, payload) =>
    http
      .post(`/conversations/${id}/messages`, payload, multipart())
      .then((response) => response.data),
  seen: (id) =>
    http.post(`/conversations/${id}/seen`).then((response) => response.data),
};

export const aiApi = {
  chat: (message) =>
    http.post('/ai/chat', { message }).then((response) => response.data),
};

export const notificationsApi = {
  list: () => http.get('/notifications').then((response) => response.data),
  markAllRead: () =>
    http.post('/notifications/read-all').then((response) => response.data),
};

export const dashboardApi = {
  overview: () => http.get('/dashboard').then((response) => response.data),
};

export const technicianApi = {
  availability: () =>
    http.get('/technician/availability').then((response) => response.data),
  createAvailability: (payload) =>
    http
      .post('/technician/availability', payload)
      .then((response) => response.data),
  removeAvailability: (id) =>
    http
      .delete(`/technician/availability/${id}`)
      .then((response) => response.data),
  certifications: () =>
    http.get('/technician/certifications').then((response) => response.data),
  uploadCertification: (payload) =>
    http
      .post('/technician/certifications', payload, multipart())
      .then((response) => response.data),
  invitations: () =>
    http.get('/technician/invitations').then((response) => response.data),
  acceptInvitation: (companyId) =>
    http
      .post(`/technician/invitations/${companyId}/accept`)
      .then((response) => response.data),
  rejectInvitation: (companyId) =>
    http
      .post(`/technician/invitations/${companyId}/reject`)
      .then((response) => response.data),
  leaveTeam: (companyId) =>
    http
      .post(`/technician/teams/${companyId}/leave`)
      .then((response) => response.data),
};

export const companyApi = {
  technicians: () =>
    http.get('/company/technicians').then((response) => response.data),
  discoverTechnicians: () =>
    http.get('/company/technicians/discover').then((response) => response.data),
  attachTechnician: (technicianId) =>
    http
      .post('/company/technicians', { technician_id: technicianId })
      .then((response) => response.data),
  sendInvitation: (technicianId, message, file) =>
    (() => {
      const payload = new FormData();
      payload.append('technician_id', technicianId);
      if (message?.trim()) {
        payload.append('message', message.trim());
      }
      if (file) {
        payload.append('file', file);
      }

      return http
        .post(`/company/technicians/${technicianId}/invite`, payload, multipart())
        .then((response) => response.data);
    })(),
  removeTechnician: (technicianId) =>
    http
      .delete(`/company/technicians/${technicianId}`)
      .then((response) => response.data),
  assignments: () =>
    http.get('/company/assignments').then((response) => response.data),
  assign: (payload) =>
    http
      .post('/company/assignments', payload)
      .then((response) => response.data),
};

export const adminApi = {
  users: (role) =>
    http
      .get('/admin/users', { params: { role } })
      .then((response) => response.data),
  createUser: (userData) =>
    http.post('/admin/users', userData).then((response) => response.data),
  updateUser: (id, payload) =>
    http.patch(`/admin/users/${id}`, payload).then((response) => response.data),
  deleteUser: (id) =>
    http.delete(`/admin/users/${id}`).then((response) => response.data),
  companies: () =>
    http.get('/admin/companies').then((response) => response.data),
  services: () => http.get('/admin/services').then((response) => response.data),
  createService: (payload) =>
    http.post('/admin/services', payload).then((response) => response.data),
  updateService: (id, payload) =>
    http
      .patch(`/admin/services/${id}`, payload)
      .then((response) => response.data),
  deleteService: (id) =>
    http.delete(`/admin/services/${id}`).then((response) => response.data),
  products: () => http.get('/admin/products').then((response) => response.data),
  createProduct: (payload) =>
    http.post('/admin/products', payload).then((response) => response.data),
  updateProduct: (id, payload) =>
    http
      .patch(`/admin/products/${id}`, payload)
      .then((response) => response.data),
  deleteProduct: (id) =>
    http.delete(`/admin/products/${id}`).then((response) => response.data),
  requests: () => http.get('/admin/requests').then((response) => response.data),
  orders: () => http.get('/admin/orders').then((response) => response.data),
  reviews: () => http.get('/admin/reviews').then((response) => response.data),
  verify: (id, isVerified) =>
    http
      .patch(`/admin/users/${id}/verify`, { is_verified: isVerified })
      .then((response) => response.data),
  moderateService: (id, status) =>
    http
      .patch(`/admin/services/${id}/moderate`, { status })
      .then((response) => response.data),
  moderateProduct: (id, status) =>
    http
      .patch(`/admin/products/${id}/moderate`, { status })
      .then((response) => response.data),
  updateRequestStatus: (id, status) =>
    http
      .patch(`/admin/requests/${id}/status`, { status })
      .then((response) => response.data),
  updateOrderStatus: (id, status) =>
    http
      .patch(`/admin/orders/${id}/status`, { status })
      .then((response) => response.data),
  removeCompany: (id) =>
    http.delete(`/admin/companies/${id}`).then((response) => response.data),
  removeReview: (id) =>
    http.delete(`/admin/reviews/${id}`).then((response) => response.data),
};

function multipart() {
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
}
