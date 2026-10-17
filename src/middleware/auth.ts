import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    apiKey: string;
    role: string;
  };
}

const VALID_API_KEYS = new Map<string, { id: string; role: string }>([
  ['test-api-key-admin', { id: 'usr-1', role: 'admin' }],
  ['test-api-key-member', { id: 'usr-2', role: 'member' }]
]);

export const requireApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = (req.headers['x-api-key'] as string) || (req.query.api_key as string);

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Missing API key. Provide via X-API-Key header.',
        statusCode: 401
      }
    });
    return;
  }

  const keyData = VALID_API_KEYS.get(apiKey);
  if (!keyData) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or revoked API key.',
        statusCode: 403
      }
    });
    return;
  }

  req.user = {
    id: keyData.id,
    apiKey,
    role: keyData.role
  };

  next();
};
