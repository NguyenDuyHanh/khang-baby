const API_URL = 'http://localhost:4000/api/public';

export async function fetchProducts(search = '', category = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('danh_muc', category);
  
  const res = await fetch(`${API_URL}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createOrder(orderData, token) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create order');
  }
  return res.json();
}

export async function fetchVouchers() {
  const res = await fetch(`${API_URL}/vouchers`);
  if (!res.ok) throw new Error('Failed to fetch vouchers');
  return res.json();
}

export async function validateVoucher(code, amount, token) {
  const res = await fetch(`http://localhost:4000/api/vouchers/validate?code=${encodeURIComponent(code)}&amount=${amount}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to validate voucher');
  }
  return res.json();
}
