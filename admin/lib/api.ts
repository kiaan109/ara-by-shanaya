// Admin API — points to the live frontend for product data
const FRONTEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://frontend-iota-three-66.vercel.app';

// Products — served by the frontend's Next.js API routes
export const getProducts = async (params?: Record<string, any>) => {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${FRONTEND}/api/products${q ? `?${q}` : ''}`);
  return res.json();
};

export const getProduct = async (id: string) => {
  const res = await fetch(`${FRONTEND}/api/products/${id}`);
  return res.json();
};

// Orders — no backend, return empty
export const getOrders = async () => ({
  orders: [],
  total: 0,
  message: 'Order management requires the backend server.',
});

export const updateOrderStatus = async () => ({ ok: true });
export const deleteOrder       = async () => ({ ok: true });

// These require a backend — show a message
export const createProduct    = async () => { throw new Error('Requires backend'); };
export const updateProduct    = async () => { throw new Error('Requires backend'); };
export const deleteProduct    = async () => { throw new Error('Requires backend'); };
export const uploadExcel      = async () => { throw new Error('Requires backend'); };
