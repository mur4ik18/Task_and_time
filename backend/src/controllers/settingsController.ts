import { Response } from 'express';
import { AuthRequest } from '../types';
import * as SettingsModel from '../models/settingsModel';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await SettingsModel.getSettings(req.user!.id);
    if (!settings) {
      res.status(404).json({ error: 'Settings not found' });
      return;
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { default_time_limit, notification_sound_url, theme, enable_notifications } = req.body;
    
    const settings = await SettingsModel.updateSettings(req.user!.id, {
      default_time_limit,
      notification_sound_url,
      theme,
      enable_notifications,
    });
    
    if (!settings) {
      res.status(404).json({ error: 'Settings not found or no changes made' });
      return;
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

