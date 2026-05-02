import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

const createDeadlineSchema = z.object({
  caseId: z.string().uuid(),
  type: z.enum(['compliance', 'appeal', 'escalation']),
  dueDate: z.string().datetime().or(z.string().date()),
  urgency: z.enum(['critical', 'warning', 'normal']),
});

const updateDeadlineSchema = z.object({
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().or(z.string().date()).optional(),
  urgency: z.enum(['critical', 'warning', 'normal']).optional(),
});

function calculateDaysRemaining(dueDate: Date): number {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { caseId, urgency, completed } = req.query;

    const where: Record<string, unknown> = {};

    if (caseId) {
      where.caseId = caseId as string;
    }

    if (urgency) {
      where.urgency = urgency;
    }

    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    const deadlines = await prisma.deadline.findMany({
      where,
      include: {
        case: { select: { caseNumber: true, department: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const filtered = deadlines.filter((d) => {
      if (req.user!.role === 'DEPARTMENT_OFFICER') {
        return d.case.department === req.user!.department;
      }
      return true;
    });

    const withDaysRemaining = filtered.map((d) => ({
      ...d,
      daysRemaining: calculateDaysRemaining(d.dueDate),
    }));

    res.json({ deadlines: withDaysRemaining });
  } catch (error) {
    console.error('Get deadlines error:', error);
    res.status(500).json({ error: 'Failed to fetch deadlines' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { caseId, type, dueDate, urgency } = createDeadlineSchema.parse(req.body);

    const dueDateObj = new Date(dueDate);
    const daysRemaining = calculateDaysRemaining(dueDateObj);

    const deadline = await prisma.deadline.create({
      data: {
        caseId,
        type,
        dueDate: dueDateObj,
        daysRemaining,
        urgency,
      },
      include: {
        case: { select: { caseNumber: true } },
      },
    });

    res.status(201).json({ deadline });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create deadline error:', error);
    res.status(500).json({ error: 'Failed to create deadline' });
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const updates = updateDeadlineSchema.parse(req.body);

    const deadline = await prisma.deadline.findUnique({
      where: { id: req.params.id },
      include: { case: { select: { department: true } } },
    });

    if (!deadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }

    if (req.user!.role === 'DEPARTMENT_OFFICER' && deadline.case.department !== req.user!.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data: Record<string, unknown> = {};

    if (updates.completed !== undefined) {
      data.completed = updates.completed;
      if (updates.completed) {
        data.completedAt = new Date();
      }
    }

    if (updates.dueDate) {
      const dueDateObj = new Date(updates.dueDate);
      data.dueDate = dueDateObj;
      data.daysRemaining = calculateDaysRemaining(dueDateObj);
    }

    if (updates.urgency) {
      data.urgency = updates.urgency;
    }

    const updatedDeadline = await prisma.deadline.update({
      where: { id: req.params.id },
      data,
      include: { case: { select: { caseNumber: true } } },
    });

    res.json({ deadline: updatedDeadline });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update deadline error:', error);
    res.status(500).json({ error: 'Failed to update deadline' });
  }
});

export default router;
