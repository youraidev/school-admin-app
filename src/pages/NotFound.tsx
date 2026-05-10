import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="text-4xl font-semibold mb-2">404</h1>
            <p className="text-lg text-muted-foreground mb-8">Page not found</p>
            <Button asChild>
                <Link to="/">Return to Dashboard</Link>
            </Button>
        </div>
    );
}
