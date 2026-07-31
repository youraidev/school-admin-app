import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import * as api from '../lib/api';
import { useTranslation } from 'react-i18next';
import { getErrorCode, useErrorMessage } from '../i18n/errors';
import { useLabels } from '../i18n/labels';
import type { Department, Rank, Position } from '../../shared/types';
import { RANK_OPTIONS, POSITION_OPTIONS } from '../../shared/types';

export default function EditStaffPage() {
    const { t } = useTranslation('staff');
    const { t: tc } = useTranslation('common');
    const errorMessage = useErrorMessage();
    const labels = useLabels();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = React.useState<{
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        department: string;
        position: Position | '';
        rank: Rank | 'none' | '';
        photoUrl: string;
        startDate: string;
    }>({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        department: '',
        position: '',
        rank: '',
        photoUrl: '',
        startDate: '',
    });

    const [departments, setDepartments] = React.useState<Department[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                // Load departments and staff data in parallel
                const [deptData, staffData] = await Promise.all([
                    api.getAllDepartments(),
                    api.getStaffById(id)
                ]);

                setDepartments(deptData);

                if (staffData) {
                    setFormData({
                        firstName: staffData.firstName || '',
                        lastName: staffData.lastName || '',
                        email: staffData.email,
                        role: staffData.role,
                        department: staffData.department,
                        position: staffData.position || '',
                        rank: staffData.rank || '',
                        photoUrl: staffData.photoUrl || '',
                        startDate: new Date(staffData.startDate).toISOString().split('T')[0],
                    });
                } else {
                    setError('STAFF_NOT_FOUND');
                }
            } catch (err) {
                setError(getErrorCode(err));
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setError(null);

        if (!formData.position) {
            setError('POSITION_REQUIRED');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.updateStaff(id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: formData.role,
                department: formData.department,
                position: formData.position as Position,
                rank: (formData.rank && formData.rank !== 'none') ? (formData.rank as Rank) : undefined,
                startDate: formData.startDate,
                // Qualifications are omitted from standard profile edit payload now
                photoUrl: formData.photoUrl || undefined,
            });

            navigate(`/staff/${id}`);
        } catch (err) {
            setError(getErrorCode(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!id || (error && !formData.firstName)) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/staff/${id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-3xl font-semibold tracking-tight">{tc('states.error')}</h1>
                </div>
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                    {errorMessage(error || 'STAFF_NOT_FOUND')}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/staff/${id}`)}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{t('editPage.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('editPage.subtitle', { name: `${formData.firstName} ${formData.lastName}` })}</p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="card-elevated max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{t('addPage.cardTitle')}</CardTitle>
                    <CardDescription>
                        {t('editPage.cardDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                {errorMessage(error)}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">{t('fields.firstName')}</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        placeholder={t('fields.firstNamePlaceholder')}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">{t('fields.lastName')}</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        placeholder={t('fields.lastNamePlaceholder')}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="photoUrl">{t('fields.photoUrl')}</Label>
                                <Input
                                    id="photoUrl"
                                    value={formData.photoUrl}
                                    onChange={(e) => handleChange('photoUrl', e.target.value)}
                                    placeholder={t('fields.photoUrlPlaceholder')}
                                    type="url"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('fields.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder={t('fields.emailPlaceholder')}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="role">{t('fields.role')}</Label>
                                    <Input
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => handleChange('role', e.target.value)}
                                        placeholder={t('fields.rolePlaceholder')}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="department">{t('fields.department')}</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => handleChange('department', value)}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <SelectTrigger id="department">
                                            <SelectValue placeholder={t('fields.selectDepartment')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Label htmlFor="position" className="m-0">{t('fields.position')}</Label>
                                        <span className="text-xs text-slate-500 font-normal" title={t('fields.positionTooltip')}>{t('fields.positionHint')}</span>
                                    </div>
                                    <Select
                                        value={formData.position}
                                        onValueChange={(value) => handleChange('position', value)}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <SelectTrigger id="position">
                                            <SelectValue placeholder={t('fields.selectPosition')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POSITION_OPTIONS.map((pos) => (
                                                <SelectItem key={pos} value={pos}>
                                                    {labels.position(pos)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Label htmlFor="rank" className="m-0">{t('fields.rank')}</Label>
                                        <span className="text-xs text-slate-500 font-normal" title={t('fields.rankTooltip')}>{t('fields.rankHint')}</span>
                                    </div>
                                    <Select
                                        value={formData.rank}
                                        onValueChange={(value) => handleChange('rank', value)}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger id="rank">
                                            <SelectValue placeholder={t('fields.selectRank')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" className="text-muted-foreground italic">{tc('states.none')}</SelectItem>
                                            {RANK_OPTIONS.map((rank) => (
                                                <SelectItem key={rank} value={rank}>
                                                    {labels.rank(rank)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">{t('fields.startDate')}</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleChange('startDate', e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Qualifications form removed from standard edit staff flow */}
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/staff/${id}`)}
                                disabled={isSubmitting}
                            >
                                {tc('actions.cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? tc('actions.saving') : tc('actions.saveChanges')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
