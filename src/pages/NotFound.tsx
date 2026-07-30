import * as React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="text-4xl font-semibold mb-2">404</h1>
            <p className="text-lg text-muted-foreground mb-8">{t('notFoundPage.message')}</p>
            <Button asChild>
                <Link to="/">{t('notFoundPage.returnHome')}</Link>
            </Button>
        </div>
    );
}
