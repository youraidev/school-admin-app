import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '../ui/dropdown-menu';

// "k.balciuniene@school.lt" → "KB", "arturas@youraidev.eu" → "A"
function emailInitials(email: string): string {
    return email
        .split('@')[0]
        .split(/[._-]/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
}

export default function UserMenu() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    if (!user) return null;

    const roleLabels: Record<string, string> = {
        school_admin: t('roles.school_admin'),
        super_admin: t('roles.super_admin'),
        staff: t('roles.staff'),
    };
    const roleLabel = roleLabels[user.role] ?? user.role;
    const initials = emailInitials(user.email);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="nav-link w-full data-[state=open]:bg-sidebar-accent"
                    aria-label={user.email}
                >
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-sidebar-primary text-white text-xs font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 min-w-0 text-left leading-tight">
                        <span className="block truncate text-sm font-medium">{user.email}</span>
                        <span className="block truncate text-xs text-sidebar-foreground/60">{roleLabel}</span>
                    </span>
                    <ChevronsUpDown className="w-4 h-4 flex-shrink-0 opacity-50" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 leading-tight">
                        <span className="block truncate text-sm font-medium">{user.email}</span>
                        <span className="block truncate text-xs text-muted-foreground">{roleLabel}</span>
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled title={t('states.comingSoon')}>
                    <Settings className="w-4 h-4" />
                    {t('nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={logout}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <LogOut className="w-4 h-4" />
                    {t('account.signOut')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
