import api from './api';

export const exportService = {
  async exportData(): Promise<Blob> {
    const response = await api.get('/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  async importData(data: any): Promise<{ message: string; imported: any }> {
    const response = await api.post('/export/import', data);
    return response.data;
  },
};

