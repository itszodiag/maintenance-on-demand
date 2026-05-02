import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('maintenance_on_demand_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.message, {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    })
    
    // Better error handling for network errors
    if (!error.response) {
      // Network error or timeout
      const message = error.code === 'ECONNABORTED' 
        ? 'Request timeout. Please check your connection.'
        : error.message === 'Network Error'
        ? `Network error: Could not connect to API at ${error.config?.baseURL}. Please ensure the backend server is running.`
        : error.message ?? 'Network connection failed.'
      return Promise.reject(new Error(message))
    }
    
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong.'
    return Promise.reject(new Error(message))
  },
)

export const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '')
