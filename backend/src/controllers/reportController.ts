import { Response } from 'express';
import { AuthRequest } from '../types';
import * as SessionModel from '../models/sessionModel';
import * as BreakModel from '../models/breakModel';

export const getDailyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startDate = new Date(date.setHours(0, 0, 0, 0));
    const endDate = new Date(date.setHours(23, 59, 59, 999));

    const sessions = await SessionModel.getSessionsByDateRange(req.user!.id, startDate, endDate);
    const breaks = await BreakModel.getBreaksByDateRange(req.user!.id, startDate, endDate);

    const totalWorkTime = sessions
      .filter(s => s.end_time)
      .reduce((sum, s) => sum + s.duration, 0);
    
    const totalBreakTime = breaks
      .filter(b => b.end_time)
      .reduce((sum, b) => sum + b.duration, 0);

    const taskBreakdown = sessions
      .filter(s => s.end_time)
      .reduce((acc: any, s: any) => {
        const taskName = s.task_name;
        if (!acc[taskName]) {
          acc[taskName] = {
            name: taskName,
            category: s.category,
            color: s.color,
            totalTime: 0,
            sessionCount: 0,
          };
        }
        acc[taskName].totalTime += s.duration;
        acc[taskName].sessionCount += 1;
        return acc;
      }, {});

    res.json({
      date: startDate,
      totalWorkTime,
      totalBreakTime,
      sessionCount: sessions.length,
      breakCount: breaks.length,
      taskBreakdown: Object.values(taskBreakdown),
      sessions,
      breaks,
    });
  } catch (error) {
    console.error('Get daily report error:', error);
    res.status(500).json({ error: 'Failed to fetch daily report' });
  }
};

export const getWeeklyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay());
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const sessions = await SessionModel.getSessionsByDateRange(req.user!.id, startDate, endDate);
    const breaks = await BreakModel.getBreaksByDateRange(req.user!.id, startDate, endDate);

    const totalWorkTime = sessions
      .filter(s => s.end_time)
      .reduce((sum, s) => sum + s.duration, 0);
    
    const totalBreakTime = breaks
      .filter(b => b.end_time)
      .reduce((sum, b) => sum + b.duration, 0);

    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(startDate.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(
        s => s.end_time && new Date(s.start_time) >= dayStart && new Date(s.start_time) <= dayEnd
      );

      const dayWorkTime = daySessions.reduce((sum, s) => sum + s.duration, 0);

      dailyBreakdown.push({
        date: dayStart,
        workTime: dayWorkTime,
        sessionCount: daySessions.length,
      });
    }

    const taskBreakdown = sessions
      .filter(s => s.end_time)
      .reduce((acc: any, s: any) => {
        const taskName = s.task_name;
        if (!acc[taskName]) {
          acc[taskName] = {
            name: taskName,
            category: s.category,
            color: s.color,
            totalTime: 0,
            sessionCount: 0,
          };
        }
        acc[taskName].totalTime += s.duration;
        acc[taskName].sessionCount += 1;
        return acc;
      }, {});

    res.json({
      startDate,
      endDate,
      totalWorkTime,
      totalBreakTime,
      sessionCount: sessions.length,
      breakCount: breaks.length,
      dailyBreakdown,
      taskBreakdown: Object.values(taskBreakdown),
    });
  } catch (error) {
    console.error('Get weekly report error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly report' });
  }
};

export const getMonthlyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const sessions = await SessionModel.getSessionsByDateRange(req.user!.id, startDate, endDate);
    const breaks = await BreakModel.getBreaksByDateRange(req.user!.id, startDate, endDate);

    const totalWorkTime = sessions
      .filter(s => s.end_time)
      .reduce((sum, s) => sum + s.duration, 0);
    
    const totalBreakTime = breaks
      .filter(b => b.end_time)
      .reduce((sum, b) => sum + b.duration, 0);

    const taskBreakdown = sessions
      .filter(s => s.end_time)
      .reduce((acc: any, s: any) => {
        const taskName = s.task_name;
        if (!acc[taskName]) {
          acc[taskName] = {
            name: taskName,
            category: s.category,
            color: s.color,
            totalTime: 0,
            sessionCount: 0,
          };
        }
        acc[taskName].totalTime += s.duration;
        acc[taskName].sessionCount += 1;
        return acc;
      }, {});

    res.json({
      startDate,
      endDate,
      totalWorkTime,
      totalBreakTime,
      sessionCount: sessions.length,
      breakCount: breaks.length,
      taskBreakdown: Object.values(taskBreakdown),
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
};

