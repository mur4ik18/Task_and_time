import { Response } from 'express';
import { AuthRequest } from '../types';
import * as SessionModel from '../models/sessionModel';
import * as TaskModel from '../models/taskModel';

export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId, timeLimit } = req.body;

    if (!taskId) {
      res.status(400).json({ error: 'Task ID is required' });
      return;
    }

    // Check if task exists and belongs to user
    const task = await TaskModel.getTaskById(taskId, req.user!.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Check if there's already an active session
    const activeSession = await SessionModel.getActiveSession(req.user!.id);
    if (activeSession) {
      res.status(400).json({ error: 'Another session is already active. Please end it first.' });
      return;
    }

    const session = await SessionModel.createSession(taskId, req.user!.id, timeLimit);
    res.status(201).json(session);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

export const getActiveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await SessionModel.getActiveSession(req.user!.id);
    if (!session) {
      res.status(404).json({ error: 'No active session' });
      return;
    }
    res.json(session);
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
};

export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.id);
    const { notes } = req.body;

    const session = await SessionModel.endSession(sessionId, req.user!.id, notes);
    
    if (!session) {
      res.status(404).json({ error: 'Session not found or already ended' });
      return;
    }
    
    res.json(session);
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
};

export const markTimeLimitReached = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.id);
    await SessionModel.updateSessionTimeLimitReached(sessionId, req.user!.id);
    res.json({ message: 'Time limit marked as reached' });
  } catch (error) {
    console.error('Mark time limit error:', error);
    res.status(500).json({ error: 'Failed to mark time limit' });
  }
};

export const getSessionsByTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.taskId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const sessions = await SessionModel.getSessionsByTask(taskId, req.user!.id, limit);
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions by task error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};
