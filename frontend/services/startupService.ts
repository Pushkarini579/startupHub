import api from './api';
import { Startup } from '../types';

export interface GetStartupsResponse {
  startups: Startup[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export const startupService = {
  getStartups: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    fundingStage?: string;
    status?: string;
    scope?: 'my' | 'all';
  } = {}): Promise<GetStartupsResponse> => {
    const queryParts = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.industry) queryParts.push(`industry=${encodeURIComponent(params.industry)}`);
    if (params.fundingStage) queryParts.push(`fundingStage=${encodeURIComponent(params.fundingStage)}`);
    if (params.status) queryParts.push(`status=${params.status}`);
    if (params.scope) queryParts.push(`scope=${params.scope}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<GetStartupsResponse>(`/startups${queryString}`);
  },

  getStartupById: async (id: string): Promise<{ startup: Startup }> => {
    return api.get<{ startup: Startup }>(`/startups/${id}`);
  },

  createStartup: async (formData: FormData): Promise<{ startup: Startup }> => {
    return api.post<{ startup: Startup }>('/startups', formData, true);
  },

  updateStartup: async (id: string, formData: FormData): Promise<{ startup: Startup }> => {
    return api.put<{ startup: Startup }>(`/startups/${id}`, formData, true);
  },

  approveStartup: async (id: string, status: 'Approved' | 'Rejected'): Promise<{ startup: Startup }> => {
    return api.put<{ startup: Startup }>(`/startups/${id}/approve`, { status });
  },

  deleteStartup: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/startups/${id}`);
  },
};

export default startupService;
