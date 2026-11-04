import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

const useLocalAuth = import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_AUTH === 'true'
let authTokenGetter = null

export function setAuthTokenGetter(getToken) {
  authTokenGetter = getToken
}

api.interceptors.request.use(async (config) => {
  if (useLocalAuth) {
    config.headers['X-Dev-User-Id'] = window.location.pathname.startsWith('/recruiter')
      ? 'recruiter_clerk_1'
      : 'mock-user-1'
    delete config.headers.Authorization
    return config
  }

  try {
    const token = await authTokenGetter?.()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.error('Error getting auth token:', error)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
