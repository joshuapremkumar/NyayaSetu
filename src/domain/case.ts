import type { Case, CaseStatus, CasePriority } from '../types';

/**
 * Case domain utilities for CourtAction AI
 * Business logic for case management operations
 */

export function getCaseStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    pending: 'Pending Review',
    processing: 'AI Processing',
    verified: 'Verified',
    rejected: 'Rejected',
  };
  return labels[status];
}

export function getCasePriorityColor(priority: CasePriority): string {
  const colors: Record<CasePriority, string> = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-green-600 bg-green-50',
  };
  return colors[priority];
}

export function sortCasesByPriority(cases: Case[]): Case[] {
  const priorityOrder: Record<CasePriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  return [...cases].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function filterCasesByStatus(cases: Case[], status: CaseStatus): Case[] {
  return cases.filter((c) => c.status === status);
}

export function filterCasesByDepartment(cases: Case[], department: string): Case[] {
  return cases.filter((c) => c.department === department);
}

export function getCaseAge(uploadedAt: string): number {
  const uploaded = new Date(uploadedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - uploaded.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isCaseOverdue(case_: Case, maxDays: number = 14): boolean {
  return getCaseAge(case_.uploadedAt) > maxDays;
}
