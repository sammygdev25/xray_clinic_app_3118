import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const createInvoiceSchema = z.object({
  examId: z.number().int().positive(),
  amount: z.number().nonnegative(),
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
});

// GET /api/invoices/ - patients see only their own invoices, staff see all
router.get('/', authMiddleware, requireRole('patient', 'receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const where = user.role === 'patient' ? { patientId: user.id } : {};

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, username: true, email: true } },
        exam: { select: { id: true, bodyPart: true, scheduledDate: true, scheduledTime: true, status: true } },
      },
    });

    res.json(invoices);
  } catch (error) {
    console.error('[Billing] Error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/invoices/ (receptionist only)
router.post('/', authMiddleware, requireRole('receptionist'), async (req: AuthRequest, res: Response) => {
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }

  try {
    const exam = await prisma.exam.findUnique({ where: { id: parsed.data.examId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        patientId: exam.patientId,
        examId: exam.id,
        amount: parsed.data.amount,
        status: parsed.data.status ?? 'pending',
      },
      include: {
        patient: { select: { id: true, username: true, email: true } },
        exam: { select: { id: true, bodyPart: true, scheduledDate: true, scheduledTime: true, status: true } },
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('[Billing] Error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router;