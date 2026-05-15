const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const normalizePath = (path) => (path.startsWith("/") ? path : `/${path}`);

export async function apiRequest(path, { method = "GET", body, token, headers, ...rest } = {}) {
  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}