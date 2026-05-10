import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import * as api from '../lib/api';
import type { Department } from '../../shared/types';

export default function DepartmentsPage() {
    const navigate = useNavigate();
    const [departments, setDepartments] = React.useState<Department[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    const loadDepartments = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getAllDepartments();
            setDepartments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load departments');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteError(null);

        try {
            setIsDeleting(true);
            await api.deleteDepartment(deleteId);
            setDepartments(prev => prev.filter(d => d.id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete department');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Departments</h1>
                    <p className="text-muted-foreground mt-1">Manage school departments and their descriptions</p>
                </div>
                <Button onClick={() => navigate('/departments/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Departments Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                    <Card key={dept.id} className="card-elevated hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">
                                {dept.name}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                    {dept.staffCount || 0} Staff
                                </span>
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {dept.description && (
                                <CardDescription className="line-clamp-2 text-xs mt-1">
                                    {dept.description}
                                </CardDescription>
                            )}

                            <div className="flex justify-end gap-1 mt-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => navigate(`/departments/${dept.id}/edit`)}
                                >
                                    <Pencil className="w-4 h-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                        setDeleteError(null);
                                        setDeleteId(dept.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {departments.length === 0 && !error && (
                <div className="text-center py-12 text-muted-foreground">
                    No departments found. Create one to get started.
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the department.
                            You cannot delete a department if it has staff members assigned to it.
                        </DialogDescription>
                    </DialogHeader>

                    {deleteError && (
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                            {deleteError}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
