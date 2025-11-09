import api from './api';
import { Session } from './sessions';
import { Break } from './breaks';

export interface TaskBreakdown {
  name: string;
  category?: string;
  color: string;
  totalTime: number;
  sessionCount: number;
}

export interface DailyReport {
  date: string;
  totalWorkTime: number;
  totalBreakTime: number;
  sessionCount: number;
  breakCount: number;
  taskBreakdown: TaskBreakdown[];
  sessions: Session[];
  breaks: Break[];
}

export interface DailyBreakdown {
  date: string;
  workTime: number;
  sessionCount: number;
}

export interface WeeklyReport {
  startDate: string;
  endDate: string;
  totalWorkTime: number;
  totalBreakTime: number;
  sessionCount: number;
  breakCount: number;
  dailyBreakdown: DailyBreakdown[];
  taskBreakdown: TaskBreakdown[];
}

export interface MonthlyReport {
  startDate: string;
  endDate: string;
  totalWorkTime: number;
  totalBreakTime: number;
  sessionCount: number;
  breakCount: number;
  taskBreakdown: TaskBreakdown[];
}

export const reportService = {
  async getDailyReport(date?: string): Promise<DailyReport> {
    const response = await api.get<DailyReport>('/reports/daily', {
      params: { date },
    });
    return response.data;
  },

  async getWeeklyReport(date?: string): Promise<WeeklyReport> {
    const response = await api.get<WeeklyReport>('/reports/weekly', {
      params: { date },
    });
    return response.data;
  },

  async getMonthlyReport(date?: string): Promise<MonthlyReport> {
    const response = await api.get<MonthlyReport>('/reports/monthly', {
      params: { date },
    });
    return response.data;
  },
};

