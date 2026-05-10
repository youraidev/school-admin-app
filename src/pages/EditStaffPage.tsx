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
import type { Department, Rank, Position } from '../../shared/types';
import { RANK_OPTIONS, POSITION_OPTIONS } from '../../shared/types';

export default function EditStaffPage() {
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
                    setError('Staff member not found');
                }
            } catch (err) {
                setError('Failed to load staff details');
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
            setError('Position is required');
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
            setError(err instanceof Error ? err.message : 'Failed to update staff member');
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
                    <h1 className="text-3xl font-semibold tracking-tight">Error</h1>
                </div>
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                    {error || 'Invalid staff ID'}
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
                    <h1 className="text-3xl font-semibold tracking-tight">Edit Staff Member</h1>
                    <p className="text-muted-foreground mt-1">Update details for {formData.firstName} {formData.lastName}</p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="card-elevated max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Staff Information</CardTitle>
                    <CardDescription>
                        Update the necessary fields. Correct formatting is required.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        placeholder="e.g., Kristina"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        placeholder="e.g., Balčiūnienė"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="photoUrl">Photo URL</Label>
                                <Input
                                    id="photoUrl"
                                    value={formData.photoUrl}
                                    onChange={(e) => handleChange('photoUrl', e.target.value)}
                                    placeholder="e.g., https://example.com/photo.jpg"
                                    type="url"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="e.g., k.balciuniene@school.lt"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Input
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => handleChange('role', e.target.value)}
                                        placeholder="e.g., Principal"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="department">Department *</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => handleChange('department', value)}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <SelectTrigger id="department">
                                            <SelectValue placeholder="Select department" />
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
                                        <Label htmlFor="position" className="m-0">Position *</Label>
                                        <span className="text-xs text-slate-500 font-normal" title="What the teacher does (e.g. Math Teacher)">(Job Role)</span>
                                    </div>
                                    <Select
                                        value={formData.position}
                                        onValueChange={(value) => handleChange('position', value)}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <SelectTrigger id="position">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POSITION_OPTIONS.map((pos) => (
                                                <SelectItem key={pos} value={pos}>
                                                    {pos}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Label htmlFor="rank" className="m-0">Rank</Label>
                                        <span className="text-xs text-slate-500 font-normal" title="Their seniority level (e.g. Senior Teacher)">(Seniority)</span>
                                    </div>
                                    <Select
                                        value={formData.rank}
                                        onValueChange={(value) => handleChange('rank', value)}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger id="rank">
                                            <SelectValue placeholder="Select rank (Optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" className="text-muted-foreground italic">None</SelectItem>
                                            {RANK_OPTIONS.map((rank) => (
                                                <SelectItem key={rank} value={rank}>
                                                    {rank}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
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
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
