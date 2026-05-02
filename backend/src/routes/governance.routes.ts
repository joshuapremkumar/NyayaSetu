import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

function calculateDaysRemaining(dueDate: Date): number {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

router.get('/metrics', authenticate, async (_req: AuthRequest, res) => {
  try {
    const [totalCases, pendingCompliance, upcomingDeadlines, appealQueue, criticalAlerts] = await Promise.all([
      prisma.case.count(),
      prisma.directive.count({ where: { type: 'compliance', verified: false } }),
      prisma.deadline.count({
        where: {
          completed: false,
          daysRemaining: { lte: 14, gt: 0 },
        },
      }),
      prisma.directive.count({ where: { type: 'appeal', verified: false } }),
      prisma.deadline.count({
        where: {
          completed: false,
          urgency: 'critical',
        },
      }),
    ]);

    const verifiedCases = await prisma.case.findMany({
      where: { status: 'verified' },
      select: { uploadedAt: true },
    });

    let avgProcessingTime = 0;
    if (verifiedCases.length > 0) {
      const totalDays = verifiedCases.reduce((sum, c) => {
        const uploaded = new Date(c.uploadedAt);
        const now = new Date();
        const diff = Math.abs(now.getTime() - uploaded.getTime());
        return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
      }, 0);
      avgProcessingTime = Math.round(totalDays / verifiedCases.length * 10) / 10;
    }

    res.json({
      metrics: {
        totalCases,
        pendingCompliance,
        upcomingDeadlines,
        appealQueue,
        avgProcessingTime,
        criticalAlerts,
      },
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/departments', authenticate, async (req: AuthRequest, res) => {
  try {
    const cases = await prisma.case.groupBy({
      by: ['department'],
      _count: { id: true },
    });

    const departments = await Promise.all(
      cases.map(async (c) => {
        const [overdueDeadlines, avgOverdueDays] = await Promise.all([
          prisma.deadline.count({
            where: {
              case: { department: c.department },
              completed: false,
              daysRemaining: { lt: 0 },
            },
          }),
          prisma.deadline.aggregate({
            where: {
              case: { department: c.department },
              completed: false,
              daysRemaining: { lt: 0 },
            },
            _avg: { daysRemaining: true },
          }),
        ]);

        const avgDaysOverdue = avgOverdueDays._avg.daysRemaining
          ? Math.abs(Math.round(avgOverdueDays._avg.daysRemaining))
          : 0;

        let riskLevel = 'low';
        if (overdueDeadlines >= 10 || avgDaysOverdue >= 30) riskLevel = 'critical';
        else if (overdueDeadlines >= 5 || avgDaysOverdue >= 14) riskLevel = 'high';
        else if (overdueDeadlines >= 2 || avgDaysOverdue >= 7) riskLevel = 'medium';

        return {
          id: c.department.toLowerCase().replace(/\s+/g, '-'),
          name: c.department,
          overdueCount: overdueDeadlines,
          totalCases: c._count.id,
          avgDaysOverdue,
          riskLevel,
        };
      })
    );

    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.get('/directive-distribution', authenticate, async (_req: AuthRequest, res) => {
  try {
    const distribution = await prisma.directive.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    const result = distribution.map((d) => ({
      name: d.type,
      value: d._count.id,
    }));

    res.json({ distribution: result });
  } catch (error) {
    console.error('Get directive distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch directive distribution' });
  }
});

router.get('/case-aging', authenticate, async (_req: AuthRequest, res) => {
  try {
    const cases = await prisma.case.findMany({
      select: { uploadedAt: true, status: true },
    });

    const buckets = { '0-7d': 0, '8-14d': 0, '15-30d': 0, '30+d': 0 };

    cases.forEach((c) => {
      const uploaded = new Date(c.uploadedAt);
      const now = new Date();
      const days = Math.ceil(Math.abs(now.getTime() - uploaded.getTime()) / (1000 * 60 * 60 * 24));

      if (days <= 7) buckets['0-7d']++;
      else if (days <= 14) buckets['8-14d']++;
      else if (days <= 30) buckets['15-30d']++;
      else buckets['30+d']++;
    });

    const result = Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));

    res.json({ aging: result });
  } catch (error) {
    console.error('Get case aging error:', error);
    res.status(500).json({ error: 'Failed to fetch case aging' });
  }
});

export default router;
