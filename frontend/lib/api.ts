import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AI_URL      = process.env.NEXT_PUBLIC_AI_URL      || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const aiApi = axios.create({
  baseURL: AI_URL,
});

// Products
export const getProducts = (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
  api.get('/api/products', { params }).then((r) => r.data);

export const getProduct = (id: string) =>
  api.get(`/api/products/${id}`).then((r) => r.data);

// Orders
export const createOrder = (data: {
  items: { product: string; quantity: number; price: number }[];
  shippingAddress: object;
  paymentMethod: string;
  totalAmount: number;
  phone: string;
  email: string;
}) => api.post('/api/orders', data).then((r) => r.data);

export const getOrder = (id: string) =>
  api.get(`/api/orders/${id}`).then((r) => r.data);

// AI Try-On
export const uploadPersonImage = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return aiApi.post<{ person_id: string; url: string }>('/upload-person', form).then((r) => r.data);
};

export const uploadClothImage = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return aiApi.post<{ cloth_id: string; url: string }>('/upload-cloth', form).then((r) => r.data);
};

export const generateTryOn = (personId: string, clothId: string) =>
  aiApi.post<{ result_url: string; message: string }>('/generate', { person_id: personId, cloth_id: clothId }).then((r) => r.data);
