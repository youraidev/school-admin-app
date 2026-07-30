import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserCog, FileText, FileCheck, AlertCircle, FileWarning, ArrowRight, ShieldAlert, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import * as api from '../../lib/api';
import { getErrorCode, useErrorMessage } from '../../i18n/errors';
import { Link } from 'react-router-dom';
import type { DashboardStats, CriticalAllergy, ContractIssue, PendingSignature } from '../../../shared/types';

export default function Dashboard() {
    const { t } = useTranslation('dashboard');
    const { t: tc } = useTranslation('common');
    const errorMessage = useErrorMessage();
    const [stats, setStats] = React.useState<DashboardStats | null>(null);
    const issueLabels: Record<string, string> = {
        unpaid: t('contracts.issueLabels.unpaid'),
        pending: t('contracts.issueLabels.pending'),
        expired: t('contracts.issueLabels.expired'),
        other: t('contracts.issueLabels.other'),
    };
    const [criticalAllergies, setCriticalAllergies] = React.useState<CriticalAllergy[]>([]);
    const [contractIssues, setContractIssues] = React.useState<ContractIssue[]>([]);
    const [pendingSignatures, setPendingSignatures] = React.useState<PendingSignature[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);
                const [statsData, allergiesData, issuesData, signaturesData] = await Promise.all([
                    api.getDashboardStats(),
                    api.getCriticalAllergies(),
                    api.getContractIssues(),
                    api.getPendingSignatures(),
                ]);
                setStats(statsData);
                setCriticalAllergies(allergiesData);
                setContractIssues(issuesData);
                setPendingSignatures(signaturesData);
            } catch (err) {
                setError(getErrorCode(err));
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{tc('states.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-destructive mt-1">{errorMessage(error ?? 'UNKNOWN')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Students */}
                <Card className="card-elevated overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-start justify-between px-5 pt-5 pb-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('stats.totalStudents')}</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.totalStudents}</p>
                                <p className="text-xs text-muted-foreground">{t('stats.enrolledStudents')}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="h-1 w-full bg-primary/20" />
                    </CardContent>
                </Card>

                {/* Total Staff */}
                <Card className="card-elevated overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-start justify-between px-5 pt-5 pb-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('stats.totalStaff')}</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.totalStaff}</p>
                                <p className="text-xs text-muted-foreground">{t('stats.teachersAndAdmin')}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <UserCog className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="h-1 w-full bg-primary/20" />
                    </CardContent>
                </Card>

                {/* Pending Contracts */}
                <Card className="card-elevated overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-start justify-between px-5 pt-5 pb-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('stats.pendingContracts')}</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.pendingContracts}</p>
                                <p className="text-xs text-muted-foreground">{t('stats.requiresAttention')}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>
                        <div className="h-1 w-full bg-amber-400/40" />
                    </CardContent>
                </Card>

                {/* Pending Signatures */}
                <Card className="card-elevated overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-start justify-between px-5 pt-5 pb-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('stats.pendingSignatures')}</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.pendingSignatures}</p>
                                <p className="text-xs text-muted-foreground">{t('stats.complianceDocuments')}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center flex-shrink-0">
                                <FileCheck className="w-5 h-5 text-sky-500" />
                            </div>
                        </div>
                        <div className="h-1 w-full bg-sky-400/40" />
                    </CardContent>
                </Card>
            </div>

            {/* Alert Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Critical Allergy Alerts */}
                <Card className="card-elevated overflow-hidden">
                    <CardHeader className="pb-0 pt-0 px-0">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">{t('allergies.title')}</p>
                                <p className="text-xs text-muted-foreground">{t('allergies.affected', { count: criticalAllergies.length })}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {criticalAllergies.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">{t('allergies.empty')}</p>
                        ) : (
                            <>
                                <div className="divide-y divide-border/50">
                                    {criticalAllergies.slice(0, 3).map((allergy) => (
                                        <Link
                                            key={allergy.studentId}
                                            to={`/students/${allergy.studentId}`}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-[10px] font-bold text-primary">
                                                        {allergy.studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{allergy.studentName}</p>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-[11px] font-semibold">
                                                        {allergy.allergen}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-border/60">
                                    <Link to="/students" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                                        {t('allergies.viewAll')} <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Contract Issues */}
                <Card className="card-elevated overflow-hidden">
                    <CardHeader className="pb-0 pt-0 px-0">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                                <FileWarning className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">{t('contracts.title')}</p>
                                <p className="text-xs text-muted-foreground">{t('contracts.found', { count: contractIssues.length })}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {contractIssues.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">{t('contracts.empty')}</p>
                        ) : (
                            <>
                                <div className="divide-y divide-border/50">
                                    {contractIssues.slice(0, 3).map((issue) => (
                                        <Link
                                            key={issue.studentId}
                                            to={`/students/${issue.studentId}`}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-[10px] font-bold text-primary">
                                                        {issue.studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{issue.studentName}</p>
                                                    <div className="mt-0.5">
                                                        <StatusBadge variant={issue.status}>{issueLabels[issue.issue] ?? issue.issue}</StatusBadge>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-border/60">
                                    <Link to="/students" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                                        {t('contracts.viewAll')} <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Awaiting Signatures */}
                <Card className="card-elevated overflow-hidden">
                    <CardHeader className="pb-0 pt-0 px-0">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center">
                                <ClipboardList className="w-4 h-4 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">{t('signatures.title')}</p>
                                <p className="text-xs text-muted-foreground">{t('signatures.pendingDocs', { count: pendingSignatures.length })}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingSignatures.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">{t('signatures.empty')}</p>
                        ) : (
                            <>
                                <div className="divide-y divide-border/50">
                                    {pendingSignatures.slice(0, 3).map((doc) => (
                                        <Link
                                            key={doc.documentId}
                                            to="/compliance"
                                            className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-7 h-7 rounded-md bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center flex-shrink-0">
                                                    <FileCheck className="w-3.5 h-3.5 text-sky-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors line-clamp-1">{doc.documentTitle}</p>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[11px] font-semibold mt-0.5">
                                                        {t('signatures.pendingChip', { count: doc.pendingCount })}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-border/60">
                                    <Link to="/compliance" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                                        {t('signatures.viewAll')} <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
