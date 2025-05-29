import axios, { AxiosResponse } from 'axios';
import { AuthResponse, VideoResponse, VideosResponse, VideoUploadData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? 'http://backend:5000/api'
    : 'http://localhost:5000/api'
);

// Simple in-memory cache for GET requests
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 30000; // 30 seconds

// Create axios instance with optimized defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache helper functions
const getCacheKey = (url: string, params?: any) => {
  return `${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
};

const getFromCache = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any, ttl: number = CACHE_TTL) => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

// Request interceptor with caching and auth
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check cache for GET requests
    if (config.method === 'get' && !config.headers['Cache-Control']) {
      const cacheKey = getCacheKey(config.url!, config.params);
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        // Return cached data as a resolved promise
        return Promise.reject({
          __cached: true,
          data: cachedData
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with caching and error handling
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = getCacheKey(response.config.url!, response.config.params);
      setCache(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.__cached) {
      return Promise.resolve({ data: error.data });
    }

    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Enhanced error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: any } }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Video API calls
export const videoAPI = {
  getVideos: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<VideosResponse> => {
    const response: AxiosResponse<VideosResponse> = await api.get('/videos', { params });
    return response.data;
  },

  getVideo: async (id: string): Promise<VideoResponse> => {
    const response: AxiosResponse<VideoResponse> = await api.get(`/videos/${id}`);
    return response.data;
  },

  uploadVideo: async (data: VideoUploadData): Promise<{ success: boolean; message: string; data: { video: any } }> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags', data.tags);
    formData.append('video', data.video);

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyVideos: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<VideosResponse> => {
    const response: AxiosResponse<VideosResponse> = await api.get('/videos/my-videos', { params });
    return response.data;
  },

  deleteVideo: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },

  getVideoStreamUrl: (id: string): string => {
    return `${API_BASE_URL}/videos/${id}/stream`;
  },
};

export default api;
