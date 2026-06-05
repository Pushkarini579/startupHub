import api from './api';
import { User } from '../types';

export interface GetUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export const userService = {
  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}): Promise<GetUsersResponse> => {
    const queryParts = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.role) queryParts.push(`role=${params.role}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<GetUsersResponse>(`/users${queryString}`);
  },

  createUser: async (formData: FormData): Promise<{ user: User }> => {
    return api.post<{ user: User }>('/users', formData, true);
  },

  updateUser: async (id: string, formData: FormData): Promise<{ user: User }> => {
    return api.put<{ user: User }>(`/users/${id}`, formData, true);
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/users/${id}`);
  },
};

export default userService;
