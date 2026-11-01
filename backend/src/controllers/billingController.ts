import { Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth';

const createInvoiceSchema = z.object({
  examId: z.number().int().positive(),
  amount: z.number().positive(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// GET /api/invoices/
// Patients see only their own invoices (billed exams); receptionists and
// radiologists can see every invoice for billing/administration purposes.
export const listInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where = user.role === 'patient' ? { patientId: req.userId } : {};

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        exam: {
          include: {
            room: true,
          },
        },
        patient: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    res.json(invoices);
  } catch (error) {
    console.error('[Billing] Error listing invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// POST /api/invoices/
// Receptionists create an invoice for a scheduled or completed X-ray exam;
// the patient billed is derived from the exam, never from the request body.
export const createInvoice = async (req: AuthRequest, res: Response) => {
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
        examId: exam.id,
        patientId: exam.patientId,
        amount: parsed.data.amount,
        status: 'pending',
      },
      include: {
        exam: {
          include: {
            room: true,
          },
        },
        patient: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('[Billing] Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// GET /api/invoices/:id
// Returns a single invoice; patients may only view their own.
export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        exam: {
          include: {
            room: true,
          },
        },
        patient: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (user.role === 'patient' && invoice.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('[Billing] Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};