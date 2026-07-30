import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import * as api from '../lib/api';
import { useTranslation } from 'react-i18next';
import { getErrorCode, useErrorMessage } from '../i18n/errors';

export default function EditDepartmentPage() {
    const { t } = useTranslation('departments');
    const { t: tc } = useTranslation('common');
    const errorMessage = useErrorMessage();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadDepartment = async () => {
            if (!id) return;
            try {
                const dept = await api.getDepartmentById(id);
                if (dept) {
                    setFormData({
                        name: dept.name,
                        description: dept.description || '',
                    });
                } else {
                    setError('DEPARTMENT_NOT_FOUND');
                }
            } catch (err) {
                setError(getErrorCode(err));
            } finally {
                setIsLoading(false);
            }
        };
        loadDepartment();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setError(null);
        setIsSubmitting(true);

        try {
            await api.updateDepartment(id, {
                name: formData.name,
                description: formData.description,
            });

            navigate('/departments');
        } catch (err) {
            setError(getErrorCode(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!id || (error && !formData.name)) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/departments')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-3xl font-semibold tracking-tight">{tc('states.error')}</h1>
                </div>
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                    {error ? errorMessage(error) : t('invalidId')}
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
                    onClick={() => navigate('/departments')}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{t('editPage.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('editPage.subtitle')}</p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="card-elevated max-w-2xl">
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
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('fields.name')}</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder={t('fields.namePlaceholder')}
                                    required
                                    disabled={isSubmitting}
                                    maxLength={100}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('fields.nameHint')}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">{t('fields.description')}</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder={t('fields.descriptionPlaceholder')}
                                    disabled={isSubmitting}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('fields.descriptionHint')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/departments')}
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
