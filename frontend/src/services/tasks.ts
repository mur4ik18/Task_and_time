import api from './api';

export interface Task {
  id: number;
  user_id: number;
  name: string;
  category?: string;
  color: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const taskService = {
  async getTasks(includeInactive = false): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks', {
      params: { includeInactive },
    });
    return response.data;
  },

  async getTask(id: number): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: {
    name: string;
    category?: string;
    color?: string;
  }): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};

