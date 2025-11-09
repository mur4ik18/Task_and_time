import api from './api';

export interface Session {
  id: number;
  task_id: number;
  user_id: number;
  start_time: string;
  end_time?: string;
  duration: number;
  time_limit?: number;
  time_limit_reached: boolean;
  notes?: string;
  created_at: string;
  task_name?: string;
  category?: string;
  color?: string;
}

export const sessionService = {
  async startSession(taskId: number, timeLimit?: number): Promise<Session> {
    const response = await api.post<Session>('/sessions/start', {
      taskId,
      timeLimit,
    });
    return response.data;
  },

  async getActiveSession(): Promise<Session> {
    const response = await api.get<Session>('/sessions/active');
    return response.data;
  },

  async endSession(sessionId: number, notes?: string): Promise<Session> {
    const response = await api.put<Session>(`/sessions/${sessionId}/end`, {
      notes,
    });
    return response.data;
  },

  async markTimeLimitReached(sessionId: number): Promise<void> {
    await api.put(`/sessions/${sessionId}/time-limit-reached`);
  },

  async getSessionsByTask(taskId: number, limit?: number): Promise<Session[]> {
    const response = await api.get<Session[]>(`/sessions/task/${taskId}`, {
      params: { limit },
    });
    return response.data;
  },
};

