import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import * as api from '../../lib/api';

interface AddStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStaffAdded?: () => void;
}

export function AddStaffDialog({ open, onOpenChange, onStaffAdded }: AddStaffDialogProps) {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        role: '',
        department: '',
        rank: '',
        startDate: '',
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await api.addStaff({
                name: formData.name,
                email: formData.email,
                role: formData.role,
                department: formData.department,
                rank: formData.rank || undefined,
                startDate: formData.startDate,
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                role: '',
                department: '',
                rank: '',
                startDate: '',
            });

            // Close dialog
            onOpenChange(false);

            // Notify parent to refresh
            if (onStaffAdded) {
                onStaffAdded();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add staff member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new staff member below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Dr. Kristina Balčiūnienė"
                                required
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

                        <div className="grid grid-cols-2 gap-4">
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
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    placeholder="e.g., Administration"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="rank">Rank</Label>
                                <Input
                                    id="rank"
                                    value={formData.rank}
                                    onChange={(e) => handleChange('rank', e.target.value)}
                                    placeholder="e.g., Expert"
                                    disabled={isSubmitting}
                                />
                            </div>

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
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Staff Member'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
