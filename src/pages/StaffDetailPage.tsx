import * as React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StaffCard from '../components/staff/StaffCard';

export default function StaffDetailPage() {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <Navigate to="/staff" replace />;
    }

    return <StaffCard staffId={id} />;
}
