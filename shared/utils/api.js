/**
 * API Utility — Wrapper for fetch with auth and error handling
 * Configurable base URL for dev (Live Server) and production (GitHub Pages)
 */

// Detect environment: true for local dev (Live Server on 5500), false for production
const IS_DEV = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
const API_BASE_URL = IS_DEV
  ? 'http://127.0.0.1:3000'
  : 'https://server.nextdimensioncustoms.in';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

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

  // Tool processing - dispatches to browser or server based on tool type
  process: async (toolId, files, options = {}) => {
    const response = await api.post('/api/tools/process', {
      toolId,
      files: Array.from(files).map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        // File data will be sent as FormData in real implementation
      })),
      options
    });
    return response;
  },

  // Health
  health: () => api.get('/api/health')
};

export { ApiError, API_BASE_URL, IS_DEV };