import { Response } from 'express';
import { AuthRequest } from '../types';
import * as BreakModel from '../models/breakModel';

export const startBreak = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if there's already an active break
    const activeBreak = await BreakModel.getActiveBreak(req.user!.id);
    if (activeBreak) {
      res.status(400).json({ error: 'A break is already active' });
      return;
    }

    const breakRecord = await BreakModel.createBreak(req.user!.id);
    res.status(201).json(breakRecord);
  } catch (error) {
    console.error('Start break error:', error);
    res.status(500).json({ error: 'Failed to start break' });
  }
};

export const getActiveBreak = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const breakRecord = await BreakModel.getActiveBreak(req.user!.id);
    if (!breakRecord) {
      res.status(404).json({ error: 'No active break' });
      return;
    }
    res.json(breakRecord);
  } catch (error) {
    console.error('Get active break error:', error);
    res.status(500).json({ error: 'Failed to fetch active break' });
  }
};

export const endBreak = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const breakId = parseInt(req.params.id);
    const breakRecord = await BreakModel.endBreak(breakId, req.user!.id);
    
    if (!breakRecord) {
      res.status(404).json({ error: 'Break not found or already ended' });
      return;
    }
    
    res.json(breakRecord);
  } catch (error) {
    console.error('End break error:', error);
    res.status(500).json({ error: 'Failed to end break' });
  }
};

