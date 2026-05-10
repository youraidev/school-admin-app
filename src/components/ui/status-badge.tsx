import * as React from 'react';
import { cn } from '../../lib/utils';
import type { ContractStatus } from '../../../shared/types';

type StatusVariant = 'active' | 'pending' | 'expired' | 'terminated' | 'info' | 'signed';

interface StatusBadgeProps {
    variant: StatusVariant | ContractStatus;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
    active: 'bg-success/10 text-success border-success/20',
    signed: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
    terminated: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-info/10 text-info border-info/20',
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                variantStyles[variant as StatusVariant],
                className
            )}
        >
            {children}
        </span>
    );
}
