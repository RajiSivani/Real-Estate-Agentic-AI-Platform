import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Listings API
export const listingsApi = {
  create: (data: any) => api.post('/api/v1/listings', data),
  getAll: (params?: any) => api.get('/api/v1/listings', { params }),
  getOne: (id: string) => api.get(`/api/v1/listings/${id}`),
  update: (id: string, data: any) => api.patch(`/api/v1/listings/${id}`, data),
  generateContent: (id: string) => api.post(`/api/v1/listings/${id}/generate-content`),
  analyzeImages: (id: string, imageUrls: string[]) =>
    api.post(`/api/v1/listings/${id}/analyze-images`, imageUrls),
  pricingStrategy: (id: string) => api.post(`/api/v1/listings/${id}/pricing-strategy`),
  addImages: (id: string, imageUrls: string[]) =>
    api.post(`/api/v1/listings/${id}/images`, imageUrls),
  publish: (id: string) => api.post(`/api/v1/listings/${id}/publish`),
}

// Offers API
export const offersApi = {
  create: (data: any) => api.post('/api/v1/offers', data),
  getAll: (params?: any) => api.get('/api/v1/offers', { params }),
  getOne: (id: string) => api.get(`/api/v1/offers/${id}`),
  respond: (id: string, data: any) => api.post(`/api/v1/offers/${id}/respond`, data),
  analyze: (id: string) => api.post(`/api/v1/offers/${id}/analyze`),
}

// Buyer API
export const buyerApi = {
  matchProperties: (preferences: any) => api.post('/api/v1/buyer/match', preferences),

  // listing_id sent as query param: POST /api/v1/buyer/evaluate-property?listing_id=xxx
  evaluateProperty: (listingId: string) =>
    api.post('/api/v1/buyer/evaluate-property', null, {
      params: { listing_id: listingId }
    }),

  negotiationStrategy: (data: any) => api.post('/api/v1/buyer/negotiation-strategy', data),
}

// Notifications API
export const notificationsApi = {
  getAll: (userId: string, params?: any) =>
    api.get('/api/v1/notifications', { params: { recipient_user_id: userId, ...params } }),
  markRead: (id: string) => api.patch(`/api/v1/notifications/${id}`, { is_read: true }),
  markAllRead: (userId: string) =>
    api.post('/api/v1/notifications/mark-all-read', null, {
      params: { recipient_user_id: userId }
    }),
}
