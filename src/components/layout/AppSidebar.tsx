
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, UserCog, FileCheck, Bell, Settings, School, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/staff', label: 'Staff', icon: UserCog },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/compliance', label: 'Compliance', icon: FileCheck },
];

export default function AppSidebar() {
    const location = useLocation();

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
                    <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                        <School className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-sidebar-foreground">School Admin</h1>
                        <p className="text-xs text-sidebar-foreground/60">Core</p>
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
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-sidebar-accent space-y-1">
                <Link to="/notifications" className={cn('nav-link w-full', isActive('/notifications') && 'nav-link-active')}>
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                    <span className="ml-auto bg-sidebar-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        3
                    </span>
                </Link>
                <button className="nav-link w-full">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
}
