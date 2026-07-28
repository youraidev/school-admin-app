import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Search, UserPlus, AlertCircle, Users, FileWarning, Brain,
    Leaf, BookOpen, UserCheck, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as api from '../../lib/api';
import type { Student } from '../../../shared/types';
import type { StudentStats } from '../../lib/api';

export default function StudentList() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [classFilter, setClassFilter] = React.useState('all');
    const [students, setStudents] = React.useState<Student[]>([]);
    const [stats, setStats] = React.useState<StudentStats | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadStudents() {
            try {
                setLoading(true);
                const [data, statsData] = await Promise.all([
                    api.getAllStudents(),
                    api.getStudentStats(),
                ]);
                setStudents(data);
                setStats(statsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load students');
            } finally {
                setLoading(false);
            }
        }
        loadStudents();
    }, []);

    const classOptions = React.useMemo(() => {
        const classes = Array.from(new Set(students.map(s => s.className))).sort();
        return classes;
    }, [students]);

    const filteredStudents = React.useMemo(() =>
        students.filter(student => {
            const matchesName = student.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClass = classFilter === 'all' || student.className === classFilter;
            return matchesName && matchesClass;
        }),
        [students, searchTerm, classFilter]
    );

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
                        <p className="text-muted-foreground mt-1">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
                        <p className="text-destructive mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const statCards = stats ? [
        {
            value: stats.totalStudents,
            label: 'Total students',
            icon: Users,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
            accent: 'bg-primary/20',
        },
        {
            value: stats.missingDocuments,
            label: 'Missing docs',
            icon: FileWarning,
            iconBg: 'bg-destructive/10',
            iconColor: 'text-destructive',
            accent: 'bg-destructive/20',
        },
        {
            value: stats.specialNeeds,
            label: 'Special needs',
            icon: Brain,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            accent: 'bg-blue-400/20',
        },
        {
            value: stats.withAllergies,
            label: 'With allergies',
            icon: Leaf,
            iconBg: 'bg-orange-500/10',
            iconColor: 'text-orange-500',
            accent: 'bg-orange-400/20',
        },
        {
            value: stats.perClass.length,
            label: 'Classes',
            icon: BookOpen,
            iconBg: 'bg-violet-500/10',
            iconColor: 'text-violet-500',
            accent: 'bg-violet-400/20',
        },
        {
            value: stats.newEnrollments,
            label: 'New enrollments',
            icon: UserCheck,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            accent: 'bg-emerald-400/20',
        },
    ] : [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
                    <p className="text-muted-foreground mt-1">Manage student profiles and records</p>
                </div>
                <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Student
                </Button>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {statCards.map(({ value, label, icon: Icon, iconBg, iconColor, accent }) => (
                            <Card key={label} className="card-elevated overflow-hidden">
                                <CardContent className="p-4 pb-3">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div>
                                            <p className="text-3xl font-bold leading-none tracking-tight">{value}</p>
                                            <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{label}</p>
                                        </div>
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                                            <Icon className={`w-4 h-4 ${iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                                <div className={`h-1 w-full ${accent}`} />
                            </Card>
                        ))}
                    </div>

                    {/* Per-class filter */}
                    {stats.perClass.length > 0 && (
                        <Card className="card-elevated overflow-hidden">
                            <CardHeader className="py-3 px-5 border-b border-border/60 flex-row items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                                    <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students per class</span>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-2">
                                    {stats.perClass.map(({ className, count }) => (
                                        <button
                                            key={className}
                                            onClick={() => setClassFilter(classFilter === className ? 'all' : className)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                                classFilter === className
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                    : 'bg-muted/40 text-foreground border-border hover:bg-muted hover:border-border/80'
                                            }`}
                                        >
                                            {className}
                                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                                                classFilter === className
                                                    ? 'bg-white/20 text-primary-foreground'
                                                    : 'bg-muted-foreground/15 text-muted-foreground'
                                            }`}>{count}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-44 h-10">
                        <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {classOptions.map(cls => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student, index) => {
                    const initials = student.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                    const hasImportantProblem =
                        !student.isPaid ||
                        student.contractStatus === 'terminated' ||
                        student.contractStatus === 'expired' ||
                        !!student.medicalSupport;
                    const hasMissingDoc =
                        !hasImportantProblem &&
                        (student.contractStatus === 'pending' ||
                            student.healthStatus === 'needs_review');

                    type CardStatus = 'problem' | 'missing' | 'ok';
                    const cardStatus: CardStatus = hasImportantProblem
                        ? 'problem'
                        : hasMissingDoc
                        ? 'missing'
                        : 'ok';

                    const statusConfig: Record<CardStatus, {
                        label: string;
                        dotClass: string;
                        accentClass: string;
                        avatarBg: string;
                        avatarText: string;
                    }> = {
                        problem: {
                            label: 'Requires attention',
                            dotClass: 'bg-destructive',
                            accentClass: 'bg-destructive',
                            avatarBg: 'bg-destructive/10',
                            avatarText: 'text-destructive',
                        },
                        missing: {
                            label: 'Missing documents',
                            dotClass: 'bg-amber-500',
                            accentClass: 'bg-amber-400',
                            avatarBg: 'bg-amber-500/10',
                            avatarText: 'text-amber-600',
                        },
                        ok: {
                            label: 'All well',
                            dotClass: 'bg-emerald-500',
                            accentClass: 'bg-emerald-500',
                            avatarBg: 'bg-primary/10',
                            avatarText: 'text-primary',
                        },
                    };

                    const status = statusConfig[cardStatus];

                    return (
                        <Link
                            key={student.id}
                            to={`/students/${student.id}`}
                            className="block group"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Card className="card-elevated hover:shadow-md transition-all cursor-pointer animate-slide-in overflow-hidden flex flex-col">
                                {/* Top accent bar */}
                                <div className={`h-0.5 w-full ${status.accentClass}`} />

                                <CardContent className="p-5 flex-1 flex flex-col gap-4">
                                    {/* Header row: avatar + name + chevron */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${status.avatarBg} ${status.avatarText}`}>
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base leading-tight truncate">{student.name}</h3>
                                            <p className="text-sm text-muted-foreground mt-0.5">{student.className}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 mt-1 transition-colors" />
                                    </div>

                                    {/* Badge row */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <StatusBadge variant={student.contractStatus}>
                                            {student.contractStatus}
                                        </StatusBadge>

                                        {!student.isPaid && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md border bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold">
                                                Unpaid
                                            </span>
                                        )}

                                        {student.medicalSupport && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold">
                                                <AlertCircle className="w-3 h-3" />
                                                Medical
                                            </span>
                                        )}

                                        {student.specialEducationNeeds && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md border bg-blue-500/10 text-blue-600 border-blue-300/30 text-xs font-semibold">
                                                Special needs
                                            </span>
                                        )}
                                    </div>

                                    {/* Status footer */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-auto">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dotClass}`} />
                                        <span className="text-xs text-muted-foreground font-medium">{status.label}</span>
                                        {cardStatus !== 'ok' && (
                                            <AlertTriangle className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}

                {filteredStudents.length === 0 && (
                    <div className="col-span-full">
                        <Card className="card-elevated">
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">No students found matching your search.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
