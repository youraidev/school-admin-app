import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Filter, Building2, Pencil, GraduationCap } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import * as api from '../../lib/api';
import { getErrorCode, useErrorMessage } from '../../i18n/errors';
import type { Staff } from '../../../shared/types';

export default function StaffList() {
    const { t } = useTranslation('staff');
    const { t: tc } = useTranslation('common');
    const errorMessage = useErrorMessage();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [staffMembers, setStaffMembers] = React.useState<Staff[]>([]);
    const [departments, setDepartments] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const loadData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [staffData, deptData] = await Promise.all([
                api.getAllStaff(),
                api.getAllDepartments()
            ]);
            setStaffMembers(staffData);

            // Create a lookup map for departments
            const deptMap: Record<string, string> = {};
            deptData.forEach(dept => {
                deptMap[dept.id] = dept.name;
            });
            setDepartments(deptMap);
        } catch (err) {
            setError(getErrorCode(err));
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredStaff = staffMembers.filter(staff => {
        const deptName = departments[staff.department] || staff.department;
        return `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deptName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Group staff by department name
    const staffByDepartment = filteredStaff.reduce((acc, staff) => {
        const deptName = departments[staff.department] || staff.department;
        if (!acc[deptName]) {
            acc[deptName] = [];
        }
        acc[deptName].push(staff);
        return acc;
    }, {} as Record<string, Staff[]>);

    // Get seniority level badge
    const getSeniorityBadge = (rank: string) => {
        const rankLower = rank.toLowerCase();
        if (rankLower.includes('expert') || rankLower.includes('principal') || rankLower.includes('director')) {
            return { label: tc('seniority.expert'), color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        } else if (rankLower.includes('senior')) {
            return { label: tc('seniority.senior'), color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
        } else if (rankLower.includes('specialist')) {
            return { label: tc('seniority.specialist'), color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' };
        } else {
            return { label: tc('seniority.teacher'), color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
        }
    };



    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{tc('states.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-destructive mt-1">{errorMessage(error)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
                </div>
                <Button onClick={() => navigate('/staff/new')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('addStaff')}
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    {tc('actions.filters')}
                </Button>
            </div>

            {/* Staff List Grouped by Department */}
            <div className="space-y-6">
                {Object.entries(staffByDepartment).map(([department, staff]) => (
                    <div key={department} className="space-y-3">
                        {/* Department Header */}
                        <div className="flex items-center gap-2 list-section-title mb-1">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                            <span>{department}</span>
                        </div>

                        {/* Staff Cards */}
                        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {staff.map((member, index) => {
                                const seniority = getSeniorityBadge(member.rank || '');

                                return (
                                    <li
                                        key={member.id}
                                        className="relative col-span-1 rounded-lg bg-card shadow-card border animate-slide-in group hover:shadow-md transition-all flex"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <Link
                                            to={`/staff/${member.id}`}
                                            className="flex flex-1 items-start justify-between p-6 h-full"
                                        >
                                            <div className="flex flex-1 items-center space-x-4 min-w-0 pr-8">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-background border bg-muted text-foreground font-semibold text-base">
                                                    {member.photoUrl ? (
                                                        <img
                                                            src={member.photoUrl}
                                                            alt={`${member.firstName} ${member.lastName}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="text-sm font-semibold text-foreground truncate">
                                                            {member.firstName} {member.lastName}
                                                        </h3>
                                                        <span className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[0.625rem] font-medium leading-[14px] whitespace-nowrap ${seniority.color}`}>
                                                            <GraduationCap className="w-3 h-3 mr-1" />
                                                            {seniority.label}
                                                        </span>
                                                    </div>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(`/staff/${member.id}/edit`);
                                            }}
                                            className="absolute top-6 right-6 p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            <span className="sr-only">{tc('actions.edit')}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {filteredStaff.length === 0 && (
                    <Card className="card-elevated">
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">{t('empty')}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
