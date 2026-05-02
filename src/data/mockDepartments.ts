import type { Department, GovernanceMetrics } from '../types';

export const mockDepartments: Department[] = [
  {
    id: 'dept-001',
    name: 'Revenue Department',
    overdueCount: 12,
    totalCases: 45,
    avgDaysOverdue: 18,
    riskLevel: 'critical',
  },
  {
    id: 'dept-002',
    name: 'Labor Department',
    overdueCount: 7,
    totalCases: 32,
    avgDaysOverdue: 12,
    riskLevel: 'high',
  },
  {
    id: 'dept-003',
    name: 'Environmental Agency',
    overdueCount: 3,
    totalCases: 18,
    avgDaysOverdue: 8,
    riskLevel: 'medium',
  },
  {
    id: 'dept-004',
    name: 'Tax Department',
    overdueCount: 5,
    totalCases: 28,
    avgDaysOverdue: 10,
    riskLevel: 'high',
  },
  {
    id: 'dept-005',
    name: 'Housing Authority',
    overdueCount: 1,
    totalCases: 15,
    avgDaysOverdue: 4,
    riskLevel: 'low',
  },
  {
    id: 'dept-006',
    name: 'Transport Department',
    overdueCount: 2,
    totalCases: 22,
    avgDaysOverdue: 6,
    riskLevel: 'medium',
  },
];

export const mockGovernanceMetrics: GovernanceMetrics = {
  pendingCompliance: 24,
  upcomingDeadlines: 12,
  appealQueue: 8,
  avgProcessingTime: 4.2,
  criticalAlerts: 5,
};

export function getDepartmentById(id: string): Department | undefined {
  return mockDepartments.find((d) => d.id === id);
}

export function getHighRiskDepartments(): Department[] {
  return mockDepartments.filter((d) => d.riskLevel === 'critical' || d.riskLevel === 'high');
}

export function getTotalOverdueCount(): number {
  return mockDepartments.reduce((sum, d) => sum + d.overdueCount, 0);
}
