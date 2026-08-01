
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Users, UserCog, FileCheck, Bell, Settings, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

const navItems = [
    { to: '/', labelKey: 'nav.dashboard', icon: Home },
    { to: '/students', labelKey: 'nav.students', icon: Users },
    { to: '/staff', labelKey: 'nav.staff', icon: UserCog },
    { to: '/departments', labelKey: 'nav.departments', icon: Building2 },
    { to: '/compliance', labelKey: 'nav.compliance', icon: FileCheck },
] as const;

export default function AppSidebar() {
    const location = useLocation();
    const { t } = useTranslation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-accent flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-accent">
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src="/logo-mark.svg"
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 object-contain"
                    />
                    <div>
                        <h1 className="text-lg font-semibold text-sidebar-foreground">{t('appName')}</h1>
                        <p className="text-xs text-sidebar-foreground/60">{t('appTagline')}</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to);

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={cn(
                                'nav-link',
                                active && 'nav-link-active'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{t(item.labelKey)}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-sidebar-accent space-y-1">
                <Link to="/notifications" className={cn('nav-link w-full', isActive('/notifications') && 'nav-link-active')}>
                    <Bell className="w-5 h-5" />
                    <span>{t('nav.notifications')}</span>
                    <span className="ml-auto bg-sidebar-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        3
                    </span>
                </Link>
                <LanguageSwitcher />
                <button className="nav-link w-full">
                    <Settings className="w-5 h-5" />
                    <span>{t('nav.settings')}</span>
                </button>
            </div>
        </div>
    );
}
