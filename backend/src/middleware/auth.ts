import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../database';
import { config } from '../config';
import { STAFF_ROLES, isRole } from '../access';
import type { Role } from '../access';

const JWT_SECRET = config.jwtSecret;

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: Role;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ') && !authHeader.startsWith('Token ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.replace(/^(Bearer |Token )/, '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role checks: after authMiddleware. The role is read from the database on every call, so a changed role takes
// effect at once; the token carries only the user id, and a role is never read from the request.
export function requireRole(...allowed: Role[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.userId ? await prisma.user.findUnique({ where: { id: req.userId }, select: { role: true } }) : null;
      const role = user?.role;
      if (isRole(role) && allowed.includes(role)) {
        req.userRole = role;
        return next();
      }
      return res.status(403).json({ error: 'Not allowed for your role' });
    } catch (error) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

// Staff-only routes: any of the app's staff roles (STAFF_ROLES in access.ts).
export const requireStaff = requireRole(...STAFF_ROLES);
