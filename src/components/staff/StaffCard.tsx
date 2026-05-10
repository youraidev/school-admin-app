import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Pencil, Briefcase, Clock, FileText, Info, GraduationCap, Award, Settings2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import * as api from '../../lib/api';
import { format } from 'date-fns';
import type { StaffWithDetails, StaffQualification, Certificate, CourseEvaluation, Department, Rank, Position } from '../../../shared/types';
import { RANK_OPTIONS, POSITION_OPTIONS } from '../../../shared/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { QualificationsForm } from '../QualificationsForm';

interface StaffCardProps {
    staffId: string;
}

export default function StaffCard({ staffId }: StaffCardProps) {
    const navigate = useNavigate();
    const [staff, setStaff] = React.useState<StaffWithDetails | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isManageQualificationsOpen, setIsManageQualificationsOpen] = React.useState(false);
    const [qualifications, setQualifications] = React.useState<StaffQualification[]>([]);
    const [suggestions, setSuggestions] = React.useState<{ fields: string[]; institutions: string[] }>({ fields: [], institutions: [] });
    const [isSavingQuals, setIsSavingQuals] = React.useState(false);
    const [isManageCertificatesOpen, setIsManageCertificatesOpen] = React.useState(false);
    const [certificates, setCertificates] = React.useState<Certificate[]>([]);
    const [isSavingCerts, setIsSavingCerts] = React.useState(false);
    const [certsError, setCertsError] = React.useState('');
    const [isManageEvalsOpen, setIsManageEvalsOpen] = React.useState(false);
    const [evals, setEvals] = React.useState<CourseEvaluation[]>([]);
    const [isSavingEvals, setIsSavingEvals] = React.useState(false);
    const [evalsError, setEvalsError] = React.useState('');

    // Edit Profile dialog
    const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
    const [departments, setDepartments] = React.useState<Department[]>([]);
    const [editForm, setEditForm] = React.useState<{
        firstName: string; lastName: string; email: string; role: string;
        department: string; position: Position | ''; rank: Rank | 'none' | '';
        photoUrl: string; startDate: string;
    }>({ firstName: '', lastName: '', email: '', role: '', department: '', position: '', rank: '', photoUrl: '', startDate: '' });
    const [isSavingProfile, setIsSavingProfile] = React.useState(false);
    const [editProfileError, setEditProfileError] = React.useState('');

    React.useEffect(() => {
        async function loadStaff() {
            try {
                const [data, suggs, depts] = await Promise.all([
                    api.getStaffById(staffId),
                    api.getQualificationSuggestions().catch(() => ({ fields: [], institutions: [] })),
                    api.getAllDepartments().catch(() => [] as Department[])
                ]);
                setStaff(data);
                if (data) setQualifications(data.qualifications || []);
                setSuggestions(suggs);
                setDepartments(depts);
            } finally {
                setLoading(false);
            }
        }
        loadStaff();
    }, [staffId]);

    const handleSaveQualifications = async () => {
        if (!staff) return;
        setIsSavingQuals(true);
        try {
            await api.updateStaff(staff.id, {
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                role: staff.role,
                department: staff.department,
                position: staff.position,
                rank: staff.rank,
                startDate: staff.startDate,
                photoUrl: staff.photoUrl,
                qualifications: qualifications,
            });
            setStaff(prev => prev ? { ...prev, qualifications } : null);
            setIsManageQualificationsOpen(false);
        } catch (error) {
            console.error('Failed to save qualifications:', error);
            alert('Failed to save qualifications');
        } finally {
            setIsSavingQuals(false);
        }
    };

    const handleSaveCertificates = async () => {
        if (!staff) return;
        setCertsError('');
        setIsSavingCerts(true);
        try {
            const updated = await api.updateCertificates(staff.id, certificates);
            setStaff(prev => prev ? { ...prev, certificates: updated } : null);
            setIsManageCertificatesOpen(false);
        } catch (error: any) {
            setCertsError(error.message || 'Failed to save certificates');
        } finally {
            setIsSavingCerts(false);
        }
    };

    const addCertificate = () => {
        setCertificates(prev => [...prev, { id: '', staffId: staff?.id || '', name: '', issuer: '', date: new Date().toISOString().split('T')[0] }]);
    };

    const removeCertificate = (index: number) => {
        setCertificates(prev => prev.filter((_, i) => i !== index));
    };

    const updateCertField = (index: number, field: keyof Certificate, value: string) => {
        setCertificates(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    const handleSaveEvals = async () => {
        if (!staff) return;
        setEvalsError('');
        setIsSavingEvals(true);
        try {
            const updated = await api.updateCourseEvaluations(staff.id, evals.map(e => ({
                courseName: e.courseName,
                rating: e.rating,
                feedback: e.feedback,
                date: e.date,
            })));
            setStaff(prev => prev ? { ...prev, courseEvaluations: updated } : null);
            setIsManageEvalsOpen(false);
        } catch (error: any) {
            setEvalsError(error.message || 'Failed to save evaluations');
        } finally {
            setIsSavingEvals(false);
        }
    };

    const addEval = () => {
        setEvals(prev => [...prev, { id: '', staffId: staff?.id || '', courseName: '', rating: 3, date: new Date().toISOString().split('T')[0] }]);
    };

    const removeEval = (index: number) => {
        setEvals(prev => prev.filter((_, i) => i !== index));
    };

    const updateEvalField = (index: number, field: keyof CourseEvaluation, value: string | number) => {
        setEvals(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
    };

    const openEditProfile = () => {
        if (!staff) return;
        setEditForm({
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            role: staff.role,
            department: staff.department,
            position: staff.position || '',
            rank: staff.rank || '',
            photoUrl: staff.photoUrl || '',
            startDate: new Date(staff.startDate).toISOString().split('T')[0],
        });
        setEditProfileError('');
        setIsEditProfileOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!staff) return;
        setEditProfileError('');
        if (!editForm.position) { setEditProfileError('Position is required'); return; }
        setIsSavingProfile(true);
        try {
            await api.updateStaff(staff.id, {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                role: editForm.role,
                department: editForm.department,
                position: editForm.position as Position,
                rank: (editForm.rank && editForm.rank !== 'none') ? editForm.rank as Rank : undefined,
                startDate: editForm.startDate,
                photoUrl: editForm.photoUrl || undefined,
            });
            // Refresh staff data
            const updated = await api.getStaffById(staff.id);
            setStaff(updated);
            setIsEditProfileOpen(false);
        } catch (err: any) {
            setEditProfileError(err.message || 'Failed to save profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/staff')} className="h-8 w-8 rounded-full border bg-white shadow-sm shrink-0">
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Staff Profile</h1>
                        <p className="text-sm text-muted-foreground">View and manage staff information</p>
                    </div>
                </div>
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Loading...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/staff')} className="h-8 w-8 rounded-full border bg-white shadow-sm shrink-0">
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Staff Profile</h1>
                        <p className="text-sm text-muted-foreground">View and manage staff information</p>
                    </div>
                </div>
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Staff member not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl">
            {/* Header section */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/staff')}
                    className="h-8 w-8 rounded-full bg-white border shadow-sm flex items-center justify-center shrink-0 hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Profile</h1>
                    <p className="text-sm text-slate-500">View and manage staff information</p>
                </div>
            </div>

            {/* ── Profile Card ───────────────────────────────────── */}
            <Card className="rounded-2xl border border-slate-200 shadow-lg bg-white overflow-hidden">
                {/* Identity band — soft indigo tint */}
                <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 border-b border-slate-100 px-8 py-6 relative">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-slate-100 shrink-0">
                            {staff.photoUrl ? (
                                <img src={staff.photoUrl} alt={`${staff.firstName} ${staff.lastName}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-3xl">
                                    {staff.firstName.charAt(0)}
                                </div>
                            )}
                        </div>
                        {/* Name + position */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{staff.firstName} {staff.lastName}</h2>
                            <p className="text-base text-indigo-600 font-semibold mt-0.5">{staff.position}</p>
                            {staff.rank && (
                                <span className="inline-flex items-center gap-1.5 mt-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    {staff.rank}
                                </span>
                            )}
                        </div>
                        {/* Edit button */}
                        <Button
                            onClick={openEditProfile}
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-9 flex items-center gap-2 shadow-sm"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Contact ribbon */}
                <div className="px-8 py-4 flex flex-wrap gap-x-6 gap-y-2 bg-white">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {staff.departmentName || staff.department}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Since {format(new Date(staff.startDate), 'MMM d, yyyy')} &middot; {api.calculateTenure(staff.startDate)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {staff.email}
                    </span>
                    {staff.phone && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {staff.phone}
                        </span>
                    )}
                </div>
            </Card>

            {/* Content Tabs */}
            <div className="rounded-2xl border border-slate-200 shadow-md bg-white overflow-hidden">
                <Tabs defaultValue="academic" className="w-full">
                    <div className="border-b border-slate-200 bg-white px-6">
                        <TabsList className="bg-transparent h-auto p-0 border-0 flex justify-start gap-1">
                            <TabsTrigger
                                value="academic"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-3 px-4 text-slate-500 data-[state=active]:text-indigo-700 font-semibold text-sm flex items-center gap-2 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                Academic Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="duties"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-3 px-4 text-slate-500 data-[state=active]:text-indigo-700 font-semibold text-sm flex items-center gap-2 transition-colors"
                            >
                                <Briefcase className="w-4 h-4" />
                                Duties &amp; Responsibilities
                            </TabsTrigger>
                            <TabsTrigger
                                value="emergency"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-3 px-4 text-slate-500 data-[state=active]:text-indigo-700 font-semibold text-sm flex items-center gap-2 transition-colors"
                            >
                                <Info className="w-4 h-4" />
                                Emergency Contact
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Academic tab — clearly differentiated background */}
                    <div className="bg-slate-100 p-6">
                        <TabsContent value="academic" className="m-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                                {/* Left column: Academic Qualifications */}
                                <div className="lg:col-span-5">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                                        {/* Section header */}
                                        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-teal-50 bg-teal-50/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-800">Academic Qualifications</h3>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Manage Qualifications"
                                                className="h-7 w-7 text-slate-400 hover:text-teal-600 hover:bg-teal-100"
                                                onClick={() => {
                                                    setQualifications(staff.qualifications || []);
                                                    setIsManageQualificationsOpen(true);
                                                }}
                                            >
                                                <Settings2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        {/* Items */}
                                        <div className="p-5 space-y-3">
                                            {(!staff.qualifications || staff.qualifications.length === 0) ? (
                                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                                    <p className="text-sm text-slate-400">No qualifications recorded</p>
                                                </div>
                                            ) : (
                                                staff.qualifications.map((qual, i) => (
                                                    <div key={i} className="rounded-xl bg-teal-50 border border-teal-100 p-4 shadow-sm">
                                                        <h4 className="text-sm font-bold text-slate-800 mb-1">{qual.degreeType} {qual.fieldOfStudy ? `in ${qual.fieldOfStudy}` : ''}</h4>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs text-slate-500">{qual.institution}</p>
                                                            {qual.year && (
                                                                <span className="text-xs text-teal-700 font-bold bg-teal-100 px-2.5 py-0.5 rounded-full shrink-0">
                                                                    {qual.year}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Certificates + Evaluations */}
                                <div className="lg:col-span-7 space-y-5">

                                    {/* Certificates sub-card */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                                        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-amber-50 bg-amber-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                                                    <Award className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-800">Certificates</h3>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Manage Certificates"
                                                className="h-7 w-7 text-slate-400 hover:text-amber-600 hover:bg-amber-100"
                                                onClick={() => {
                                                    setCertificates(staff.certificates || []);
                                                    setCertsError('');
                                                    setIsManageCertificatesOpen(true);
                                                }}
                                            >
                                                <Settings2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {staff.certificates.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                                    <p className="text-sm text-slate-400">No certificates on record</p>
                                                </div>
                                            ) : (
                                                staff.certificates.map(cert => (
                                                    <div key={cert.id} className="rounded-xl bg-amber-50 border border-amber-100 p-4 shadow-sm">
                                                        <h4 className="text-sm font-bold text-slate-800 mb-1">{cert.name}</h4>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs text-slate-500">{cert.issuer}</p>
                                                            <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full shrink-0">
                                                                {format(new Date(cert.date), 'MMM yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Course Evaluations sub-card */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                                        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-violet-50 bg-violet-50/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                                                    <Star className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-800">Course Evaluations</h3>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Manage Course Evaluations"
                                                className="h-7 w-7 text-slate-400 hover:text-violet-600 hover:bg-violet-100"
                                                onClick={() => {
                                                    setEvals(staff.courseEvaluations || []);
                                                    setEvalsError('');
                                                    setIsManageEvalsOpen(true);
                                                }}
                                            >
                                                <Settings2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {staff.courseEvaluations.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                                    <p className="text-sm text-slate-400">No evaluations recorded</p>
                                                </div>
                                            ) : (
                                                staff.courseEvaluations.map(evaluation => (
                                                    <div key={evaluation.id} className="rounded-xl bg-violet-50 border border-violet-100 p-4 shadow-sm">
                                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                                            <h4 className="text-sm font-bold text-slate-800">{evaluation.courseName}</h4>
                                                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                                                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {evaluation.rating.toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            {evaluation.feedback ? (
                                                                <p className="text-xs text-slate-500 truncate">{evaluation.feedback}</p>
                                                            ) : <span />}
                                                            <span className="text-xs text-violet-700 font-bold bg-violet-100 px-2.5 py-0.5 rounded-full shrink-0">
                                                                {format(new Date(evaluation.date), 'MMM d, yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="duties" className="m-0 focus-visible:outline-none">
                            <div className="space-y-4 max-w-2xl">
                                <h3 className="section-title">Assigned Duties</h3>
                                {staff.extraDuties.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                                        <p className="text-sm text-slate-500">No extra duties assigned</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {staff.extraDuties.map(duty => (
                                            <div key={duty.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                    <Briefcase className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-900">{duty.dutyName}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="emergency" className="m-0 focus-visible:outline-none">
                            <div className="space-y-4 max-w-4xl">
                                <h3 className="section-title">Emergency Contacts</h3>
                                {staff.emergencyContacts.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                                        <p className="text-sm text-slate-500">No emergency contacts on file</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {staff.emergencyContacts.map(contact => (
                                            <div key={contact.id} className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-base font-bold text-slate-900">{contact.name}</h4>
                                                        {contact.isPrimary && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 mb-4">{contact.relation}</p>
                                                </div>
                                                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                                                    </div>
                                                    <p className="text-sm font-medium font-mono text-slate-800">{contact.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <Dialog open={isManageQualificationsOpen} onOpenChange={setIsManageQualificationsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manage Qualifications</DialogTitle>
                        <DialogDescription>
                            Edit the academic qualifications and certifications for this staff member.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <QualificationsForm
                            qualifications={qualifications}
                            onChange={setQualifications}
                            suggestions={suggestions}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManageQualificationsOpen(false)} disabled={isSavingQuals}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveQualifications} disabled={isSavingQuals}>
                            {isSavingQuals ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Certificates Dialog */}
            <Dialog open={isManageCertificatesOpen} onOpenChange={setIsManageCertificatesOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            Manage Certificates
                        </DialogTitle>
                        <DialogDescription>
                            Add, edit, or remove certificates for this staff member.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-3">
                        {certificates.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-6">No certificates added yet. Click below to add one.</p>
                        )}
                        {certificates.map((cert, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-400 shadow-sm overflow-hidden">
                                {/* Card header */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-3.5 h-3.5 text-amber-600" />
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Certificate {i + 1}</p>
                                    </div>
                                    <button
                                        onClick={() => removeCertificate(i)}
                                        className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                                {/* Fields */}
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Certificate Name *</label>
                                        <input
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                                            placeholder="e.g. First Aid and CPR"
                                            value={cert.name}
                                            onChange={e => updateCertField(i, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Issuer *</label>
                                        <input
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                                            placeholder="e.g. Red Cross"
                                            value={cert.issuer}
                                            onChange={e => updateCertField(i, 'issuer', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Date Issued *</label>
                                        <input
                                            type="date"
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                                            value={cert.date}
                                            onChange={e => updateCertField(i, 'date', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">File URL (optional)</label>
                                        <input
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                                            placeholder="https://..."
                                            value={cert.fileUrl || ''}
                                            onChange={e => updateCertField(i, 'fileUrl', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addCertificate}
                            className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-200 text-sm font-semibold text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-colors"
                        >
                            + Add Certificate
                        </button>
                        {certsError && <p className="text-sm text-red-600">{certsError}</p>}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManageCertificatesOpen(false)} disabled={isSavingCerts}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCertificates} disabled={isSavingCerts}>
                            {isSavingCerts ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Course Evaluations Dialog */}
            <Dialog open={isManageEvalsOpen} onOpenChange={setIsManageEvalsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-violet-600" />
                            Manage Course Evaluations
                        </DialogTitle>
                        <DialogDescription>
                            Add, edit, or remove course evaluations for this staff member.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-3">
                        {evals.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-6">No evaluations added yet. Click below to add one.</p>
                        )}
                        {evals.map((ev, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-violet-400 shadow-sm overflow-hidden">
                                {/* Card header */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-violet-50 border-b border-violet-100">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-3 h-3 text-violet-600" />
                                        <p className="text-xs font-bold text-violet-800 uppercase tracking-wider">Evaluation {i + 1}</p>
                                    </div>
                                    <button
                                        onClick={() => removeEval(i)}
                                        className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                                {/* Fields */}
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Course Name *</label>
                                        <input
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
                                            placeholder="e.g. Physical Education – Grade 6"
                                            value={ev.courseName}
                                            onChange={e => updateEvalField(i, 'courseName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Rating (0–5) *</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.1}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
                                            value={ev.rating}
                                            onChange={e => updateEvalField(i, 'rating', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Date *</label>
                                        <input
                                            type="date"
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
                                            value={ev.date}
                                            onChange={e => updateEvalField(i, 'date', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Feedback (optional)</label>
                                        <textarea
                                            rows={2}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none transition"
                                            placeholder="Brief feedback about the course..."
                                            value={ev.feedback || ''}
                                            onChange={e => updateEvalField(i, 'feedback', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addEval}
                            className="w-full py-2.5 rounded-xl border-2 border-dashed border-violet-200 text-sm font-semibold text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-colors"
                        >
                            + Add Evaluation
                        </button>
                        {evalsError && <p className="text-sm text-red-600">{evalsError}</p>}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManageEvalsOpen(false)} disabled={isSavingEvals}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEvals} disabled={isSavingEvals}>
                            {isSavingEvals ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-indigo-600" />
                            Edit Profile
                        </DialogTitle>
                        <DialogDescription>Update the staff member's profile information.</DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-4">
                        {editProfileError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{editProfileError}</p>
                        )}

                        {/* Name */}
                        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-400 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
                                <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Personal Info</p>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">First Name *</Label>
                                    <Input className="bg-slate-50 focus:bg-white focus-visible:ring-indigo-300 border-slate-200"
                                        value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} placeholder="e.g. Kristina" />
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Last Name *</Label>
                                    <Input className="bg-slate-50 focus:bg-white focus-visible:ring-indigo-300 border-slate-200"
                                        value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} placeholder="e.g. Balčiūnienė" />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Email *</Label>
                                    <Input type="email" className="bg-slate-50 focus:bg-white focus-visible:ring-indigo-300 border-slate-200"
                                        value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} placeholder="e.g. k.example@school.lt" />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Photo URL</Label>
                                    <Input type="url" className="bg-slate-50 focus:bg-white focus-visible:ring-indigo-300 border-slate-200"
                                        value={editForm.photoUrl} onChange={e => setEditForm(p => ({ ...p, photoUrl: e.target.value }))} placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        {/* Employment */}
                        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-400 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
                                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Employment</p>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Role *</Label>
                                    <Input className="bg-slate-50 focus:bg-white focus-visible:ring-indigo-300 border-slate-200"
                                        value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Principal" />
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Department *</Label>
                                    <Select value={editForm.department} onValueChange={v => setEditForm(p => ({ ...p, department: v }))}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-300"><SelectValue placeholder="Select department" /></SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Position <span className="text-slate-400 font-normal">(Job Role)</span> *</Label>
                                    <Select value={editForm.position} onValueChange={v => setEditForm(p => ({ ...p, position: v as Position }))}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-300"><SelectValue placeholder="Select position" /></SelectTrigger>
                                        <SelectContent>
                                            {POSITION_OPTIONS.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Rank <span className="text-slate-400 font-normal">(Seniority)</span></Label>
                                    <Select value={editForm.rank} onValueChange={v => setEditForm(p => ({ ...p, rank: v as Rank | 'none' }))}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-300"><SelectValue placeholder="Select rank (optional)" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" className="text-slate-400 italic">None</SelectItem>
                                            {RANK_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 mb-1 block">Start Date *</Label>
                                    <Input type="date" className="bg-slate-50 focus:bg-white focus-visible:ring-indigo-300 border-slate-200"
                                        value={editForm.startDate} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} disabled={isSavingProfile}>Cancel</Button>
                        <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
