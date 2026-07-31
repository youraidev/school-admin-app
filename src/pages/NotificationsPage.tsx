import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, FileText, FileSignature, AlertTriangle, Clock, Check, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { formatDate } from '../i18n/format';

type Priority = 'critical' | 'high' | 'medium' | 'low';
type NotificationType = 'document' | 'contract' | 'agreement' | 'medical';

// Mock titles/descriptions reference keys in the notifications namespace (mock.*)
type MockKey = 'medicalExpiringSoon' | 'medicalExpiring' | 'contractMissing' | 'agreementsMissing' | 'activityConsentMissing';

interface Notification {
    id: string;
    type: NotificationType;
    priority: Priority;
    contentKey: MockKey;
    student: string;
    studentId?: string;
    studentClass: string;
    daysRemaining?: number;
    createdAt: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'medical',
        priority: 'critical',
        contentKey: 'medicalExpiringSoon',
        student: 'Emma Johansson',
        studentClass: 'Grade 5A',
        daysRemaining: 7,
        createdAt: '2026-05-29T08:00:00Z',
        read: false,
    },
    {
        id: '2',
        type: 'medical',
        priority: 'high',
        contentKey: 'medicalExpiring',
        student: 'Lucas Petrovas',
        studentClass: 'Grade 4B',
        daysRemaining: 14,
        createdAt: '2026-05-29T07:45:00Z',
        read: false,
    },
    {
        id: '3',
        type: 'contract',
        priority: 'high',
        contentKey: 'contractMissing',
        student: 'Sofia Andersson',
        studentClass: 'Grade 3C',
        createdAt: '2026-05-28T14:20:00Z',
        read: false,
    },
    {
        id: '4',
        type: 'agreement',
        priority: 'high',
        contentKey: 'agreementsMissing',
        student: 'Sofia Andersson',
        studentClass: 'Grade 3C',
        createdAt: '2026-05-28T14:20:00Z',
        read: false,
    },
    {
        id: '5',
        type: 'medical',
        priority: 'medium',
        contentKey: 'medicalExpiring',
        student: 'Matas Kazlauskas',
        studentClass: 'Grade 6A',
        daysRemaining: 14,
        createdAt: '2026-05-27T10:00:00Z',
        read: true,
    },
    {
        id: '6',
        type: 'contract',
        priority: 'medium',
        contentKey: 'contractMissing',
        student: 'Matas Kazlauskas',
        studentClass: 'Grade 6A',
        createdAt: '2026-05-26T09:15:00Z',
        read: true,
    },
    {
        id: '7',
        type: 'agreement',
        priority: 'low',
        contentKey: 'activityConsentMissing',
        student: 'Lucas Petrovas',
        studentClass: 'Grade 4B',
        createdAt: '2026-05-25T16:30:00Z',
        read: true,
    },
];

const priorityConfig: Record<Priority, { color: string; bg: string; border: string; dot: string }> = {
    critical: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        dot: 'bg-red-500',
    },
    high: {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
    },
    medium: {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
    },
    low: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
    },
};

const typeIcon: Record<NotificationType, React.ReactNode> = {
    medical: <FileText className="w-4 h-4" />,
    contract: <FileSignature className="w-4 h-4" />,
    agreement: <FileSignature className="w-4 h-4" />,
    document: <FileText className="w-4 h-4" />,
};

function DaysChip({ days }: { days: number }) {
    const { t } = useTranslation('notifications');
    const urgent = days <= 7;
    return (
        <span className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
            urgent ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
        )}>
            <Clock className="w-3 h-3" />
            {t('daysRemaining', { count: days })}
        </span>
    );
}

type FilterTab = 'all' | 'unread' | 'critical' | 'high';

