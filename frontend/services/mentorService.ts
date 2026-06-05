import api from './api';
import { Mentor } from '../types';

export interface GetMentorsResponse {
  mentors: Mentor[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export const mentorService = {
  getMentors: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    expertise?: string;
    startupId?: string;
    scope?: 'my' | 'all';
  } = {}): Promise<GetMentorsResponse> => {
    const queryParts = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.expertise) queryParts.push(`expertise=${encodeURIComponent(params.expertise)}`);
    if (params.startupId) queryParts.push(`startupId=${params.startupId}`);
    if (params.scope) queryParts.push(`scope=${params.scope}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<GetMentorsResponse>(`/mentors${queryString}`);
  },

  getMentorById: async (id: string): Promise<{ mentor: Mentor }> => {
    return api.get<{ mentor: Mentor }>(`/mentors/${id}`);
  },

  createMentor: async (formData: FormData): Promise<{ mentor: Mentor }> => {
    return api.post<{ mentor: Mentor }>('/mentors', formData, true);
  },

  updateMentor: async (id: string, formData: FormData): Promise<{ mentor: Mentor }> => {
    return api.put<{ mentor: Mentor }>(`/mentors/${id}`, formData, true);
  },

  deleteMentor: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/mentors/${id}`);
  },
};

export default mentorService;
