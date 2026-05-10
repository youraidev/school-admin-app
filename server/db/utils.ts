export function toCamelCase<T>(obj: unknown): T {
    if (!obj) return obj as T;
    if (Array.isArray(obj)) return obj.map(toCamelCase) as T;
    if (typeof obj !== 'object') return obj as T;

    const result: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
        result[camelKey] = (obj as Record<string, unknown>)[key];
    }
    return result as T;
}