export default function NotificationsPage() {
    const { t } = useTranslation('notifications');
    const navigate = useNavigate();
    const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [activeTab, setActiveTab] = React.useState<FilterTab>('all');

    const unreadCount = notifications.filter(n => !n.read).length;
    const criticalCount = notifications.filter(n => n.priority === 'critical').length;
    const highCount = notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length;

    const filtered = notifications.filter(n => {
        if (activeTab === 'unread') return !n.read;
        if (activeTab === 'critical') return n.priority === 'critical';
        if (activeTab === 'high') return n.priority === 'critical' || n.priority === 'high';
        return true;
    });

    const markRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const dismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const tabs: { key: FilterTab; label: string; count?: number }[] = [
        { key: 'all', label: t('tabs.all'), count: notifications.length },
        { key: 'unread', label: t('tabs.unread'), count: unreadCount },
        { key: 'critical', label: t('tabs.critical'), count: criticalCount },
        { key: 'high', label: t('tabs.high') },
    ];

    return (
        <div className="relative">
        {/* Not implemented overlay */}
        <div className="absolute inset-0 z-10 rounded-xl flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] pointer-events-auto select-none"
             aria-label={t('comingSoon.aria')}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border border-border/60 bg-background/80 shadow-lg text-center max-w-sm">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground tracking-wide uppercase">{t('comingSoon.title')}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('comingSoon.description')}
                </p>
            </div>
        </div>
        <div className="space-y-6 pointer-events-none select-none opacity-60">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground text-balance">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
                        <Check className="w-4 h-4" />
                        {t('markAllRead')}
                    </Button>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: t('summary.total'), value: notifications.length, icon: <Bell className="w-4 h-4 text-primary" />, iconBg: 'bg-primary/10' },
                    { label: t('summary.unread'), value: unreadCount, icon: <Bell className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-500/10' },
                    { label: t('summary.critical'), value: criticalCount, icon: <AlertTriangle className="w-4 h-4 text-red-500" />, iconBg: 'bg-red-500/10' },
                    { label: t('summary.highPriority'), value: highCount, icon: <AlertTriangle className="w-4 h-4 text-orange-500" />, iconBg: 'bg-orange-500/10' },
                ].map(stat => (
                    <Card key={stat.label} className="card-elevated">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', stat.iconBg)}>{stat.icon}</div>
                            <div>
                                <p className="text-2xl font-bold leading-none">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 border-b border-border">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                            activeTab === tab.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={cn(
                                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications list */}
            {filtered.length === 0 ? (
                <Card className="card-elevated">
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <div className="p-4 rounded-full bg-muted">
                            <Bell className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">{t('empty.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('empty.subtitle')}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filtered.map(notification => {
                        const p = priorityConfig[notification.priority];
                        return (
                            <Card
                                key={notification.id}
                                className={cn(
                                    'card-elevated transition-opacity',
                                    notification.read && 'opacity-60',
                                    !notification.read && cn('border-l-4', notification.priority === 'critical' ? 'border-l-red-500' : notification.priority === 'high' ? 'border-l-orange-500' : 'border-l-yellow-400')
                                )}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Type icon */}
                                        <div className={cn('mt-0.5 p-2 rounded-lg shrink-0', p.bg)}>
                                            <span className={p.color}>{typeIcon[notification.type]}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                {!notification.read && (
                                                    <span className={cn('w-2 h-2 rounded-full shrink-0', p.dot)} />
                                                )}
                                                <span className="font-semibold text-sm text-foreground">{t(`mock.${notification.contentKey}.title`)}</span>
                                                <Badge
                                                    className={cn('text-xs shrink-0', p.bg, p.color, 'border', p.border, 'hover:bg-transparent')}
                                                    variant="outline"
                                                >
                                                    {t(`priority.${notification.priority}`)}
                                                </Badge>
                                                {notification.daysRemaining !== undefined && (
                                                    <DaysChip days={notification.daysRemaining} />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{t(`mock.${notification.contentKey}.description`)}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-foreground">{notification.student}</span>
                                                <span className="text-xs text-muted-foreground">{notification.studentClass}</span>
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    {formatDate(notification.createdAt, 'd MMM yyyy')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markRead(notification.id)}
                                                    title={t('markRead')}
                                                    aria-label={t('markRead')}
                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => dismiss(notification.id)}
                                                title={t('dismiss')}
                                                aria-label={t('dismiss')}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => notification.studentId && navigate(`/students/${notification.studentId}`)}
                                                title={t('viewStudent')}
                                                aria-label={t('viewStudent')}
                                                disabled={!notification.studentId}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
        </div>
    );
}
