import { useTranslation } from 'react-i18next';
import type { Rank, Position, DegreeType } from '../../shared/types';

// DB stores the canonical English enum values; these maps turn them into
// translation keys. Unknown/legacy values fall back to the raw stored string.

const RANK_KEYS: Record<Rank, string> = {
    'Assistant Teacher': 'assistant_teacher',
    'Teacher': 'teacher',
    'Senior Teacher': 'senior_teacher',
    'Lead Teacher': 'lead_teacher',
    'Master Teacher': 'master_teacher',
    'Department Head': 'department_head',
    'Vice Principal': 'vice_principal',
    'Principal': 'principal',
};

const POSITION_KEYS: Record<Position, string> = {
    'Teacher': 'teacher',
    'PE Teacher': 'pe_teacher',
    'Math Teacher': 'math_teacher',
    'English Teacher': 'english_teacher',
    'Science Teacher': 'science_teacher',
    'History Teacher': 'history_teacher',
    'Arts Teacher': 'arts_teacher',
    'Librarian': 'librarian',
    'Counselor': 'counselor',
    'Special Education Teacher': 'special_education_teacher',
    'Admin': 'admin',
    'Principal': 'principal',
    'Other': 'other',
};

const DEGREE_KEYS: Record<DegreeType, string> = {
    'Diploma in Education': 'diploma_education',
    'Bachelor of Education (B.Ed)': 'bed',
    'Bachelor’s Degree': 'bachelors',
    'PGDE / PGCE': 'pgde',
    'Master of Education (M.Ed)': 'med',
    'Master’s Degree': 'masters',
    'Doctor of Education (Ed.D)': 'edd',
    'PhD': 'phd',
    'Teaching License': 'teaching_license',
    'QTS': 'qts',
    'Montessori Certification': 'montessori',
    'Special Education Certification': 'special_education_cert',
    'TESOL / TEFL': 'tesol',
    'IB Teacher Certification': 'ib',
};

/** Translates data-level enum values (stored in the DB in English) for display. */
export function useLabels() {
    const { t } = useTranslation('common');
    // Keys are assembled dynamically, so bypass the strictly-typed overload once here
    const tr = t as unknown as (key: string, options?: Record<string, unknown>) => string;

    const fromMap = (prefix: string, map: Record<string, string>, value: string | null | undefined): string => {
        if (!value) return '';
        const key = map[value];
        return key ? tr(`${prefix}.${key}`) : value;
    };

    return {
        rank: (value: string | null | undefined) => fromMap('ranks', RANK_KEYS, value),
        position: (value: string | null | undefined) => fromMap('positions', POSITION_KEYS, value),
        degree: (value: string | null | undefined) => fromMap('degrees', DEGREE_KEYS, value),
        contractStatus: (value: string) => tr(`status.${value}`, { defaultValue: value }),
        severity: (value: string) => tr(`severity.${value}`, { defaultValue: value }),
        healthStatus: (value: string) => tr(`healthStatus.${value}`, { defaultValue: value }),
        relation: (value: string | null | undefined) =>
            value ? tr(`relations.${value.toLowerCase()}`, { defaultValue: value }) : '',
    };
}
