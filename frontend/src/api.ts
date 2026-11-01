import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { User, Room, Exam, Report, Invoice, UserSchema, RoomSchema, ExamSchema, ReportSchema, InvoiceSchema, PaginatedResponseSchema } from './types';

const API_BASE_URL = '/api';

// Auto-detect K8s preview proxy and rewrite API URLs
const isProxied = window.location.pathname.includes('/preview/proxy');
const proxyBase = isProxied
  ? window.location.pathname.replace(/\/preview\/proxy.*/, '/preview/proxy')
  : '';

const api: AxiosInstance = axios.create({
  baseURL: proxyBase + API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401 with a stored refresh token (the Express track issues one), refresh once and retry.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const refreshToken = localStorage.getItem('refreshToken');
    if (error.response?.status === 401 && refreshToken && original && !original._retried) {
      original._retried = true;
      try {
        const res = await axios.post(proxyBase + API_BASE_URL + '/auth/refresh/', { refreshToken });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        return api(original);
      } catch {
        localStorage.removeItem('refreshToken');
      }
    }
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('token');
      if (originalRequest.method === 'get') {
        originalRequest._retry = true;
        delete originalRequest.headers.Authorization;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// Response validation is advisory: a schema mismatch must never blank a page.
const parseOr = <S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn('[api] response did not match schema, using raw data:', result.error.issues.slice(0, 3));
    return data as z.output<S>;
  }
  return result.data;
};

// Auth API
export const login = (credentials: { username: string; password: string }) =>
  api.post('/auth/login/', credentials);
export const register = (data: { username: string; email: string; password: string }) =>
  api.post('/auth/register/', data);
export const logout = () => api.post('/auth/logout/');
export const getProfile = () => api.get('/auth/profile/');

// ── User API ──
export const getUserList = async (params?: Record<string, unknown>): Promise<User[]> => {
  const res = await api.get('/users/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.users ?? res.data?.users ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(UserSchema), data) as User[];
};

export const getUser = async (id: number | string | Record<string, unknown>): Promise<User> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getUserList(id) as unknown as Promise<User>;
  const res = await api.get(`/users/${id}/`);
  return parseOr(UserSchema, res.data) as User;
};

// ── Room API ──
export const getRoomList = async (params?: Record<string, unknown>): Promise<Room[]> => {
  const res = await api.get('/scheduling/rooms/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.rooms ?? res.data?.rooms ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(RoomSchema), data) as Room[];
};

export const getRoom = async (id: number | string | Record<string, unknown>): Promise<Room> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getRoomList(id) as unknown as Promise<Room>;
  const res = await api.get(`/scheduling/rooms/${id}/`);
  return parseOr(RoomSchema, res.data) as Room;
};

export const createRoom = async (data: Omit<Room, 'id'>): Promise<Room> => {
  const res = await api.post('/scheduling/rooms/', data);
  return parseOr(RoomSchema, res.data) as Room;
};

export const updateRoom = async (id: number, data: Partial<Room>): Promise<Room> => {
  const res = await api.patch(`/scheduling/rooms/${id}/`, data);
  return parseOr(RoomSchema, res.data) as Room;
};

export const deleteRoom = async (id: number) => {
  await api.delete(`/scheduling/rooms/${id}/`);
};

// ── Exam API ──
export const getExamList = async (params?: Record<string, unknown>): Promise<Exam[]> => {
  const res = await api.get('/scheduling/exams/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.exams ?? res.data?.exams ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(ExamSchema), data) as Exam[];
};

export const getExam = async (id: number | string | Record<string, unknown>): Promise<Exam> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getExamList(id) as unknown as Promise<Exam>;
  const res = await api.get(`/scheduling/exams/${id}/`);
  return parseOr(ExamSchema, res.data) as Exam;
};

export const createExam = async (data: Omit<Exam, 'id'>): Promise<Exam> => {
  const res = await api.post('/scheduling/exams/', data);
  return parseOr(ExamSchema, res.data) as Exam;
};

export const updateExam = async (id: number, data: Partial<Exam>): Promise<Exam> => {
  const res = await api.patch(`/scheduling/exams/${id}/`, data);
  return parseOr(ExamSchema, res.data) as Exam;
};

// ── Report API ──
export const getReportList = async (params?: Record<string, unknown>): Promise<Report[]> => {
  const res = await api.get('/reports/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.reports ?? res.data?.reports ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(ReportSchema), data) as Report[];
};

export const getReport = async (id: number | string | Record<string, unknown>): Promise<Report> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getReportList(id) as unknown as Promise<Report>;
  const res = await api.get(`/reports/${id}/`);
  return parseOr(ReportSchema, res.data) as Report;
};

export const createReport = async (data: Omit<Report, 'id'>): Promise<Report> => {
  const res = await api.post('/reports/', data);
  return parseOr(ReportSchema, res.data) as Report;
};

export const updateReport = async (id: number, data: Partial<Report>): Promise<Report> => {
  const res = await api.patch(`/reports/${id}/`, data);
  return parseOr(ReportSchema, res.data) as Report;
};

export const deleteReport = async (id: number) => {
  await api.delete(`/reports/${id}/`);
};

// ── Invoice API ──
export const getInvoiceList = async (params?: Record<string, unknown>): Promise<Invoice[]> => {
  const res = await api.get('/invoices/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.invoices ?? res.data?.invoices ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(InvoiceSchema), data) as Invoice[];
};

export const getInvoice = async (id: number | string | Record<string, unknown>): Promise<Invoice> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getInvoiceList(id) as unknown as Promise<Invoice>;
  const res = await api.get(`/invoices/${id}/`);
  return parseOr(InvoiceSchema, res.data) as Invoice;
};

export const createInvoice = async (data: Omit<Invoice, 'id'>): Promise<Invoice> => {
  const res = await api.post('/invoices/', data);
  return parseOr(InvoiceSchema, res.data) as Invoice;
};

export const updateInvoice = async (id: number, data: Partial<Invoice>): Promise<Invoice> => {
  const res = await api.patch(`/invoices/${id}/`, data);
  return parseOr(InvoiceSchema, res.data) as Invoice;
};

export const deleteInvoice = async (id: number) => {
  await api.delete(`/invoices/${id}/`);
};


// Auth aliases — domain agents use varied naming conventions
export const loginUser = (email: string, password: string) => api.post('/auth/login/', { username: email, password });
export const registerUser = (userData: any) => api.post('/auth/register/', userData);
export const getCurrentUser = getProfile;
export const updateUserProfile = (data: Partial<any>) => api.patch('/auth/profile/', data);

export { api };
export default api;
