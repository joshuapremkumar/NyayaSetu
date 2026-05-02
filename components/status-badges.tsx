'use client';

import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';

type StatusType = 'pending' | 'approved' | 'rejected' | 'warning' | 'processing';

const STATUS_CONFIG: Record<StatusType, { icon: ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    label: 'Pending',
  },
  approved: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    label: 'Approved',
  },
  rejected: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    label: 'Rejected',
  },
  warning: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    label: 'Warning',
  },
  processing: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
    label: 'Processing',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${config.color} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

interface RiskLevelBadgeProps {
  level: 'low' | 'medium' | 'high';
  className?: string;
}

export function RiskLevelBadge({ level, className = '' }: RiskLevelBadgeProps) {
  const config: Record<string, { color: string; label: string }> = {
    low: {
      color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      label: 'Low Risk',
    },
    medium: {
      color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      label: 'Medium Risk',
    },
    high: {
      color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      label: 'High Risk',
    },
  };

  const selectedConfig = config[level];

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${selectedConfig.color} ${className}`}>
      {selectedConfig.label}
    </div>
  );
}

interface ConfidenceScoreProps {
  score: number;
  className?: string;
}

export function ConfidenceScore({ score, className = '' }: ConfidenceScoreProps) {
  const percentage = Math.min(100, Math.max(0, score));
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-foreground font-medium">Confidence</span>
        <span className="font-semibold text-foreground">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
