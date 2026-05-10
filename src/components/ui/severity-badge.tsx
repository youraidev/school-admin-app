import * as React from 'react';
import { cn } from '../../lib/utils';
import type { AllergySeverity } from '../../../shared/types';

interface SeverityBadgeProps {
    severity: AllergySeverity;
    children: React.ReactNode;
    className?: string;
}

const severityStyles: Record<AllergySeverity, string> = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    'life-threatening': 'bg-destructive/10 text-destructive border-destructive/20',
};

const severityIcons: Record<AllergySeverity, string> = {
    low: '🟢',
    medium: '🟡',
    'life-threatening': '🔴',
};

export function SeverityBadge({ severity, children, className }: SeverityBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                severityStyles[severity],
                className
            )}
        >
            <span>{severityIcons[severity]}</span>
            {children}
        </span>
    );
}
