import * as React from 'react';
import { Upload, Search, FileText, CheckCircle2, Clock, Bell, Users, AlertCircle, CalendarDays, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import * as api from '../../lib/api';
import { format } from 'date-fns';
import type { ComplianceDocumentWithSignatures } from '../../../shared/types';

function SignerChip({ staffName, status, signedAt }: { staffName: string; status: string; signedAt?: string | null }) {
    const initials = staffName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('');
    const signed = status === 'signed';

    return (
        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
            signed
                ? 'bg-emerald-50 border-emerald-200/70 dark:bg-emerald-950/30 dark:border-emerald-800/50'
                : 'bg-muted/40 border-border/60'
        }`}>
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                signed ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'
            }`}>
                {initials}
            </div>
            <div className="min-w-0">
                <p className={`font-medium truncate leading-none mb-0.5 ${signed ? 'text-emerald-800 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                    {staffName.split(' ')[0]}
                </p>
                {signedAt ? (
                    <p className="text-muted-foreground leading-none">{format(new Date(signedAt), 'MMM d')}</p>
                ) : (
                    <p className="text-muted-foreground/60 leading-none italic">Pending</p>
                )}
            </div>
            {/* Status icon */}
            <div className="ml-auto flex-shrink-0">
                {signed
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                }
            </div>
        </div>
    );
}

export default function ComplianceList() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [documents, setDocuments] = React.useState<ComplianceDocumentWithSignatures[]>([]);
    const [loading, setLoading] = React.useState(true);

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

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Internal Compliance</h1>
                    <p className="text-muted-foreground mt-1">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Internal Compliance</h1>
                    <p className="text-muted-foreground mt-1">Manage internal rules and acknowledgments</p>
                </div>
                <Button className="gap-2" disabled title="Coming soon — upload is not yet implemented">
                    <Upload className="w-4 h-4" />
                    Upload Document
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-background"
                />
            </div>

            {/* Document List */}
            <div className="space-y-4">
                {filteredDocuments.map((doc, index) => {
                    const progressPercent = doc.totalSignatures > 0
                        ? Math.round((doc.signedCount / doc.totalSignatures) * 100)
                        : 0;
                    const isOverdue = doc.dueDate && new Date(doc.dueDate) < new Date() && doc.pendingCount > 0;
                    const isComplete = progressPercent === 100;

                    return (
                        <div
                            key={doc.id}
                            className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow animate-slide-in overflow-hidden"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Top accent line */}
                            <div className={`h-0.5 w-full ${isComplete ? 'bg-emerald-500' : isOverdue ? 'bg-destructive' : 'bg-primary/30'}`} />

                            <div className="p-5">
                                {/* Card Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    {/* File icon box */}
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        isComplete ? 'bg-emerald-50 dark:bg-emerald-950/40' : isOverdue ? 'bg-destructive/8' : 'bg-primary/8'
                                    }`}>
                                        <FileText className={`w-5 h-5 ${
                                            isComplete ? 'text-emerald-600' : isOverdue ? 'text-destructive' : 'text-primary'
                                        }`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Title row */}
                                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                            <h2 className="text-base font-semibold leading-tight">{doc.title}</h2>
                                            {isOverdue && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Overdue
                                                </span>
                                            )}
                                            {isComplete && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-semibold dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Complete
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta pills */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <Tag className="w-3 h-3" />
                                                {doc.version}
                                            </span>
                                            <span className="text-muted-foreground/40 text-xs">·</span>
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <CalendarDays className="w-3 h-3" />
                                                Uploaded {format(new Date(doc.uploadDate), 'MMM d')}
                                            </span>
                                            <span className="text-muted-foreground/40 text-xs">·</span>
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <Users className="w-3 h-3" />
                                                {doc.targetAudience === 'all' ? 'All Staff' : doc.targetAudience}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{doc.description}</p>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Signatures</span>
                                        <span className={`text-xs font-semibold ${isComplete ? 'text-emerald-600' : 'text-foreground'}`}>
                                            {doc.signedCount} / {doc.totalSignatures} &nbsp;
                                            <span className="font-normal text-muted-foreground">({progressPercent}%)</span>
                                        </span>
                                    </div>
                                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                                                isComplete ? 'bg-emerald-500' : isOverdue ? 'bg-destructive' : 'bg-primary'
                                            }`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Signers grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                                    {doc.signatures.map(sig => (
                                        <SignerChip
                                            key={sig.id}
                                            staffName={sig.staffName}
                                            status={sig.status}
                                            signedAt={sig.signedAt}
                                        />
                                    ))}
                                </div>

                                {/* Remind button */}
                                {doc.pendingCount > 0 && (
                                    <button
                                        disabled
                                        title="Coming soon — reminders are not yet implemented"
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-border/60 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
                                    >
                                        <Bell className="w-3.5 h-3.5" />
                                        Remind {doc.pendingCount} pending {doc.pendingCount === 1 ? 'user' : 'users'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredDocuments.length === 0 && (
                    <div className="rounded-xl border bg-card p-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No compliance documents found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
