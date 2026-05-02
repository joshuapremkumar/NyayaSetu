import type { Department, DepartmentRiskLevel, Deadline, DeadlineUrgency, Case } from '../types';

/**
 * Governance domain utilities for CourtAction AI
 * Business logic for executive oversight and compliance tracking
 */

export function calculateDepartmentRisk(overdueCount: number, avgDaysOverdue: number): DepartmentRiskLevel {
  if (overdueCount >= 10 || avgDaysOverdue >= 30) return 'critical';
  if (overdueCount >= 5 || avgDaysOverdue >= 14) return 'high';
  if (overdueCount >= 2 || avgDaysOverdue >= 7) return 'medium';
  return 'low';
}

export function getDepartmentRiskColor(risk: DepartmentRiskLevel): string {
  const colors: Record<DepartmentRiskLevel, string> = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  };
  return colors[risk];
}

export function getDeadlineUrgency(daysRemaining: number): DeadlineUrgency {
  if (daysRemaining <= 3) return 'critical';
  if (daysRemaining <= 7) return 'warning';
  return 'normal';
}

export function getDeadlineUrgencyColor(urgency: DeadlineUrgency): string {
  const colors: Record<DeadlineUrgency, string> = {
    critical: 'text-red-600 bg-red-50',
    warning: 'text-amber-600 bg-amber-50',
    normal: 'text-green-600 bg-green-50',
  };
  return colors[urgency];
}

export function sortDepartmentsByRisk(departments: Department[]): Department[] {
  const riskOrder: Record<DepartmentRiskLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...departments].sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
}

export function sortDeadlinesByUrgency(deadlines: Deadline[]): Deadline[] {
  return [...deadlines].sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getCriticalDeadlines(deadlines: Deadline[]): Deadline[] {
  return deadlines.filter((d) => d.daysRemaining <= 3);
}

export function getOverdueCases(cases: Case[], maxDays: number = 14): Case[] {
  const now = new Date();
  return cases.filter((c) => {
    const uploaded = new Date(c.uploadedAt);
    const diffTime = Math.abs(now.getTime() - uploaded.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > maxDays && c.status !== 'verified';
  });
}

export function calculateAverageProcessingTime(cases: Case[]): number {
  const verifiedCases = cases.filter((c) => c.status === 'verified');
  if (verifiedCases.length === 0) return 0;
  
  const totalDays = verifiedCases.reduce((sum, c) => {
    const uploaded = new Date(c.uploadedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - uploaded.getTime());
    return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, 0);
  
  return Math.round(totalDays / verifiedCases.length);
}
