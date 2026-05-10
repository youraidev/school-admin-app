import * as React from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Filter, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import * as api from '../../lib/api';
import type { Student } from '../../../shared/types';

export default function StudentList() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [students, setStudents] = React.useState<Student[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadStudents() {
            try {
                setLoading(true);
                const data = await api.getAllStudents();
                setStudents(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load students');
            } finally {
                setLoading(false);
            }
        }
        loadStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase())
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

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student, index) => {
                    // Get initials for avatar
                    const initials = student.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                    // Check for critical allergies (you can enhance this with actual data)
                    const hasAllergyAlert = student.contractStatus === 'active' && index === 0; // Example logic
                    const hasUnpaidStatus = !student.isPaid;

                    return (
                        <Link
                            key={student.id}
                            to={`/students/${student.id}`}
                            className="block"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Card className="card-elevated hover:shadow-lg transition-all cursor-pointer animate-slide-in">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-lg flex-shrink-0">
                                            {initials}
                                        </div>

                                        {/* Student Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base mb-1 truncate">
                                                {student.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {student.className}
                                            </p>

                                            {/* Status Badges */}
                                            <div className="flex flex-wrap gap-2">
                                                <StatusBadge variant={student.contractStatus}>
                                                    {student.contractStatus}
                                                </StatusBadge>

                                                {hasAllergyAlert && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-destructive/10 text-destructive border-destructive/20 text-xs font-medium">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Allergy Alert
                                                    </span>
                                                )}

                                                {student.contractStatus === 'pending' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-warning/10 text-warning border-warning/20 text-xs font-medium">
                                                        Pending
                                                    </span>
                                                )}

                                                {hasUnpaidStatus && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-destructive/10 text-destructive border-destructive/20 text-xs font-medium">
                                                        Unpaid
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
