import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enStudents from '../locales/en/students.json';
import enStaff from '../locales/en/staff.json';
import enDepartments from '../locales/en/departments.json';
import enCompliance from '../locales/en/compliance.json';
import enNotifications from '../locales/en/notifications.json';
import enErrors from '../locales/en/errors.json';

import ltCommon from '../locales/lt/common.json';
import ltAuth from '../locales/lt/auth.json';
import ltDashboard from '../locales/lt/dashboard.json';
import ltStudents from '../locales/lt/students.json';
import ltStaff from '../locales/lt/staff.json';
import ltDepartments from '../locales/lt/departments.json';
import ltCompliance from '../locales/lt/compliance.json';
import ltNotifications from '../locales/lt/notifications.json';
import ltErrors from '../locales/lt/errors.json';

export const defaultNS = 'common';

export const SUPPORTED_LANGUAGES = ['en', 'lt'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
    en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        students: enStudents,
        staff: enStaff,
        departments: enDepartments,
        compliance: enCompliance,
        notifications: enNotifications,
        errors: enErrors,
    },
    lt: {
        common: ltCommon,
        auth: ltAuth,
        dashboard: ltDashboard,
        students: ltStudents,
        staff: ltStaff,
        departments: ltDepartments,
        compliance: ltCompliance,
        notifications: ltNotifications,
        errors: ltErrors,
    },
} as const;
