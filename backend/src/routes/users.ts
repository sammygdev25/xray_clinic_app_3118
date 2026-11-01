import { Router, Request, Response } from 'express';
import prisma from '../database';
import { authMiddleware, requireStaff } from '../middleware/auth';

const router = Router();
const ROLE_RE = /^[a-z][a-z0-9_]{0,31}$/;

// GET /api/users/?role=patient (staff only, scaffold-owned): the people staff schedule, bill and report on. Only these
// fields leave the server, never a password hash or a token.
router.get('/', authMiddleware, requireStaff, async (req: Request, res: Response) => {
  try {
    const role = typeof req.query.role === 'string' && ROLE_RE.test(req.query.role) ? req.query.role : undefined;
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: { id: true, username: true, email: true, firstName: true, lastName: true, role: true },
      orderBy: { id: 'asc' },
      take: 500,
    });
    res.json(users.map((u) => ({
      id: u.id, username: u.username, email: u.email, first_name: u.firstName, last_name: u.lastName, role: u.role,
    })));
  } catch (error) {
    console.error('[Users] List error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

export default router;
