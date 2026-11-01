import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const createReportSchema = z.object({
  examId: z.number().int().positive(),
  content: z.string().min(1, 'Report content is required'),
});

const listQuerySchema = z.object({
  examId: z.coerce.number().int().positive().optional(),
});

// GET /api/reports/ - radiologists see their own reports, patients see reports on their
// own exams, receptionists/other staff see everything (for coordinating invoices/scheduling).
router.get('/', authMiddleware, requireRole('patient', 'radiologist'), async (req: AuthRequest, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: parsed.error.issues });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const where: any = {};
    if (parsed.data.examId) {
      where.examId = parsed.data.examId;
    }

    if (user.role === 'radiologist') {
      where.radiologistId = req.userId;
    } else if (user.role === 'patient') {
      where.exam = { patientId: req.userId };
    }
    // receptionists (and any other staff role) can see all reports

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        exam: true,
        radiologist: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
    });

    res.json(reports);
  } catch (error) {
    console.error('[Reporting] Error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/reports/ - radiologists author a report for a completed/scheduled exam.
router.post('/', authMiddleware, requireRole('radiologist'), async (req: AuthRequest, res: Response) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }

  try {
    const exam = await prisma.exam.findUnique({ where: { id: parsed.data.examId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const existing = await prisma.report.findFirst({ where: { examId: parsed.data.examId } });
    if (existing) {
      return res.status(400).json({ error: 'This exam already has a report' });
    }

    const report = await prisma.report.create({
      data: {
        examId: parsed.data.examId,
        content: parsed.data.content,
        radiologistId: req.userId!,
      },
      include: {
        exam: true,
        radiologist: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('[Reporting] Error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

export default router;