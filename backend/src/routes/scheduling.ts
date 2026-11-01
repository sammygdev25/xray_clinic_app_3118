import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest, requireRole, requireStaff } from '../middleware/auth';

const router = Router();

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createRoomSchema = z.object({
  name: z.string().min(1),
  roomNumber: z.string().min(1),
  isActive: z.boolean().optional(),
});

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  roomNumber: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

const createExamSchema = z.object({
  patientId: z.number().int().positive(),
  bodyPart: z.string().min(1),
  roomId: z.number().int().positive(),
  scheduledDate: z.coerce.date(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:MM'),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const updateExamSchema = z.object({
  bodyPart: z.string().min(1).optional(),
  roomId: z.number().int().positive().optional(),
  scheduledDate: z.coerce.date().optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:MM').optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const examsQuerySchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  patientId: z.coerce.number().int().positive().optional(),
});

// GET /api/rooms/
router.get('/rooms', authMiddleware, requireStaff, async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const rooms = await prisma.room.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
    res.json(rooms);
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /api/rooms/
router.post('/rooms', authMiddleware, requireRole('receptionist'), async (req: AuthRequest, res: Response) => {
  const parsed = createRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const room = await prisma.room.create({
      data: {
        name: parsed.data.name,
        roomNumber: parsed.data.roomNumber,
        isActive: parsed.data.isActive ?? true,
      },
    });
    res.status(201).json(room);
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// PUT /api/rooms/:id
router.put('/rooms/:id', authMiddleware, requireRole('receptionist'), async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.room.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const room = await prisma.room.update({
      where: { id: parsedParams.data.id },
      data: parsed.data,
    });
    res.json(room);
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// DELETE /api/rooms/:id
router.delete('/rooms/:id', authMiddleware, requireRole('receptionist'), async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const existing = await prisma.room.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Room not found' });
    }
    await prisma.room.delete({ where: { id: parsedParams.data.id } });
    res.status(204).send();
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// GET /api/exams/
router.get('/exams', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsedQuery = examsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: parsedQuery.error.issues });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: Record<string, unknown> = {};
    if (parsedQuery.data.status) {
      where.status = parsedQuery.data.status;
    }

    if (user.role === 'patient') {
      where.patientId = user.id;
    } else if (parsedQuery.data.patientId) {
      where.patientId = parsedQuery.data.patientId;
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { scheduledDate: 'desc' },
      include: {
        patient: { select: { id: true, username: true, email: true, role: true } },
        room: true,
      },
    });
    res.json(exams);
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// GET /api/exams/:id
router.get('/exams/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        patient: { select: { id: true, username: true, email: true, role: true } },
        room: true,
      },
    });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    if (user.role === 'patient' && exam.patientId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(exam);
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// POST /api/exams/
router.post('/exams', authMiddleware, requireRole('receptionist'), async (req: AuthRequest, res: Response) => {
  const parsed = createExamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const patient = await prisma.user.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ error: 'Invalid patient' });
    }
    const room = await prisma.room.findUnique({ where: { id: parsed.data.roomId } });
    if (!room) {
      return res.status(400).json({ error: 'Invalid room' });
    }

    const exam = await prisma.exam.create({
      data: {
        patientId: parsed.data.patientId,
        bodyPart: parsed.data.bodyPart,
        roomId: parsed.data.roomId,
        scheduledDate: parsed.data.scheduledDate,
        scheduledTime: parsed.data.scheduledTime,
        status: parsed.data.status ?? 'scheduled',
      },
      include: {
        patient: { select: { id: true, username: true, email: true, role: true } },
        room: true,
      },
    });
    res.status(201).json(exam);
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// PATCH /api/exams/:id
router.patch('/exams/:id', authMiddleware, requireRole('receptionist'), requireStaff, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateExamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.exam.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (parsed.data.roomId) {
      const room = await prisma.room.findUnique({ where: { id: parsed.data.roomId } });
      if (!room) {
        return res.status(400).json({ error: 'Invalid room' });
      }
    }

    const data: Record<string, unknown> = {
      ...(parsed.data.bodyPart !== undefined ? { bodyPart: parsed.data.bodyPart } : {}),
      ...(parsed.data.roomId !== undefined ? { roomId: parsed.data.roomId } : {}),
      ...(parsed.data.scheduledDate !== undefined ? { scheduledDate: parsed.data.scheduledDate } : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    };
    if (parsed.data.scheduledTime !== undefined) {
      data.scheduledTime = parsed.data.scheduledTime;
    }

    const exam = await prisma.exam.update({
      where: { id: parsedParams.data.id },
      data,
      include: {
        patient: { select: { id: true, username: true, email: true, role: true } },
        room: true,
      },
    });
    res.json(exam);
  } catch (error) {
    console.error('[Scheduling] Error:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

export default router;
