import api from './api'

export const login = async (email: string, password: string) => {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data.data
}

export const getMyRequests = async () => {
  const res = await api.get('/api/requests/my')
  return res.data.data
}

export const getAllRequests = async () => {
  const res = await api.get('/api/requests')
  return res.data.data
}

export const getPendingApprovals = async () => {
  const res = await api.get('/api/requests/pending-my-approval')
  return res.data.data
}

export const getRequestById = async (id: number) => {
  const res = await api.get(`/api/requests/${id}`)
  return res.data.data
}

export const submitRequest = async (data: { templateId: number; title: string; description: string }) => {
  const res = await api.post('/api/requests', data)
  return res.data
}

export const approveRequest = async (id: number, comments: string) => {
  const res = await api.post(`/api/requests/${id}/approve`, { comments })
  return res.data
}

export const rejectRequest = async (id: number, comments: string) => {
  const res = await api.post(`/api/requests/${id}/reject`, { comments })
  return res.data
}

export const getTemplates = async () => {
  const res = await api.get('/api/templates')
  return res.data.data
}

export const getAllTemplates = async () => {
  const res = await api.get('/api/templates/all')
  return res.data.data
}

export const createTemplate = async (data: any) => {
  const res = await api.post('/api/templates', data)
  return res.data
}

export const deactivateTemplate = async (id: number) => {
  const res = await api.delete(`/api/templates/${id}`)
  return res.data
}

export const activateTemplate = async (id: number) => {
  const res = await api.put(`/api/templates/${id}/activate`)
  return res.data
}

export const getAnalytics = async () => {
  const res = await api.get('/api/requests/analytics')
  return res.data.data
}
