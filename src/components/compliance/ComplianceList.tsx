import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Search, FileText, CheckCircle2, Clock, Bell, Users, AlertCircle, CalendarDays, Tag, FileCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import * as api from '../../lib/api';
import { formatDate } from '../../i18n/format';
import { cn } from '../../lib/utils';
import type { ComplianceDocumentWithSignatures, DocumentSignature } from '../../../shared/types';

type StatusFilter = 'all' | 'overdue' | 'inProgress' | 'complete';

function getDocStatus(doc: ComplianceDocumentWithSignatures): 'overdue' | 'complete' | 'inProgress' {
    const isOverdue = !!doc.dueDate && new Date(doc.dueDate) < new Date() && doc.pendingCount > 0;
    if (isOverdue) return 'overdue';
    if (doc.totalSignatures > 0 && doc.signedCount === doc.totalSignatures) return 'complete';
    return 'inProgress';
}

function initialsOf(name: string) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

// Compact overlapping avatar stack used in the collapsed row.
function SignerStack({ signatures }: { signatures: DocumentSignature[] }) {
    const { t: tc } = useTranslation('common');
    const MAX = 4;
    const visible = signatures.slice(0, MAX);
    const overflow = signatures.length - visible.length;

    return (
        <div className="flex items-center -space-x-2 flex-shrink-0">
            {visible.map(sig => {
                const signed = sig.status === 'signed';
                return (
                    <div
                        key={sig.id}
                        title={`${sig.staffName} — ${signed && sig.signedAt ? formatDate(sig.signedAt, 'MMM d') : tc('status.pending')}`}
                        className={cn(
                            'w-7 h-7 rounded-full ring-2 ring-card flex items-center justify-center text-[10px] font-bold',
                            signed ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                        )}
                    >
                        {initialsOf(sig.staffName)}
                    </div>
                );
            })}
            {overflow > 0 && (
                <div className="w-7 h-7 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    +{overflow}
                </div>
            )}
        </div>
    );
}

// Small conic-gradient completion ring used in the collapsed row.
function ProgressRing({ percent, status }: { percent: number; status: 'overdue' | 'complete' | 'inProgress' }) {
    const color = status === 'complete' ? 'hsl(var(--success))' : status === 'overdue' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
    return (
        <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `conic-gradient(${color} ${percent * 3.6}deg, hsl(var(--muted)) 0deg)` }}
        >
            <div className="absolute inset-[3px] rounded-full bg-card flex items-center justify-center">
                <span className="text-[10px] font-bold">{percent}%</span>
            </div>
        </div>
    );
}

function SignerChip({ staffName, status, signedAt }: { staffName: string; status: string; signedAt?: string | null }) {
    const { t: tc } = useTranslation('common');
    const signed = status === 'signed';

    return (
        <div className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs transition-colors',
            signed ? 'bg-success/10 border-success/20' : 'bg-muted/40 border-border/60'
        )}>
            <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                signed ? 'bg-success text-white' : 'bg-muted-foreground/20 text-muted-foreground'
            )}>
                {initialsOf(staffName)}
            </div>
            <div className="min-w-0">
                <p className={cn('font-medium truncate leading-none mb-0.5', signed ? 'text-success' : 'text-muted-foreground')}>
                    {staffName.split(' ')[0]}
                </p>
                {signedAt ? (
                    <p className="text-muted-foreground leading-none">{formatDate(signedAt, 'MMM d')}</p>
                ) : (
                    <p className="text-muted-foreground/60 leading-none italic">{tc('status.pending')}</p>
                )}
            </div>
            <div className="ml-auto flex-shrink-0">
                {signed
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    : <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                }
            </div>
        </div>
    );
}

interface StatPillProps {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    tone: 'default' | 'destructive' | 'success' | 'primary';
}

