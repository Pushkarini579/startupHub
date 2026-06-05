import api from './api';
import { Project, User } from '../types';

export interface GetProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export const projectService = {
  getProjects: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    startupId?: string;
  } = {}): Promise<GetProjectsResponse> => {
    const queryParts = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.status) queryParts.push(`status=${params.status}`);
    if (params.priority) queryParts.push(`priority=${params.priority}`);
    if (params.startupId) queryParts.push(`startupId=${params.startupId}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<GetProjectsResponse>(`/projects${queryString}`);
  },

  getProjectById: async (id: string): Promise<{ project: Project }> => {
    return api.get<{ project: Project }>(`/projects/${id}`);
  },

  getAssignees: async (): Promise<{ users: User[] }> => {
    return api.get<{ users: User[] }>('/projects/assignees');
  },

  createProject: async (formData: FormData): Promise<{ project: Project }> => {
    return api.post<{ project: Project }>('/projects', formData, true);
  },

  updateProject: async (id: string, formData: FormData): Promise<{ project: Project }> => {
    return api.put<{ project: Project }>(`/projects/${id}`, formData, true);
  },

  deleteProject: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/projects/${id}`);
  },
};

export default projectService;
