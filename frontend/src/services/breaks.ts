import api from './api';

export interface Break {
  id: number;
  user_id: number;
  start_time: string;
  end_time?: string;
  duration: number;
  created_at: string;
}

export const breakService = {
  async startBreak(): Promise<Break> {
    const response = await api.post<Break>('/breaks/start');
    return response.data;
  },

  async getActiveBreak(): Promise<Break> {
    const response = await api.get<Break>('/breaks/active');
    return response.data;
  },

  async endBreak(breakId: number): Promise<Break> {
    const response = await api.put<Break>(`/breaks/${breakId}/end`);
    return response.data;
  },
};

