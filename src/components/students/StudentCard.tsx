import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Phone, ExternalLink, User, CheckCircle2, Clock, CalendarDays, FileText, HeartPulse, ShieldAlert, Stethoscope, BookOpen, PhoneCall } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { StatusBadge } from '../ui/status-badge';
import { SeverityBadge } from '../ui/severity-badge';
import { PickupPersonCard, RELATION_COLORS } from './PickupPersonCard';
import * as api from '../../lib/api';
import { getErrorCode, useErrorMessage } from '../../i18n/errors';
import { useLabels } from '../../i18n/labels';
import { formatDate } from '../../i18n/format';
import type { StudentWithDetails } from '../../../shared/types';

interface StudentCardProps {
    studentId: string;
}

export default function StudentCard({ studentId }: StudentCardProps) {
    const { t } = useTranslation('students');
    const { t: tc } = useTranslation('common');
    const errorMessage = useErrorMessage();
    const labels = useLabels();
    const navigate = useNavigate();
    const [student, setStudent] = React.useState<StudentWithDetails | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadStudent() {
            try {
                const data = await api.getStudentById(studentId);
                setStudent(data);
            } catch (err) {
                setError(getErrorCode(err));
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
                    {t('detail.back')}
                </Button>
                <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">{tc('states.loading')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Button variant="ghost" onClick={() => navigate('/students')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('detail.back')}
                </Button>
                <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                        <p className="text-destructive">{errorMessage(error)}</p>
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
                    {t('detail.back')}
                </Button>
                <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">{t('detail.notFound')}</p>
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
                {t('detail.back')}
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
                                <StatusBadge variant={student.contractStatus}>{labels.contractStatus(student.contractStatus)}</StatusBadge>
                                <StatusBadge variant={student.isPaid ? 'active' : 'pending'}>
                                    {student.isPaid ? tc('status.paid') : tc('status.unpaid')}
                                </StatusBadge>
                            </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                        <div>
                                            <span className="data-label">{t('detail.grade')}</span> <span className="data-value">{student.className}</span>
                                        </div>
                                        <div>
                                            <span className="data-label">{t('detail.born')}</span> <span className="data-value">{formatDate(student.birthDate, 'MMMM d, yyyy')}</span>
                                        </div>
                                        {primaryContact && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                <span className="data-value">{primaryContact.name} ({labels.relation(primaryContact.relation)})</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="data-label">{t('detail.tamoId')}</span>
                                            {student.tamoId ? (
                                                <a
                                                    href={`https://tamo.eu/student/${encodeURIComponent(student.tamoId)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                                                >
                                                    {student.tamoId}
                                                    <ExternalLink className="w-3 h-3 opacity-60" />
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">{tc('states.notLinked')}</span>
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
                    <TabsTrigger value="medical">{t('tabs.medical')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('tabs.documents')}</TabsTrigger>
                    <TabsTrigger value="agreements">{t('tabs.agreements')}</TabsTrigger>
                    <TabsTrigger value="pickup">{t('tabs.pickup')}</TabsTrigger>
                </TabsList>

                {/* Medical & Health Tab */}
                <TabsContent value="medical">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Allergies */}
                        <Card className="card-elevated overflow-hidden">
                            <CardHeader className="pb-4 border-b border-border/60">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                                        <ShieldAlert className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{t('allergies.title')}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {student.allergies.length === 0 ? t('allergies.none') : t('allergies.recorded', { count: student.allergies.length })}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {student.allergies.length === 0 ? (
                                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">{t('allergies.noneOnRecord')}</div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {student.allergies.map(allergy => {
                                            const isLifeThreatening = allergy.severity === 'life-threatening';
                                            return (
                                                <div key={allergy.id} className={`px-5 py-3.5 flex flex-col gap-1.5 ${isLifeThreatening ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                                                    <div className="flex items-center gap-2.5">
                                                        <SeverityBadge severity={allergy.severity}>{allergy.name}</SeverityBadge>
                                                        <span className="text-xs text-muted-foreground font-medium">{labels.severity(allergy.severity)}</span>
                                                    </div>
                                                    {allergy.notes && (
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{allergy.notes}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Health Status */}
                        <Card className="card-elevated overflow-hidden">
                            <CardHeader className="pb-4 border-b border-border/60">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <HeartPulse className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{t('health.title')}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">{t('health.overview')}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/50">
                                    <div className="px-5 py-3.5 flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Stethoscope className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{t('health.overall')}</p>
                                            <p className="text-sm font-semibold text-foreground">{labels.healthStatus(student.healthStatus)}</p>
                                        </div>
                                    </div>
                                    {student.medicalSupport && (
                                        <div className="px-5 py-3.5 flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{t('health.medicalSupport')}</p>
                                                <p className="text-sm font-semibold text-foreground">{student.medicalSupport}</p>
                                            </div>
                                        </div>
                                    )}
                                    {student.specialEducationNeeds && (
                                        <div className="px-5 py-3.5 flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{t('health.specialEducationNeeds')}</p>
                                                <p className="text-sm font-semibold text-foreground">{student.specialEducationNeeds}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Emergency Contacts */}
                    <Card className="card-elevated mt-6 overflow-hidden">
                        <CardHeader className="pb-4 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                                    <PhoneCall className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{t('contacts.title')}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('contacts.onFile', { count: student.emergencyContacts.length })}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.emergencyContacts.map(contact => {
                                    const relation = contact.relation?.toLowerCase() ?? '';
                                    const badgeClass = RELATION_COLORS[relation] ?? 'bg-muted text-muted-foreground border-border';
                                    const initials = contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                                    return (
                                        <div key={contact.id} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                {/* Avatar with initials */}
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-primary">{initials}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        <span className="font-semibold text-sm leading-tight">{contact.name}</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold tracking-wide ${badgeClass}`}>
                                                            {labels.relation(contact.relation)}
                                                        </span>
                                                        {contact.isPrimary && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md border bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                                                                {tc('states.primary')}
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
                    <Card className="card-elevated overflow-hidden">
                        <CardHeader className="pb-4 border-b border-border/60">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{t('documents.title')}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {t('documents.progress', {
                                                completed: student.documentChecklist.filter(d => d.isComplete).length,
                                                total: student.documentChecklist.length,
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    student.documentChecklist.every(d => d.isComplete)
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                                }`}>
                                    {student.documentChecklist.every(d => d.isComplete) ? t('documents.allComplete') : t('documents.pendingItems')}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {student.documentChecklist.map(doc => (
                                    <div key={doc.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                                        doc.isComplete ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : 'bg-card hover:bg-muted/30'
                                    }`}>
                                        {/* Status icon */}
                                        <div className="flex-shrink-0">
                                            {doc.isComplete
                                                ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                : <Clock className="w-5 h-5 text-muted-foreground/40" />
                                            }
                                        </div>

                                        {/* Name */}
                                        <span className={`flex-1 text-sm font-medium ${doc.isComplete ? 'text-foreground' : 'text-foreground/80'}`}>
                                            {doc.name}
                                        </span>

                                        {/* Status chip */}
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                            doc.isComplete
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {doc.isComplete ? t('documents.submitted') : tc('status.pending')}
                                        </span>

                                        {/* Due date */}
                                        {doc.dueDate && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[110px] justify-end">
                                                <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{formatDate(doc.dueDate, 'MMM d, yyyy')}</span>
                                            </div>
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
                            <CardTitle className="text-lg">{t('agreements.title')}</CardTitle>
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
                                                        {t('agreements.signed', { date: formatDate(agreement.signedDate, 'MMM d, yyyy') })}
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
                            <CardTitle className="text-lg">{t('pickup.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.authorizedPickup.map(person => (
                                    <PickupPersonCard
                                        key={person.id}
                                        person={person}
                                        studentId={student.id}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
