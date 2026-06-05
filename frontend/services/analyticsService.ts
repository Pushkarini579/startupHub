import api from './api';
import { AnalyticsResponse } from '../types';

export const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    return api.get<AnalyticsResponse>('/analytics');
  },
};

export default analyticsService;
