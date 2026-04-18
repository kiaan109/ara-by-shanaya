import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ara_admin_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ara_admin_token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password }).then((r) => r.data);

export const getProducts = (params?: object) =>
  api.get('/api/products', { params }).then((r) => r.data);

export const createProduct = (data: FormData) =>
  api.post('/api/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const updateProduct = (id: string, data: FormData) =>
  api.put(`/api/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const deleteProduct = (id: string) =>
  api.delete(`/api/products/${id}`).then((r) => r.data);

export const uploadExcel = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/upload/excel', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const uploadProductImage = (productId: string, file: File) => {
  const form = new FormData();
  form.append('image', file);
  return api.post(`/api/upload/product-image/${productId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const getOrders = (params?: object) =>
  api.get('/api/orders', { params }).then((r) => r.data);

export const updateOrderStatus = (id: string, data: object) =>
  api.put(`/api/orders/${id}/status`, data).then((r) => r.data);

export const deleteOrder = (id: string) =>
  api.delete(`/api/orders/${id}`).then((r) => r.data);
