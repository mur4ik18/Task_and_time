import { Response } from 'express';
import { AuthRequest } from '../types';
import * as TaskModel from '../models/taskModel';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const tasks = await TaskModel.getTasksByUser(req.user!.id, includeInactive);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await TaskModel.getTaskById(taskId, req.user!.id);
    
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, color } = req.body;
    const task = await TaskModel.createTask(req.user!.id, name, category, color);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    const { name, category, color, is_active } = req.body;
    
    const task = await TaskModel.updateTask(taskId, req.user!.id, {
      name,
      category,
      color,
      is_active,
    });
    
    if (!task) {
      res.status(404).json({ error: 'Task not found or no changes made' });
      return;
    }
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    const deleted = await TaskModel.deleteTask(taskId, req.user!.id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
