import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
};

export const skillsAPI = {
  getAll: () => api.get('/api/skills'),
  getSkillGaps: () => api.get('/api/skill-gaps'),
};

export const usersAPI = {
  getMySkills: () => api.get('/api/users/me/skills'),
  getMyStats: () => api.get('/api/users/me/stats'),
};

export const coursesAPI = {
  getAll: () => api.get('/api/courses'),
  getById: (courseId) => api.get(`/api/courses/${courseId}`),
  getLearningPath: () => api.get('/api/learning-path'),
};

export const recommendationsAPI = {
  getAll: () => api.get('/api/recommendations'),
};

export const assessmentsAPI = {
  uploadMaterial: (file) => {
    const body = new FormData();
    body.append('file', file);
    return api.post('/api/assessments/upload-material', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  generate: (data) => api.post('/api/assessments/generate', data),
  submit: (assessmentId, data) => api.post(`/api/assessments/${assessmentId}/submit`, data),
};

export const chatbotAPI = {
  sendMessage: (data) => api.post('/api/chat', data),
};

export default api;
