export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type User = {
  id: number;
  email: string;
  name: string;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: User;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
};

export type TaskPayload = {
  title: string;
  description: string;
  status?: TaskStatus;
};

export type TaskFilters = {
  status?: TaskStatus | "";
  search: string;
  from: string;
  to: string;
  page: number;
  limit: number;
};

export type PaginatedTasks = {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
