import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { useLabels } from '../i18n/labels';
import type { StaffQualification, DegreeType } from '../../shared/types';

export const DEGREE_TYPES_GROUPED = [
    {
        labelKey: 'degreeGroups.degrees' as const,
        options: [
            'Diploma in Education',
            'Bachelor of Education (B.Ed)',
            'Bachelor’s Degree',
            'PGDE / PGCE',
            'Master of Education (M.Ed)',
            'Master’s Degree',
            'Doctor of Education (Ed.D)',
            'PhD'
        ] as DegreeType[]
    },
    {
        labelKey: 'degreeGroups.certifications' as const,
        options: [
            'Teaching License',
            'QTS',
            'Montessori Certification',
            'Special Education Certification',
            'TESOL / TEFL',
            'IB Teacher Certification'
        ] as DegreeType[]
    }
];

interface QualificationsFormProps {
    qualifications: StaffQualification[];
    onChange: (qualifications: StaffQualification[]) => void;
    suggestions: { fields: string[]; institutions: string[] };
}

export function QualificationsForm({ qualifications, onChange, suggestions }: QualificationsFormProps) {
    const { t } = useTranslation('staff');
    const { t: tc } = useTranslation('common');
    const labels = useLabels();
    const [expandedIndices, setExpandedIndices] = React.useState<number[]>([]);

    const toggleExpand = (index: number) => {
        setExpandedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleAdd = () => {
        const newQual: StaffQualification = {
            degreeType: 'Bachelor’s Degree', // Default starting value
            fieldOfStudy: '',
            institution: '',
            year: new Date().getFullYear(),
        };
        const newArray = [...qualifications, newQual];
        onChange(newArray);
        // Auto-expand the new item
        setExpandedIndices(prev => [...prev, newArray.length - 1]);
    };

    const handleRemove = (index: number) => {
        onChange(qualifications.filter((_, i) => i !== index));
        setExpandedIndices(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    const handleClear = (index: number) => {
        const updated = [...qualifications];
        updated[index] = {
            degreeType: updated[index].degreeType, // Keep type roughly
            fieldOfStudy: '',
            institution: '',
            year: new Date().getFullYear(),
        };
        onChange(updated);
    };

    const handleChange = (index: number, field: keyof StaffQualification, value: any) => {
        const updated = [...qualifications];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    // Calculate currently invalid years
    const validateYear = (year: number | null) => {
        if (year === null) return true;
        return year >= 1950 && year <= 2100;
    };

    return (
        <div className="space-y-3">

            <div className="space-y-3">
                {qualifications.map((qual, index) => {
                    const isExpanded = expandedIndices.includes(index);
                    const isYearValid = validateYear(qual.year);

                    // Generate summary
                    const summary = [
                        qual.degreeType ? labels.degree(qual.degreeType) : t('qualifications.summaryDegree'),
                        qual.fieldOfStudy || t('qualifications.summaryField'),
                        qual.year || t('qualifications.summaryYear')
                    ].join(' — ');

                    return (
                        <div key={index} className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-teal-400 shadow-sm overflow-hidden">
                            {/* Header / Summary */}
                            <div
                                className="flex items-center justify-between px-4 py-2.5 bg-teal-50 border-b border-teal-100 cursor-pointer hover:bg-teal-100/60 transition-colors"
                                onClick={() => toggleExpand(index)}
                            >
                                <div className="flex items-center gap-2.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">{t('qualifications.itemTitle', { number: index + 1 })}</span>
                                    <span className="text-xs text-teal-700 font-medium truncate max-w-[260px]">&mdash; {summary}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        className="text-red-400 hover:text-red-600 transition-colors p-0.5"
                                        onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                                        title={tc('actions.remove')}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-teal-500" /> : <ChevronDown className="h-4 w-4 text-teal-400" />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="p-5 border-t border-teal-100 bg-white">
                                    <div className="grid gap-4 md:grid-cols-2">

                                        <div className="grid gap-2">
                                            <Label className="text-xs font-medium text-slate-500">{t('qualifications.degreeType')}</Label>
                                            <Select
                                                value={qual.degreeType}
                                                onValueChange={(val: DegreeType) => handleChange(index, 'degreeType', val)}
                                            >
                                                <SelectTrigger className="bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-300 border-slate-200">
                                                    <SelectValue placeholder={t('qualifications.selectType')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DEGREE_TYPES_GROUPED.map(group => (
                                                        <SelectGroup key={group.labelKey}>
                                                            <SelectLabel>{tc(group.labelKey)}</SelectLabel>
                                                            {group.options.map(opt => (
                                                                <SelectItem key={opt} value={opt}>{labels.degree(opt)}</SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="text-xs font-medium text-slate-500">{t('qualifications.fieldOfStudy')}</Label>
                                            <div className="relative">
                                                <Input
                                                    value={qual.fieldOfStudy}
                                                    onChange={(e) => handleChange(index, 'fieldOfStudy', e.target.value)}
                                                    placeholder={t('qualifications.fieldPlaceholder')}
                                                    list={`fields-of-study-list-${index}`}
                                                    className="bg-slate-50 focus:bg-white focus-visible:ring-teal-300 border-slate-200"
                                                />
                                                <datalist id={`fields-of-study-list-${index}`}>
                                                    {suggestions.fields.map(f => <option key={f} value={f} />)}
                                                </datalist>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="text-xs font-medium text-slate-500">{t('qualifications.institution')}</Label>
                                            <div className="relative">
                                                <Input
                                                    value={qual.institution}
                                                    onChange={(e) => handleChange(index, 'institution', e.target.value)}
                                                    placeholder={t('qualifications.institutionPlaceholder')}
                                                    list={`institutions-list-${index}`}
                                                    className="bg-slate-50 focus:bg-white focus-visible:ring-teal-300 border-slate-200"
                                                />
                                                <datalist id={`institutions-list-${index}`}>
                                                    {suggestions.institutions.map(i => <option key={i} value={i} />)}
                                                </datalist>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="text-xs font-medium text-slate-500">{t('qualifications.year')}</Label>
                                            <Input
                                                type="number"
                                                value={qual.year || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleChange(index, 'year', val ? parseInt(val, 10) : null);
                                                }}
                                                placeholder={t('qualifications.yearPlaceholder')}
                                                min={1950}
                                                max={2100}
                                                className={`bg-slate-50 focus:bg-white focus-visible:ring-teal-300 border-slate-200 ${!isYearValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                            />
                                            {!isYearValid && (
                                                <span className="text-xs text-destructive">{t('qualifications.yearInvalid')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="button"
                                            onClick={() => handleClear(index)}
                                            className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
                                        >
                                            {tc('actions.clearFields')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleAdd}
                className="w-full mt-1 py-2.5 rounded-xl border-2 border-dashed border-teal-200 text-sm font-semibold text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-colors flex items-center justify-center gap-1.5"
            >
                <Plus className="h-4 w-4" />
                {t('qualifications.addQualification')}
            </button>

            {qualifications.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                    {t('qualifications.emptyHint')}
                </p>
            )}
        </div>
    );
}
