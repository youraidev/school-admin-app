import * as React from 'react';
import { Users, UserCog, FileText, FileCheck, AlertCircle, FileWarning, ArrowRight, ShieldAlert, ClipboardList, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import * as api from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import type { DashboardStats, CriticalAllergy, ContractIssue, PendingSignature, Student } from '../../../shared/types';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = React.useState<DashboardStats | null>(null);
    const [criticalAllergies, setCriticalAllergies] = React.useState<CriticalAllergy[]>([]);
    const [contractIssues, setContractIssues] = React.useState<ContractIssue[]>([]);
    const [pendingSignatures, setPendingSignatures] = React.useState<PendingSignature[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Search state
    const [allStudents, setAllStudents] = React.useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchOpen, setSearchOpen] = React.useState(false);
    const searchRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const searchResults = React.useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return allStudents.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.className.toLowerCase().includes(q)
        ).slice(0, 6);
    }, [allStudents, searchQuery]);

    // Close dropdown on outside click or Escape
    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setSearchOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    React.useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);
                const [statsData, allergiesData, issuesData, signaturesData, studentsData] = await Promise.all([
                    api.getDashboardStats(),
                    api.getCriticalAllergies(),
                    api.getContractIssues(),
                    api.getPendingSignatures(),
                    api.getAllStudents(),
                ]);
                setStats(statsData);
                setCriticalAllergies(allergiesData);
                setContractIssues(issuesData);
                setPendingSignatures(signaturesData);
                setAllStudents(studentsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
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
                    <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-destructive mt-1">{error || 'Failed to load data'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of school administration</p>
                </div>

                {/* Student search */}
                <div ref={searchRef} className="relative w-72 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                            onFocus={() => setSearchOpen(true)}
                            placeholder="Search students..."
                            className="w-full h-9 pl-9 pr-8 text-sm rounded-lg border border-border bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setSearchOpen(false); inputRef.current?.focus(); }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Results dropdown */}
                    {searchOpen && searchQuery.trim() && (
                        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                            {searchResults.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-muted-foreground">No students found</div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {searchResults.map(student => {
                                        const initials = student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                                        return (
                                            <button
                                                key={student.id}
                                                onClick={() => { navigate(`/students/${student.id}`); setSearchOpen(false); setSearchQuery(''); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-[10px] font-bold text-primary">{initials}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.className}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Students */}
                <Card className="card-elevated overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-start justify-between px-5 pt-5 pb-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Students</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.totalStudents}</p>
                                <p className="text-xs text-muted-foreground">Enrolled students</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Staff</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.totalStaff}</p>
                                <p className="text-xs text-muted-foreground">Teachers &amp; admin</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Contracts</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.pendingContracts}</p>
                                <p className="text-xs text-muted-foreground">Requires attention</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Signatures</p>
                                <p className="text-4xl font-semibold tracking-tight">{stats.pendingSignatures}</p>
                                <p className="text-xs text-muted-foreground">Compliance documents</p>
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
                                <p className="text-sm font-semibold leading-tight">Critical Allergy Alerts</p>
                                <p className="text-xs text-muted-foreground">{criticalAllergies.length} student{criticalAllergies.length !== 1 ? 's' : ''} affected</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {criticalAllergies.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">No critical allergies on record</p>
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
                                        View all students <ArrowRight className="w-3 h-3" />
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
                                <p className="text-sm font-semibold leading-tight">Contract Issues</p>
                                <p className="text-xs text-muted-foreground">{contractIssues.length} issue{contractIssues.length !== 1 ? 's' : ''} found</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {contractIssues.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">No contract issues</p>
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
                                                        <StatusBadge variant={issue.status}>{issue.issue}</StatusBadge>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-border/60">
                                    <Link to="/students" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                                        View all contracts <ArrowRight className="w-3 h-3" />
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
                                <p className="text-sm font-semibold leading-tight">Awaiting Signatures</p>
                                <p className="text-xs text-muted-foreground">{pendingSignatures.length} document{pendingSignatures.length !== 1 ? 's' : ''} pending</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingSignatures.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">All documents signed</p>
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
                                                        {doc.pendingCount} pending
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-border/60">
                                    <Link to="/compliance" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                                        View all documents <ArrowRight className="w-3 h-3" />
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
