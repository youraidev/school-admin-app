import * as React from 'react';
import { Users, UserCog, FileText, FileCheck, AlertCircle, FileWarning, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import * as api from '../../lib/api';
import { Link } from 'react-router-dom';
import type { DashboardStats, CriticalAllergy, ContractIssue, PendingSignature } from '../../../shared/types';

export default function Dashboard() {
    const [stats, setStats] = React.useState<DashboardStats | null>(null);
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
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of school administration</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="card-elevated">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Students</p>
                            <p className="text-4xl font-semibold">{stats.totalStudents}</p>
                            <p className="text-xs text-muted-foreground">Enrolled students</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Staff</p>
                            <p className="text-4xl font-semibold">{stats.totalStaff}</p>
                            <p className="text-xs text-muted-foreground">Teachers & admin</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserCog className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-elevated bg-warning/5">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Pending Contracts</p>
                            <p className="text-4xl font-semibold">{stats.pendingContracts}</p>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <div className="p-2 bg-warning/10 rounded-lg">
                                <FileText className="w-5 h-5 text-warning" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-elevated bg-info/5">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Pending Signatures</p>
                            <p className="text-4xl font-semibold">{stats.pendingSignatures}</p>
                            <p className="text-xs text-muted-foreground">Compliance documents</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <div className="p-2 bg-info/10 rounded-lg">
                                <FileCheck className="w-5 h-5 text-info" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alert Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Critical Allergy Alerts */}
                <Card className="card-elevated border-l-4 border-l-destructive">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <h3 className="font-semibold">Critical Allergy Alerts</h3>
                        </div>

                        {criticalAllergies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No critical allergies</p>
                        ) : (
                            <div className="space-y-3">
                                {criticalAllergies.slice(0, 2).map((allergy) => (
                                    <Link
                                        key={allergy.studentId}
                                        to={`/students/${allergy.studentId}`}
                                        className="block group"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                                {allergy.studentName}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-destructive/10 text-destructive border-destructive/20 text-xs font-medium">
                                                    {allergy.allergen}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                <Link
                                    to="/students"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                                >
                                    View all students
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contract Issues */}
                <Card className="card-elevated border-l-4 border-l-warning">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileWarning className="w-5 h-5 text-warning" />
                            <h3 className="font-semibold">Contract Issues</h3>
                        </div>

                        {contractIssues.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No contract issues</p>
                        ) : (
                            <div className="space-y-3">
                                {contractIssues.slice(0, 2).map((issue) => (
                                    <Link
                                        key={issue.studentId}
                                        to={`/students/${issue.studentId}`}
                                        className="block group"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                                {issue.studentName}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                <StatusBadge variant={issue.status}>
                                                    {issue.issue}
                                                </StatusBadge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                <Link
                                    to="/students"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                                >
                                    View all contracts
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Awaiting Signatures */}
                <Card className="card-elevated border-l-4 border-l-info">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileCheck className="w-5 h-5 text-info" />
                            <h3 className="font-semibold">Awaiting Signatures</h3>
                        </div>

                        {pendingSignatures.length === 0 ? (
                            <p className="text-sm text-muted-foreground">All documents signed</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingSignatures.slice(0, 2).map((doc) => (
                                    <Link
                                        key={doc.documentId}
                                        to="/compliance"
                                        className="block group"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                                                {doc.documentTitle}
                                            </p>
                                            <div className="mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-warning/10 text-warning border-warning/20 text-xs font-medium">
                                                    {doc.signedCount} pending
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                <Link
                                    to="/compliance"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                                >
                                    View all documents
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
