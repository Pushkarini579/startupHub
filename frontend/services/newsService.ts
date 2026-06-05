import api from './api';
import { NewsItem } from '../types';

export const newsService = {
  getNews: async (): Promise<{ news: NewsItem[] }> => {
    return api.get<{ news: NewsItem[] }>('/news');
  },
};

export default newsService;
