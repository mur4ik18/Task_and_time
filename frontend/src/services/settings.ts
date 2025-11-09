import api from './api';

export interface Settings {
  user_id: number;
  default_time_limit: number;
  notification_sound_url?: string;
  theme: string;
  enable_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export const settingsService = {
  async getSettings(): Promise<Settings> {
    const response = await api.get<Settings>('/settings');
    return response.data;
  },

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const response = await api.put<Settings>('/settings', data);
    return response.data;
  },

  async uploadSound(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('sound', file);

    const response = await api.post<{ url: string }>('/upload/sound', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

