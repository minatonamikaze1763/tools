/**
 * API Utility — Wrapper for fetch with auth and error handling
 */

const API_BASE = 'https://server.nextdimensioncustoms.in';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  const token = sessionStorage.getItem('ndc_tools_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'omit'
  };

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message = data?.error || data?.message || `HTTP ${response.status}`;
      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network error', 0, null);
  }
}

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body)
  }),
  put: (path, body, options = {}) => request(path, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
  patch: (path, body, options = {}) => request(path, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body)
  }),

  // Auth endpoints
  auth: {
    login: (username, password) => api.post('/api/tools/auth/login', { username, password }),
    logout: () => api.post('/api/tools/auth/logout'),
    me: () => api.get('/api/tools/access'),
    verify: () => api.get('/api/tools/auth/me')
  },

  // Engine
  getEngine: () => fetch(`${API_BASE}/api/tools/engine.js`, {
    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ndc_tools_token')}` }
  }).then(r => r.text()),

  // Health
  health: () => api.get('/api/health')
};

export { ApiError };