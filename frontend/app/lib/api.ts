import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "./auth-store";
import {
  AuthResponse,
  LoginPayload,
  PaginatedTasks,
  RegisterPayload,
  Task,
  TaskFilters,
  TaskPayload,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const { refreshToken, setSession, clearSession } = useAuthStore.getState();

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshToken
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await axios.post<AuthResponse>(
        `${API_URL}/auth/refresh`,
        { refreshToken },
      );

      setSession(data);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get<AuthResponse["user"]>("/auth/me");
    return data;
  },
  logout: async () => {
    const { data } = await api.post<{ message: string }>("/auth/logout");
    return data;
  },
};

export const tasksApi = {
  list: async (filters: TaskFilters) => {
    const { data } = await api.get<PaginatedTasks>("/tasks", {
      params: {
        ...filters,
        status: filters.status || undefined,
        search: filters.search || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      },
    });
    return data;
  },
  create: async (payload: TaskPayload) => {
    const { data } = await api.post<Task>("/tasks", payload);
    return data;
  },
  update: async (id: number, payload: Partial<TaskPayload>) => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    const { data } = await api.delete<Task>(`/tasks/${id}`);
    return data;
  },
};

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string") {
      return message;
    }
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}
