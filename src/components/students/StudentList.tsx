import * as React from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, AlertCircle, Users, FileWarning, Brain, Leaf, BookOpen, UserCheck, CheckCircle2, TriangleAlert, XCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
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

    const filteredStudents = students.filter(student => {
        const matchesName = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === 'all' || student.className === classFilter;
        return matchesName && matchesClass;
    });

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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
                    <p className="text-muted-foreground mt-1">Manage student profiles and records</p>
                </div>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                </Button>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="space-y-3">
                    {/* Top row: 3 primary stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <Card className="card-elevated">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Users className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{stats.totalStudents}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Total students</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-destructive/10">
                                    <FileWarning className="w-4 h-4 text-destructive" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{stats.missingDocuments}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Missing docs</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Brain className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{stats.specialNeeds}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Special needs</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                    <Leaf className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{stats.withAllergies}</p>
                                    <p className="text-xs text-muted-foreground mt-1">With allergies</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-violet-500/10">
                                    <BookOpen className="w-4 h-4 text-violet-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{stats.perClass.length}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Classes</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <UserCheck className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{stats.newEnrollments}</p>
                                    <p className="text-xs text-muted-foreground mt-1">New enrollments</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Per-class breakdown */}
                    {stats.perClass.length > 0 && (
                        <Card className="card-elevated">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Students per class</p>
                                <div className="flex flex-wrap gap-2">
                                    {stats.perClass.map(({ className, count }) => (
                                        <button
                                            key={className}
                                            onClick={() => setClassFilter(classFilter === className ? 'all' : className)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                                classFilter === className
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-muted/50 text-foreground border-border hover:bg-muted'
                                            }`}
                                        >
                                            {className}
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                                classFilter === className ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
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
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-44">
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
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                    // Derive card health status
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

                    const statusConfig: Record<CardStatus, { label: string; icon: React.ReactNode; classes: string; borderClass: string }> = {
                        problem: {
                            label: 'Important problem',
                            icon: <XCircle className="w-3.5 h-3.5" />,
                            classes: 'bg-destructive/10 text-destructive border-destructive/25',
                            borderClass: 'border-destructive/30',
                        },
                        missing: {
                            label: 'Miss document',
                            icon: <TriangleAlert className="w-3.5 h-3.5" />,
                            classes: 'bg-amber-500/10 text-amber-600 border-amber-400/30',
                            borderClass: 'border-amber-400/40',
                        },
                        ok: {
                            label: 'All well',
                            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                            classes: 'bg-green-500/10 text-green-600 border-green-400/30',
                            borderClass: 'border-green-400/30',
                        },
                    };

                    const status = statusConfig[cardStatus];

                    return (
                        <Link
                            key={student.id}
                            to={`/students/${student.id}`}
                            className="block"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Card className={`card-elevated hover:shadow-lg transition-all cursor-pointer animate-slide-in border ${status.borderClass}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-lg flex-shrink-0">
                                            {initials}
                                        </div>

                                        {/* Student Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-base truncate">
                                                    {student.name}
                                                </h3>
                                                {/* Health status pill */}
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap flex-shrink-0 ${status.classes}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {student.className}
                                            </p>

                                            {/* Detail badges */}
                                            <div className="flex flex-wrap gap-2">
                                                <StatusBadge variant={student.contractStatus}>
                                                    {student.contractStatus}
                                                </StatusBadge>

                                                {student.medicalSupport && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-destructive/10 text-destructive border-destructive/20 text-xs font-medium">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Medical
                                                    </span>
                                                )}

                                                {!student.isPaid && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-destructive/10 text-destructive border-destructive/20 text-xs font-medium">
                                                        Unpaid
                                                    </span>
                                                )}

                                                {student.specialEducationNeeds && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-600 border-blue-300/30 text-xs font-medium">
                                                        Special needs
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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
                                <p className="text-muted-foreground">No students found</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
