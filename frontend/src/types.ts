/**
 * Auto-generated TypeScript types and Zod schemas from ProjectContract.
 * Model interfaces match the Django backend exactly.
 */
import { z } from 'zod';

// DRF returns a related object either as its pk or nested; parse both to the pk
// so the parsed type matches the number typed FK fields on the interfaces.
const zRelation = z.union([z.coerce.number().int(), z.object({ id: z.coerce.number().int() }).passthrough()]).transform((v) => (typeof v === 'number' ? v : v.id));

// ── User ──
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  exams?: Exam[];
  reports?: Report[];
  invoices?: Invoice[];
}

export const UserSchema = z.object({
  id: z.coerce.number(),
  username: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Room ──
export interface Room {
  id: number;
  name: string;
  roomNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  exams?: Exam[];
}

export const RoomSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  roomNumber: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Exam ──
export interface Exam {
  id: number;
  patient?: User;
  patientId: number;
  bodyPart: string;
  room?: Room;
  roomId: number;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reports?: Report[];
  invoices?: Invoice[];
}

export const ExamSchema = z.object({
  id: z.coerce.number(),
  patient: z.custom<User>((v) => typeof v === 'object' && v !== null).optional(),
  patientId: z.coerce.number().int(),
  bodyPart: z.string(),
  room: z.custom<Room>((v) => typeof v === 'object' && v !== null).optional(),
  roomId: z.coerce.number().int(),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Report ──
export interface Report {
  id: number;
  exam?: Exam;
  examId: number;
  radiologist?: User;
  radiologistId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const ReportSchema = z.object({
  id: z.coerce.number(),
  exam: z.custom<Exam>((v) => typeof v === 'object' && v !== null).optional(),
  examId: z.coerce.number().int(),
  radiologist: z.custom<User>((v) => typeof v === 'object' && v !== null).optional(),
  radiologistId: z.coerce.number().int(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Invoice ──
export interface Invoice {
  id: number;
  patient?: User;
  patientId: number;
  exam?: Exam;
  examId: number;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const InvoiceSchema = z.object({
  id: z.coerce.number(),
  patient: z.custom<User>((v) => typeof v === 'object' && v !== null).optional(),
  patientId: z.coerce.number().int(),
  exam: z.custom<Exam>((v) => typeof v === 'object' && v !== null).optional(),
  examId: z.coerce.number().int(),
  amount: z.coerce.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Paginated Response ──
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: z.coerce.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });

