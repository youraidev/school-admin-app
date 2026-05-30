import * as React from 'react';
import { Phone, User, Pencil, X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import * as api from '../../lib/api';
import type { AuthorizedPerson } from '../../../shared/types';

const NOTES_MAX = 500;

const RELATION_COLORS: Record<string, string> = {
    father:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    mother:   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    guardian: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
    sibling:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
};

interface Props {
    person: AuthorizedPerson;
    studentId: string;
}

export function PickupPersonCard({ person, studentId }: Props) {
    const badgeClass = RELATION_COLORS[person.relation?.toLowerCase() ?? ''] ?? 'bg-muted text-muted-foreground border-border';

    // --- local state ---
    const [isEditing, setIsEditing]   = React.useState(false);
    const [savedNote, setSavedNote]   = React.useState(person.notes ?? '');
    const [draftValue, setDraftValue] = React.useState(person.notes ?? '');
    const [isSaving, setIsSaving]     = React.useState(false);
    const [saveError, setSaveError]   = React.useState<string | null>(null);

    function openEdit() {
        setDraftValue(savedNote);
        setSaveError(null);
        setIsEditing(true);
    }

    function cancelEdit() {
        setIsEditing(false);
        setSaveError(null);
    }

    async function handleSave() {
        setIsSaving(true);
        setSaveError(null);
        try {
            await api.updatePickupNotes(studentId, person.id, draftValue);
            setSavedNote(draftValue);
            setIsEditing(false);
        } catch (err) {
            const msg = err instanceof api.ApiError ? err.message : 'Failed to save. Please try again.';
            setSaveError(msg);
        } finally {
            setIsSaving(false);
        }
    }

    const showNotesSection = savedNote.length > 0 || isEditing;

    return (
        <div className="rounded-xl border bg-card hover:shadow-sm transition-shadow flex flex-col">
            {/* ── Person header ── */}
            <div className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-sm leading-tight">{person.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold tracking-wide ${badgeClass}`}>
                            {person.relation}
                        </span>
                    </div>
                    <a
                        href={`tel:${person.phone}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {person.phone}
                    </a>
                </div>
            </div>

            {/* ── Notes section (only when note exists or editing) ── */}
            {showNotesSection && (
                <div className="border-t border-border/40 px-4 pb-4 pt-3">
                    {isEditing ? (
                        /* Edit mode */
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                                Important Note
                            </label>
                            <textarea
                                rows={3}
                                maxLength={NOTES_MAX}
                                value={draftValue}
                                onChange={e => setDraftValue(e.target.value)}
                                placeholder="e.g. Authorized to pick up on Fridays only. Must show valid ID."
                                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed overflow-y-auto"
                                autoFocus
                            />
                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs tabular-nums ${draftValue.length >= NOTES_MAX ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {draftValue.length}/{NOTES_MAX}
                                </span>
                                {saveError && (
                                    <span className="text-xs text-destructive flex-1 text-right">{saveError}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelEdit}
                                    disabled={isSaving}
                                    className="h-8 px-3"
                                >
                                    <X className="w-3.5 h-3.5 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="h-8 px-4"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    ) : null}
                                    {isSaving ? 'Saving…' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Read mode — note exists */
                        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 flex items-start gap-2.5 group">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
                                    Important Note
                                </p>
                                <p className="text-sm text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                                    {savedNote}
                                </p>
                            </div>
                            <button
                                onClick={openEdit}
                                aria-label="Edit note"
                                className="ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                            >
                                <Pencil className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Add note affordance (no note, not editing) ── */}
            {!showNotesSection && (
                <button
                    onClick={openEdit}
                    className="w-full border-t border-border/40 px-4 py-3 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors rounded-b-xl"
                >
                    + Add important note
                </button>
            )}
        </div>
    );
}
