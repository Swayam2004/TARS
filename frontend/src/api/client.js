import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 60000 });

export const uploadDocument = (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress && onProgress(Math.round((e.loaded / e.total) * 100)),
  });
};

export const getRunbooks          = ()   => api.get('/runbooks');
export const getRunbook           = (id) => api.get(`/runbooks/${id}`);
export const updateRunbookStatus  = (id, status) => api.patch(`/runbooks/${id}/status`, { status });
export const validateRunbook      = (id) => api.post(`/runbooks/${id}/validate`);
export const getExecutionHistory  = (id) => api.get(`/runbooks/${id}/executions`);
export const getDashboard         = ()   => api.get('/analytics/dashboard');

export default api;
