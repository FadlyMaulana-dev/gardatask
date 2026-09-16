/**
 * Centralized API base URL configuration.
 * Set VITE_API_URL in your .env file to point to your backend.
 *
 * Local dev  : VITE_API_URL=http://localhost:8000/api
 * Production : VITE_API_URL=https://api.yourdomain.com/api
 *              atau VITE_API_URL=https://yourdomain.com/api
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Helper fetch dengan Authorization header otomatis.
 * @param {string} endpoint - path setelah base URL, contoh: '/tasks'
 * @param {object} options  - fetch options (method, body, dll)
 * @param {string|null} token - Bearer token (dari AuthContext)
 */
export async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  return res
}

export default API_URL
