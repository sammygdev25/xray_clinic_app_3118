import { Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth';

// ─── Validation Schemas ──────────────────────────────────────────────

const createReportSchema = z.object({
  examId: z.number().int().positive(),
  content: z.string().min(1, 'Report content is required'),
});

const updateReportSchema = z.object({
  content: z.string().min(1, 'Report content is required'),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ─── Exam Queue ──────────────────────────────────────────────────────
// Exams that are completed (or scheduled) and do not yet have a report attached,
// so a radiologist can pick the next exam to write up.

export async function getExamQueue(req: AuthRequest, res: Response) {
  try {
    const exams = await prisma.exam.findMany({
      where: {
        reports: { none: {} },
        status: { in: ['scheduled', 'completed'] },
      },
      include: {
        patient: {
          select: { id: true, username: true, email: true },
        },
        room: true,
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });
    res.json(exams);
  } catch (error) {
    console.error('[Reporting] Error fetching exam queue:', error);
    res.status(500).json({ error: 'Failed to fetch exam queue' });
  }
}

// ─── Reports ─────────────────────────────────────────────────────────

export async function listReports(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let where = {};
    if (user.role === 'radiologist') {
      where = { radiologistId: user.id };
    } else if (user.role === 'patient') {
      where = { exam: { patientId: user.id } };
    }
    // receptionist (and any other staff) can see all reports

    const reports = await prisma.report.findMany({
      where,
      include: {
        exam: {
          include: {
            patient: { select: { id: true, username: true, email: true } },
            room: true,
          },
        },
        radiologist: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    console.error('[Reporting] Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

export async function getReportById(req: AuthRequest, res: Response) {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        exam: {
          include: {
            patient: { select: { id: true, username: true, email: true } },
            room: true,
          },
        },
        radiologist: { select: { id: true, username: true, email: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'patient' && report.exam.patientId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to view this report' });
    }
    if (user.role === 'radiologist' && report.radiologistId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to view this report' });
    }

    res.json(report);
  } catch (error) {
    console.error('[Reporting] Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
}

export async function createReport(req: AuthRequest, res: Response) {
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
      return res.status(409).json({ error: 'A report already exists for this exam' });
    }

    const report = await prisma.report.create({
      data: {
        examId: parsed.data.examId,
        content: parsed.data.content,
        radiologistId: req.userId as number,
      },
      include: {
        exam: {
          include: {
            patient: { select: { id: true, username: true, email: true } },
            room: true,
          },
        },
        radiologist: { select: { id: true, username: true, email: true } },
      },
    });

    if (exam.status === 'scheduled') {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { status: 'completed' },
      });
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('[Reporting] Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
}

export async function updateReport(req: AuthRequest, res: Response) {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }

  const parsed = updateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }

  try {
    const existing = await prisma.report.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (existing.radiologistId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this report' });
    }

    const report = await prisma.report.update({
      where: { id: parsedParams.data.id },
      data: { content: parsed.data.content },
      include: {
        exam: {
          include: {
            patient: { select: { id: true, username: true, email: true } },
            room: true,
          },
        },
        radiologist: { select: { id: true, username: true, email: true } },
      },
    });

    res.json(report);
  } catch (error) {
    console.error('[Reporting] Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
}
