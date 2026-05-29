import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ExternalLink, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { StatusBadge } from '../ui/status-badge';
import { SeverityBadge } from '../ui/severity-badge';
import { Separator } from '../ui/separator';
import * as api from '../../lib/api';
import { format } from 'date-fns';
import type { StudentWithDetails } from '../../../shared/types';

interface StudentCardProps {
    studentId: string;
}

export default function StudentCard({ studentId }: StudentCardProps) {
    const navigate = useNavigate();
    const [student, setStudent] = React.useState<StudentWithDetails | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadStudent() {
            try {
                const data = await api.getStudentById(studentId);
                setStudent(data);
            } finally {
                setLoading(false);
            }
        }
        loadStudent();
    }, [studentId]);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Button variant="ghost" onClick={() => navigate('/students')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Students
                </Button>
                <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Loading...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Button variant="ghost" onClick={() => navigate('/students')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Students
                </Button>
                <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Student not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const primaryContact = student.emergencyContacts.find(c => c.isPrimary);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate('/students')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Students
            </Button>

            {/* Student Header */}
            <Card className="card-elevated">
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-3xl">
                            {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-semibold">{student.name}</h1>
                                <StatusBadge variant={student.contractStatus}>{student.contractStatus}</StatusBadge>
                                <StatusBadge variant={student.isPaid ? 'active' : 'pending'}>
                                    {student.isPaid ? 'Paid' : 'Unpaid'}
                                </StatusBadge>
                            </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                        <div>
                                            <span className="data-label">Grade:</span> <span className="data-value">{student.className}</span>
                                        </div>
                                        <div>
                                            <span className="data-label">Born:</span> <span className="data-value">{format(new Date(student.birthDate), 'MMMM d, yyyy')}</span>
                                        </div>
                                        {primaryContact && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                <span className="data-value">{primaryContact.name} ({primaryContact.relation})</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="data-label">Tamo ID:</span>
                                            {student.tamoId ? (
                                                <a
                                                    href={`https://tamo.eu/student/${student.tamoId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                                                >
                                                    {student.tamoId}
                                                    <ExternalLink className="w-3 h-3 opacity-60" />
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Not linked</span>
                                            )}
                                        </div>
                                    </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="medical" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="medical">Medical & Health</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="agreements">Agreements</TabsTrigger>
                    <TabsTrigger value="pickup">Authorized Pickup</TabsTrigger>
                </TabsList>

                {/* Medical & Health Tab */}
                <TabsContent value="medical">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Allergies */}
                        <Card className="card-elevated">
                            <CardHeader>
                                <CardTitle className="text-lg">Allergies</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {student.allergies.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No known allergies</p>
                                ) : (
                                    student.allergies.map(allergy => (
                                        <div key={allergy.id} className="p-3 rounded-lg border bg-card space-y-2">
                                            <div className="flex items-center gap-2">
                                                <SeverityBadge severity={allergy.severity}>{allergy.name}</SeverityBadge>
                                                <span className="text-sm font-medium capitalize">{allergy.severity}</span>
                                            </div>
                                            {allergy.notes && (
                                                <p className="text-sm text-muted-foreground">{allergy.notes}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Health Status */}
                        <Card className="card-elevated">
                            <CardHeader>
                                <CardTitle className="text-lg">Health Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="data-label mb-1">Overall Health</p>
                                    <p className="data-value">{student.healthStatus}</p>
                                </div>
                                {student.medicalSupport && (
                                    <div>
                                        <p className="data-label mb-1">Medical Support</p>
                                        <p className="data-value">{student.medicalSupport}</p>
                                    </div>
                                )}
                                {student.specialEducationNeeds && (
                                    <div>
                                        <p className="data-label mb-1">Special Education Needs</p>
                                        <p className="data-value">{student.specialEducationNeeds}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Emergency Contacts */}
                    <Card className="card-elevated mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.emergencyContacts.map(contact => {
                                    const relation = contact.relation?.toLowerCase() ?? '';
                                    const relationColors: Record<string, string> = {
                                        father:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
                                        mother:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
                                        guardian:'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
                                        sibling: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
                                    };
                                    const badgeClass = relationColors[relation] ?? 'bg-muted text-muted-foreground border-border';

                                    return (
                                        <div key={contact.id} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        <span className="font-semibold text-sm leading-tight">{contact.name}</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold tracking-wide ${badgeClass}`}>
                                                            {contact.relation}
                                                        </span>
                                                        {contact.isPrimary && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md border bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <a
                                                        href={`tel:${contact.phone}`}
                                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                                                    >
                                                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {contact.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents">
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Document Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {student.documentChecklist.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${doc.isComplete ? 'bg-success border-success' : 'border-muted'
                                                }`}>
                                                {doc.isComplete && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <span className="font-medium">{doc.name}</span>
                                        </div>
                                        {doc.dueDate && (
                                            <span className="text-sm text-muted-foreground">
                                                Due: {format(new Date(doc.dueDate), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Agreements Tab */}
                <TabsContent value="agreements">
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Agreements & Consents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {student.agreements.map(agreement => (
                                    <div key={agreement.id} className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="font-medium">{agreement.name}</p>
                                                <p className="text-sm text-muted-foreground capitalize">{agreement.type}</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <StatusBadge variant={agreement.status.includes('allow') ? 'active' : 'pending'}>
                                                    {agreement.status}
                                                </StatusBadge>
                                                {agreement.signedDate && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Signed: {format(new Date(agreement.signedDate), 'MMM d, yyyy')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Authorized Pickup Tab */}
                <TabsContent value="pickup">
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Authorized Pickup Persons</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.authorizedPickup.map(person => {
                                    const relation = person.relation?.toLowerCase() ?? '';
                                    const relationColors: Record<string, string> = {
                                        father:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
                                        mother:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
                                        guardian:'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
                                        sibling: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
                                    };
                                    const badgeClass = relationColors[relation] ?? 'bg-muted text-muted-foreground border-border';

                                    return (
                                        <div key={person.id} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                                            <div className="flex items-start gap-3">
                                                {/* Avatar circle */}
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {/* Name + relation badge on same row */}
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        <span className="font-semibold text-sm leading-tight">{person.name}</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold tracking-wide ${badgeClass}`}>
                                                            {person.relation}
                                                        </span>
                                                    </div>
                                                    {/* Phone — prominent */}
                                                    <a
                                                        href={`tel:${person.phone}`}
                                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                                                    >
                                                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {person.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
