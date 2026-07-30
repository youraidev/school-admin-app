import * as React from 'react';
import { cn } from '../../lib/utils';
import { Minus, AlertTriangle, Zap } from 'lucide-react';
import type { AllergySeverity } from '../../../shared/types';

interface SeverityBadgeProps {
    severity: AllergySeverity;
    children: React.ReactNode;
    className?: string;
}

const severityConfig: Record<AllergySeverity, {
    badge: string;
    icon: React.ReactNode;
    dot: string;
}> = {
    low: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
        icon: <Minus className="w-3 h-3" />,
        dot: 'bg-emerald-500',
    },
    medium: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50',
        icon: <AlertTriangle className="w-3 h-3" />,
        dot: 'bg-amber-500',
    },
    'life-threatening': {
        badge: 'bg-red-50 text-red-700 border-red-200/70 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50',
        icon: <Zap className="w-3 h-3" />,
        dot: 'bg-red-500',
    },
};

export function SeverityBadge({ severity, children, className }: SeverityBadgeProps) {
    const config = severityConfig[severity];
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                config.badge,
                className
            )}
        >
            {config.icon}
            {children}
        </span>
    );
}

export function SeverityDot({ severity }: { severity: AllergySeverity }) {
    return (
        <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', severityConfig[severity].dot)} />
    );
}
