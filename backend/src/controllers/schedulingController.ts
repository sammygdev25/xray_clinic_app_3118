import { Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth';

// ---------- Validation Schemas ----------

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  roomNumber: z.string().min(1, 'Room number is required').max(20),
  isActive: z.boolean().optional(),
});

const updateRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  roomNumber: z.string().min(1).max(20).optional(),
  isActive: z.boolean().optional(),
});

const examStatusEnum = z.enum(['scheduled', 'completed', 'cancelled']);

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const createExamSchema = z.object({
  patientId: z.number().int().positive(),
  bodyPart: z.string().min(1, 'Body part is required').max(100),
  roomId: z.number().int().positive(),
  scheduledDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: 'scheduledDate must be a valid date',
  }),
  scheduledTime: z.string().regex(timeRegex, 'scheduledTime must be HH:MM'),
  status: examStatusEnum.optional(),
});

const updateExamSchema = z.object({
  bodyPart: z.string().min(1).max(100).optional(),
  roomId: z.number().int().positive().optional(),
  scheduledDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: 'scheduledDate must be a valid date',
    })
    .optional(),
  scheduledTime: z.string().regex(timeRegex, 'scheduledTime must be HH:MM').optional(),
  status: examStatusEnum.optional(),
});

// ---------- Helpers ----------

async function getRequesterRole(userId: number | undefined): Promise<string | null> {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

const userSummarySelect = {
  id: true,
  username: true,
  email: true,
  role: true,
};

// ---------- Room Controller Functions ----------

export async function listRooms(req: AuthRequest, res: Response) {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(rooms);
  } catch (error) {
    console.error('[Scheduling] Error listing rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
}

export async function createRoom(req: AuthRequest, res: Response) {
  try {
    const role = await getRequesterRole(req.userId);
    if (role !== 'receptionist') {
      return res.status(403).json({ error: 'Only receptionists can create rooms' });
    }

    const parsed = createRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }

    const room = await prisma.room.create({
      data: {
        name: parsed.data.name,
        roomNumber: parsed.data.roomNumber,
        isActive: parsed.data.isActive ?? true,
      },
    });
    res.status(201).json(room);
  } catch (error) {
    console.error('[Scheduling] Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
}

export async function updateRoom(req: AuthRequest, res: Response) {
  try {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: paramsParsed.error.issues });
    }

    const role = await getRequesterRole(req.userId);
    if (role !== 'receptionist') {
      return res.status(403).json({ error: 'Only receptionists can update rooms' });
    }

    const parsed = updateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }

    const existing = await prisma.room.findUnique({ where: { id: paramsParsed.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = await prisma.room.update({
      where: { id: paramsParsed.data.id },
      data: parsed.data,
    });
    res.json(room);
  } catch (error) {
    console.error('[Scheduling] Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
}

export async function deleteRoom(req: AuthRequest, res: Response) {
  try {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: paramsParsed.error.issues });
    }

    const role = await getRequesterRole(req.userId);
    if (role !== 'receptionist') {
      return res.status(403).json({ error: 'Only receptionists can delete rooms' });
    }

    const existing = await prisma.room.findUnique({ where: { id: paramsParsed.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await prisma.room.delete({ where: { id: paramsParsed.data.id } });
    res.status(204).send();
  } catch (error) {
    console.error('[Scheduling] Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
}

// ---------- Exam Controller Functions ----------

export async function listExams(req: AuthRequest, res: Response) {
  try {
    const role = await getRequesterRole(req.userId);

    const where = role === 'patient' ? { patientId: req.userId } : {};

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { scheduledDate: 'desc' },
      include: {
        patient: { select: userSummarySelect },
        room: true,
      },
    });
    res.json(exams);
  } catch (error) {
    console.error('[Scheduling] Error listing exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
}

export async function getExam(req: AuthRequest, res: Response) {
  try {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: paramsParsed.error.issues });
    }

    const role = await getRequesterRole(req.userId);

    const exam = await prisma.exam.findUnique({
      where: { id: paramsParsed.data.id },
      include: {
        patient: { select: userSummarySelect },
        room: true,
      },
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (role === 'patient' && exam.patientId !== req.userId) {
      return res.status(403).json({ error: 'You may only view your own exams' });
    }

    res.json(exam);
  } catch (error) {
    console.error('[Scheduling] Error fetching exam:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
}

export async function createExam(req: AuthRequest, res: Response) {
  try {
    const role = await getRequesterRole(req.userId);
    if (role !== 'receptionist') {
      return res.status(403).json({ error: 'Only receptionists can schedule exams' });
    }

    const parsed = createExamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }

    const [patient, room] = await Promise.all([
      prisma.user.findUnique({ where: { id: parsed.data.patientId } }),
      prisma.room.findUnique({ where: { id: parsed.data.roomId } }),
    ]);

    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ error: 'patientId must reference an existing patient' });
    }
    if (!room) {
      return res.status(400).json({ error: 'roomId must reference an existing room' });
    }

    const exam = await prisma.exam.create({
      data: {
        patientId: parsed.data.patientId,
        bodyPart: parsed.data.bodyPart,
        roomId: parsed.data.roomId,
        scheduledDate: new Date(parsed.data.scheduledDate),
        scheduledTime: parsed.data.scheduledTime,
        status: parsed.data.status ?? 'scheduled',
      },
      include: {
        patient: { select: userSummarySelect },
        room: true,
      },
    });
    res.status(201).json(exam);
  } catch (error) {
    console.error('[Scheduling] Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
}

export async function updateExam(req: AuthRequest, res: Response) {
  try {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: paramsParsed.error.issues });
    }

    const role = await getRequesterRole(req.userId);
    if (role !== 'receptionist') {
      return res.status(403).json({ error: 'Only receptionists can update exams' });
    }

    const parsed = updateExamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }

    const existing = await prisma.exam.findUnique({ where: { id: paramsParsed.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (parsed.data.roomId) {
      const room = await prisma.room.findUnique({ where: { id: parsed.data.roomId } });
      if (!room) {
        return res.status(400).json({ error: 'roomId must reference an existing room' });
      }
    }

    const exam = await prisma.exam.update({
      where: { id: paramsParsed.data.id },
      data: {
        ...(parsed.data.bodyPart !== undefined ? { bodyPart: parsed.data.bodyPart } : {}),
        ...(parsed.data.roomId !== undefined ? { roomId: parsed.data.roomId } : {}),
        ...(parsed.data.scheduledDate !== undefined ? { scheduledDate: new Date(parsed.data.scheduledDate) } : {}),
        ...(parsed.data.scheduledTime !== undefined ? { scheduledTime: parsed.data.scheduledTime } : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
      include: {
        patient: { select: userSummarySelect },
        room: true,
      },
    });
    res.json(exam);
  } catch (error) {
    console.error('[Scheduling] Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
}