function StatPill({ label, count, active, onClick, icon: Icon, tone }: StatPillProps) {
    const toneClasses: Record<StatPillProps['tone'], string> = {
        default: 'text-foreground',
        destructive: 'text-destructive',
        success: 'text-success',
        primary: 'text-primary',
    };
    const activeClasses: Record<StatPillProps['tone'], string> = {
        default: 'border-foreground/30 bg-muted/60',
        destructive: 'border-destructive/40 bg-destructive/10',
        success: 'border-success/40 bg-success/10',
        primary: 'border-primary/40 bg-primary/10',
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-left transition-colors flex-1 min-w-0',
                active ? activeClasses[tone] : 'bg-card border-border/60 hover:bg-muted/40'
            )}
        >
            <Icon className={cn('w-4 h-4 flex-shrink-0', toneClasses[tone])} />
            <span className="min-w-0">
                <span className={cn('block text-base font-semibold leading-none', toneClasses[tone])}>{count}</span>
                <span className="block text-xs text-muted-foreground truncate mt-0.5">{label}</span>
            </span>
        </button>
    );
}

function DocumentDetailDialog({
    doc,
    audienceLabel,
    open,
    onOpenChange,
}: {
    doc: ComplianceDocumentWithSignatures | null;
    audienceLabel: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation('compliance');
    if (!doc) return null;

    const status = getDocStatus(doc);
    const progressPercent = doc.totalSignatures > 0 ? Math.round((doc.signedCount / doc.totalSignatures) * 100) : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 flex-wrap pr-6">
                        <DialogTitle>{doc.title}</DialogTitle>
                        {status === 'overdue' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold">
                                <AlertCircle className="w-3 h-3" />
                                {t('overdue')}
                            </span>
                        )}
                        {status === 'complete' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20 text-xs font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('complete')}
                            </span>
                        )}
                    </div>
                    <DialogDescription className="!mt-2">{doc.description}</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground -mt-2">
                    <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" />{doc.version}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" />{t('uploaded', { date: formatDate(doc.uploadDate, 'MMM d') })}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{audienceLabel}</span>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('signatures')}</span>
                        <span className={cn('text-xs font-semibold', status === 'complete' ? 'text-success' : 'text-foreground')}>
                            {doc.signedCount} / {doc.totalSignatures} &nbsp;
                            <span className="font-normal text-muted-foreground">({progressPercent}%)</span>
                        </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                        <div
                            className={cn(
                                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                                status === 'complete' ? 'bg-success' : status === 'overdue' ? 'bg-destructive' : 'bg-primary'
                            )}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {doc.signatures.map(sig => (
                        <SignerChip key={sig.id} staffName={sig.staffName} status={sig.status} signedAt={sig.signedAt} />
                    ))}
                </div>

                {doc.pendingCount > 0 && (
                    <button
                        disabled
                        title={t('remindComingSoon')}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-border/60 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
                    >
                        <Bell className="w-3.5 h-3.5" />
                        {t('remind', { count: doc.pendingCount })}
                    </button>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function ComplianceList() {
    const { t } = useTranslation('compliance');
    // targetAudience is a DB enum ('all' | 'department' | 'individual') — translate for display
    const audienceLabels: Record<string, string> = {
        all: t('allStaff'),
        department: t('audience.department'),
        individual: t('audience.individual'),
    };
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
    const [documents, setDocuments] = React.useState<ComplianceDocumentWithSignatures[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedDoc, setSelectedDoc] = React.useState<ComplianceDocumentWithSignatures | null>(null);

    React.useEffect(() => {
        async function loadDocuments() {
            try {
                const data = await api.getAllComplianceDocuments();
                setDocuments(data);
            } finally {
                setLoading(false);
            }
        }
        loadDocuments();
    }, []);

    const searchedDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const counts = {
        all: searchedDocuments.length,
        overdue: searchedDocuments.filter(d => getDocStatus(d) === 'overdue').length,
        inProgress: searchedDocuments.filter(d => getDocStatus(d) === 'inProgress').length,
        complete: searchedDocuments.filter(d => getDocStatus(d) === 'complete').length,
    };

    const filteredDocuments = statusFilter === 'all'
        ? searchedDocuments
        : searchedDocuments.filter(doc => getDocStatus(doc) === statusFilter);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
                </div>
                <Button className="gap-2" disabled title={t('uploadComingSoon')}>
                    <Upload className="w-4 h-4" />
                    {t('upload')}
                </Button>
            </div>

            {/* Status filter pills (double as summary stats) */}
            <div className="flex items-stretch gap-2.5">
                <StatPill label={t('filters.all')} count={counts.all} tone="default" icon={FileText} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                <StatPill label={t('filters.overdue')} count={counts.overdue} tone="destructive" icon={AlertCircle} active={statusFilter === 'overdue'} onClick={() => setStatusFilter('overdue')} />
                <StatPill label={t('filters.inProgress')} count={counts.inProgress} tone="primary" icon={Clock} active={statusFilter === 'inProgress'} onClick={() => setStatusFilter('inProgress')} />
                <StatPill label={t('filters.complete')} count={counts.complete} tone="success" icon={FileCheck} active={statusFilter === 'complete'} onClick={() => setStatusFilter('complete')} />
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-background"
                />
            </div>

            {/* Document List */}
            <div className="space-y-2">
                {filteredDocuments.map((doc, index) => {
                    const progressPercent = doc.totalSignatures > 0
                        ? Math.round((doc.signedCount / doc.totalSignatures) * 100)
                        : 0;
                    const status = getDocStatus(doc);

                    return (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className="w-full flex items-center gap-4 rounded-lg border bg-card px-4 py-3 text-left hover:border-primary/40 hover:bg-accent/30 transition-colors animate-slide-in"
                            style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                        >
                            {/* Status accent bar */}
                            <div className={cn(
                                'w-1 self-stretch rounded-full flex-shrink-0',
                                status === 'complete' ? 'bg-success' : status === 'overdue' ? 'bg-destructive' : 'bg-primary/30'
                            )} />

                            <FileText className={cn(
                                'w-4 h-4 flex-shrink-0',
                                status === 'complete' ? 'text-success' : status === 'overdue' ? 'text-destructive' : 'text-primary'
                            )} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-sm font-semibold leading-tight truncate">{doc.title}</h2>
                                    {status === 'overdue' && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[10px] font-semibold flex-shrink-0">
                                            <AlertCircle className="w-2.5 h-2.5" />
                                            {t('overdue')}
                                        </span>
                                    )}
                                    {status === 'complete' && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/10 text-success text-[10px] font-semibold flex-shrink-0">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            {t('complete')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
                                    <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" />{doc.version}</span>
                                    <span className="text-muted-foreground/40">·</span>
                                    <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" />{t('uploaded', { date: formatDate(doc.uploadDate, 'MMM d') })}</span>
                                    <span className="text-muted-foreground/40 hidden sm:inline">·</span>
                                    <span className="hidden sm:inline-flex items-center gap-1"><Users className="w-3 h-3" />{audienceLabels[doc.targetAudience] ?? doc.targetAudience}</span>
                                </div>
                            </div>

                            <SignerStack signatures={doc.signatures} />
                            <ProgressRing percent={progressPercent} status={status} />
                        </button>
                    );
                })}

                {filteredDocuments.length === 0 && (
                    <div className="rounded-xl border bg-card p-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {documents.length === 0 ? t('empty') : t('noResults')}
                        </p>
                    </div>
                )}
            </div>

            <DocumentDetailDialog
                doc={selectedDoc}
                audienceLabel={selectedDoc ? (audienceLabels[selectedDoc.targetAudience] ?? selectedDoc.targetAudience) : ''}
                open={selectedDoc !== null}
                onOpenChange={(open) => { if (!open) setSelectedDoc(null); }}
            />
        </div>
    );
}
