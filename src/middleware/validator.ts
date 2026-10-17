import { Request, Response, NextFunction } from 'express';
import { sanitizeText } from '../utils/cryptoSecurity';
import { TaskPriority, TaskStatus } from '../types/task';

const VALID_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];

export const validateCreateTask = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, priority, tags } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: { message: 'Title is required and must be a non-empty string', statusCode: 400 }
    });
    return;
  }

  if (title.length > 200) {
    res.status(400).json({
      success: false,
      error: { message: 'Title cannot exceed 200 characters', statusCode: 400 }
    });
    return;
  }

  if (description && (typeof description !== 'string' || description.length > 5000)) {
    res.status(400).json({
      success: false,
      error: { message: 'Description must be a string under 5000 characters', statusCode: 400 }
    });
    return;
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    res.status(400).json({
      success: false,
      error: {
        message: `Invalid priority '${priority}'. Allowed values: ${VALID_PRIORITIES.join(', ')}`,
        statusCode: 400
      }
    });
    return;
  }

  if (tags && (!Array.isArray(tags) || tags.some(t => typeof t !== 'string'))) {
    res.status(400).json({
      success: false,
      error: { message: 'Tags must be an array of strings', statusCode: 400 }
    });
    return;
  }

  // Sanitize fields
  req.body.title = sanitizeText(title);
  if (description) {
    req.body.description = sanitizeText(description);
  }

  next();
};

export const validateUpdateTask = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, status, priority, tags } = req.body;

  // Prevent prototype pollution
  if (req.body.__proto__ || req.body.constructor?.prototype) {
    res.status(400).json({
      success: false,
      error: { message: 'Malicious payload detected', statusCode: 400 }
    });
    return;
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Title must be a non-empty string', statusCode: 400 }
      });
      return;
    }
    if (title.length > 200) {
      res.status(400).json({
        success: false,
        error: { message: 'Title cannot exceed 200 characters', statusCode: 400 }
      });
      return;
    }
    req.body.title = sanitizeText(title);
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.length > 5000) {
      res.status(400).json({
        success: false,
        error: { message: 'Description must be a string under 5000 characters', statusCode: 400 }
      });
      return;
    }
    req.body.description = sanitizeText(description);
  }

  if (status && !VALID_STATUSES.includes(status)) {
    res.status(400).json({
      success: false,
      error: {
        message: `Invalid status '${status}'. Allowed values: ${VALID_STATUSES.join(', ')}`,
        statusCode: 400
      }
    });
    return;
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    res.status(400).json({
      success: false,
      error: {
        message: `Invalid priority '${priority}'. Allowed values: ${VALID_PRIORITIES.join(', ')}`,
        statusCode: 400
      }
    });
    return;
  }

  if (tags && (!Array.isArray(tags) || tags.some(t => typeof t !== 'string'))) {
    res.status(400).json({
      success: false,
      error: { message: 'Tags must be an array of strings', statusCode: 400 }
    });
    return;
  }

  next();
};
