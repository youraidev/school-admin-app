import * as React from 'react';
import { Card, CardContent } from '../ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    className?: string;
}

export default function StatCard({ title, value, icon: Icon, className }: StatCardProps) {
    return (
        <Card className={cn('card-elevated', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="data-label mb-1">{title}</p>
                        <p className="text-3xl font-semibold tracking-tight">{value}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
