import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole, type AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

const createDirectiveSchema = z.object({
  caseId: z.string().uuid(),
  type: z.enum(['compliance', 'appeal', 'review', 'reinstatement', 'compensation', 'policy_amendment', 'administrative_action', 'escalation', 'stay_order']),
  content: z.string().min(1),
  confidenceScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high']),
  responsibleDepartment: z.string().min(1),
  sourceReferences: z.array(z.object({
    pageNumber: z.number(),
    paragraphNumber: z.number(),
    snippet: z.string(),
    highlightStart: z.number().optional(),
    highlightEnd: z.number().optional(),
  })).optional(),
});

const updateDirectiveSchema = z.object({
  content: z.string().min(1).optional(),
  type: z.enum(['compliance', 'appeal', 'review', 'reinstatement', 'compensation', 'policy_amendment', 'administrative_action', 'escalation', 'stay_order']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  responsibleDepartment: z.string().min(1).optional(),
});

const verifyDirectiveSchema = z.object({
  verified: z.boolean(),
  notes: z.string().optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { caseId, type, verified } = req.query;

    const where: Record<string, unknown> = {};

    if (caseId) {
      where.caseId = caseId as string;
    }

    if (type) {
      where.type = type;
    }

    if (verified !== undefined) {
      where.verified = verified === 'true';
    }

    const directives = await prisma.directive.findMany({
      where,
      include: {
        case: { select: { caseNumber: true, department: true } },
        sourceReferences: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = directives.filter((d) => {
      if (req.user!.role === 'DEPARTMENT_OFFICER') {
        return d.case.department === req.user!.department;
      }
      return true;
    });

    res.json({ directives: filtered });
  } catch (error) {
    console.error('Get directives error:', error);
    res.status(500).json({ error: 'Failed to fetch directives' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const directive = await prisma.directive.findUnique({
      where: { id: req.params.id },
      include: {
        case: { select: { caseNumber: true, department: true, court: true } },
        sourceReferences: true,
      },
    });

    if (!directive) {
      return res.status(404).json({ error: 'Directive not found' });
    }

    if (req.user!.role === 'DEPARTMENT_OFFICER' && directive.case.department !== req.user!.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ directive });
  } catch (error) {
    console.error('Get directive error:', error);
    res.status(500).json({ error: 'Failed to fetch directive' });
  }
});

router.post('/', authenticate, requireRole('ADMIN', 'LEGAL_REVIEWER'), async (req: AuthRequest, res) => {
  try {
    const { caseId, type, content, confidenceScore, riskLevel, responsibleDepartment, sourceReferences } = createDirectiveSchema.parse(req.body);

    const directive = await prisma.directive.create({
      data: {
        caseId,
        type,
        content,
        confidenceScore,
        riskLevel,
        responsibleDepartment,
        sourceReferences: sourceReferences ? {
          create: sourceReferences,
        } : undefined,
      },
      include: {
        sourceReferences: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId,
        userId: req.user!.id,
        action: 'processed',
        notes: `Directive extracted with ${confidenceScore}% confidence`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({ directive });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create directive error:', error);
    res.status(500).json({ error: 'Failed to create directive' });
  }
});

router.patch('/:id', authenticate, requireRole('ADMIN', 'LEGAL_REVIEWER'), async (req: AuthRequest, res) => {
  try {
    const updates = updateDirectiveSchema.parse(req.body);

    const directive = await prisma.directive.update({
      where: { id: req.params.id },
      data: updates,
      include: {
        sourceReferences: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: directive.caseId,
        userId: req.user!.id,
        action: 'edited',
        notes: `Directive updated`,
        ipAddress: req.ip,
      },
    });

    res.json({ directive });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update directive error:', error);
    res.status(500).json({ error: 'Failed to update directive' });
  }
});

router.post('/:id/verify', authenticate, requireRole('ADMIN', 'LEGAL_REVIEWER'), async (req: AuthRequest, res) => {
  try {
    const { verified, notes } = verifyDirectiveSchema.parse(req.body);

    const directive = await prisma.directive.update({
      where: { id: req.params.id },
      data: {
        verified,
        verificationNotes: notes,
        verifiedAt: new Date(),
        verifiedById: req.user!.id,
      },
      include: {
        sourceReferences: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: directive.caseId,
        userId: req.user!.id,
        action: verified ? 'approved' : 'rejected',
        notes: notes || `Directive ${verified ? 'approved' : 'rejected'}`,
        ipAddress: req.ip,
      },
    });

    res.json({ directive });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Verify directive error:', error);
    res.status(500).json({ error: 'Failed to verify directive' });
  }
});

export default router;
