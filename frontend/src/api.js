import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Silent token refresh — when a 401 happens, get a new token and retry once
let isRefreshing = false
let pendingQueue = []

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token))
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then(newToken => {
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${BASE}/api/auth/refresh`,
          null,
          { params: { authorization: `Bearer ${token}` } }
        )
        const newToken = res.data.access_token
        localStorage.setItem('token', newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login:    (username, password) =>
    api.post('/auth/login', { username, password }),
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
}

export const productAPI = {
  list: (category) => api.get('/product/products', { params: { category } }),
  get:  (id)       => api.get(`/product/products/${id}`),
  create: (data)   => api.post('/product/products', data),
  delete: (id)     => api.delete(`/product/products/${id}`),
}

export const userAPI = {
  list:   ()     => api.get('/user/users'),
  get:    (id)   => api.get(`/user/users/${id}`),
  create: (data) => api.post('/user/users', data),
  update: (id, data) => api.put(`/user/users/${id}`, data),
  delete: (id)   => api.delete(`/user/users/${id}`),
}

export const paymentAPI = {
  process: (data) => api.post('/payment/payments', data),
  get:     (id)   => api.get(`/payment/payments/${id}`),
  byUser:  (uid)  => api.get(`/payment/payments/user/${uid}`),
}

export const aiAPI = {
  chat:      (messages, sessionId) =>
    api.post('/ai-assistant/chat', { messages, session_id: sessionId }),
  summarize: (text)  => api.post('/ai-assistant/summarize', null, { params: { text } }),
  recommend: (data)  => api.post('/recommendation/recommend', data),
}

export const modelAPI = {
  list:      ()      => api.get('/model/models'),
  inference: (data)  => api.post('/model/inference', data),
}

export const controlPlaneAPI = {
  status:     (namespace) => api.get('/control-plane/status', { params: namespace ? { namespace } : {} }),
  namespaces: ()          => api.get('/control-plane/namespaces'),
  models:     ()          => api.get('/control-plane/models'),
  register:   (data)      => api.post('/control-plane/models/register', data),
  remove:     (id)        => api.delete(`/control-plane/models/${id}`),
}

export default api
