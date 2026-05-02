import type { DirectiveType, RiskLevel, Directive } from '../types';

/**
 * Directive domain utilities for CourtAction AI
 * Business logic for directive classification and analysis
 */

export const DIRECTIVE_TYPE_LABELS: Record<DirectiveType, string> = {
  compliance: 'Compliance',
  appeal: 'Appeal',
  review: 'Review',
  reinstatement: 'Reinstatement',
  compensation: 'Compensation',
  policy_amendment: 'Policy Amendment',
  administrative_action: 'Administrative Action',
  escalation: 'Escalation',
  stay_order: 'Stay Order',
};

export const DIRECTIVE_TYPE_COLORS: Record<DirectiveType, string> = {
  compliance: 'bg-blue-100 text-blue-800 border-blue-200',
  appeal: 'bg-orange-100 text-orange-800 border-orange-200',
  review: 'bg-purple-100 text-purple-800 border-purple-200',
  reinstatement: 'bg-green-100 text-green-800 border-green-200',
  compensation: 'bg-amber-100 text-amber-800 border-amber-200',
  policy_amendment: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  administrative_action: 'bg-slate-100 text-slate-800 border-slate-200',
  escalation: 'bg-red-100 text-red-800 border-red-200',
  stay_order: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export function getDirectiveLabel(type: DirectiveType): string {
  return DIRECTIVE_TYPE_LABELS[type];
}

export function getDirectiveColor(type: DirectiveType): string {
  return DIRECTIVE_TYPE_COLORS[type];
}

export function getRiskLevelColor(risk: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-amber-600 bg-amber-50',
    high: 'text-red-600 bg-red-50',
  };
  return colors[risk];
}

export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 85) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

export function sortDirectivesByRisk(directives: Directive[]): Directive[] {
  const riskOrder: Record<RiskLevel, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  return [...directives].sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
}

export function filterDirectivesByType(directives: Directive[], type: DirectiveType): Directive[] {
  return directives.filter((d) => d.type === type);
}
