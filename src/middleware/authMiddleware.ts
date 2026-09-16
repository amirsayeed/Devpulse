import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import type { JWTPayload } from '../types';
import type { NextFunction, Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Token is required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const isMaintainer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'maintainer') {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Only maintainers can perform this action',
    });
  }

  next();
};