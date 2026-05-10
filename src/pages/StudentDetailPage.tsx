import * as React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StudentCard from '../components/students/StudentCard';

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <Navigate to="/students" replace />;
    }

    return <StudentCard studentId={id} />;
}
