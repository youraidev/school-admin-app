import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
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
                                {student.emergencyContacts.map(contact => (
                                    <div key={contact.id} className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium flex items-center gap-2">
                                                    📞 {contact.name}
                                                    {contact.isPrimary && (
                                                        <StatusBadge variant="info">Primary</StatusBadge>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{contact.relation}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-mono">{contact.phone}</p>
                                    </div>
                                ))}
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
                                {student.authorizedPickup.map(person => (
                                    <div key={person.id} className="p-4 rounded-lg border bg-card">
                                        <p className="font-medium">{person.name}</p>
                                        <p className="text-sm text-muted-foreground mb-2">{person.relation}</p>
                                        <p className="text-sm font-mono">{person.phone}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
