# UI Guidelines Specification

## 1. Design System

The project uses **Tailwind CSS** with a custom configuration and **Radix UI** primitive components wrapped in a local `/src/components/ui/` library.

### 1.1 Colour Palette

Defined in `tailwind.config.js`. The project uses a CSS variable-driven colour system:

```css
/* Primary */
--primary: hsl(222.2 47.4% 11.2%)

/* Accent */
--accent: hsl(210 40% 96.1%)

/* Semantic */
--destructive: hsl(0 100% 50%)
--muted: hsl(210 40% 96.1%)
--border: hsl(214.3 31.8% 91.4%)
```

**Rule:** Do not hard-code hex colours in component classes. Always use the design token variables (`bg-primary`, `text-muted-foreground`, etc.).

### 1.2 Typography

| Usage | Class |
|-------|-------|
| Page title | `text-2xl font-bold` |
| Section heading | `text-xl font-semibold` |
| Card heading | `text-lg font-medium` |
| Body | `text-sm` |
| Caption / meta | `text-xs text-muted-foreground` |

### 1.3 Spacing

Follow Tailwind's scale:
- Component padding: `p-4` or `p-6`
- Section gap: `gap-4` to `gap-6`
- Tight spacing (e.g. icon + label): `gap-2`

---

## 2. Component Library

All base UI components live in `src/components/ui/`. They wrap Radix UI primitives.

| Component | File | Usage |
|-----------|------|-------|
| `Button` | `button.tsx` | All interactive buttons. Props: `variant`, `size` |
| `Input` | `input.tsx` | Text inputs |
| `Label` | `label.tsx` | Form field labels |
| `Select` | `select.tsx` | Dropdown selects (Radix) |
| `Card` | `card.tsx` | Content containers: `Card`, `CardHeader`, `CardContent`, `CardTitle` |
| `Dialog` | `dialog.tsx` | Modal dialogs (Radix) |
| `Tabs` | `tabs.tsx` | Tabbed content (Radix) |
| `Badge` | `badge.tsx` | Status/type pills |
| `Avatar` | `avatar.tsx` | Staff/student profile photos |
| `Progress` | `progress.tsx` | Completion bars |
| `Separator` | `separator.tsx` | Horizontal dividers |
| `StatusBadge` | `status-badge.tsx` | Contract status indicator |
| `SeverityBadge` | `severity-badge.tsx` | Allergy severity indicator |

**Rule:** Never use raw HTML `<button>`, `<select>`, or `<input>` in feature components. Always use the wrappers from `components/ui/`.

---

## 3. Component Structure

### 3.1 Pages
Pages live in `src/pages/`. They are thin orchestrators: they fetch data and pass it to feature components.

```tsx
// Good pattern
export default function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    // fetch, loading, error state
    return <StaffList staff={staff} loading={loading} />;
}
```

**Rule:** Pages must NOT contain complex UI logic inline. Extract into named components.

### 3.2 Feature Components
Live in `src/components/<domain>/`. Examples:
- `components/staff/StaffCard.tsx`
- `components/staff/StaffList.tsx`
- `components/compliance/...`

### 3.3 Layout Components
Live in `src/components/layout/`:
- `AppLayout.tsx` — the authenticated shell with sidebar + `<Outlet />`

---

## 4. Page Layout Pattern

```
AppLayout (sidebar + header)
  └── <Outlet />
        ├── Page heading (h1)
        ├── Action bar (buttons, filters)
        └── Content (cards / table / list)
```

### 4.1 Page heading rules
- Every page has exactly **one `<h1>`**
- Pattern: `<h1 className="text-2xl font-bold">{pageTitle}</h1>`
- Action buttons go in a flex row to the right of the heading

### 4.2 Empty states
Every list view must handle the empty state with a clear message. No blank whitespace.

```tsx
if (items.length === 0) {
    return <div className="text-center text-muted-foreground py-12">No items found.</div>;
}
```

### 4.3 Loading states
Use a spinner or skeleton, never an empty render.

```tsx
if (loading) return <div className="text-center py-8">Loading...</div>;
```

---

## 5. Forms

### 5.1 Field validation
Validate on submit. Show field-level errors below each input using:
```tsx
<p className="text-sm text-destructive mt-1">{error.field}</p>
```

### 5.2 Submit state
Disable the submit button while loading:
```tsx
<Button type="submit" disabled={loading}>
    {loading ? 'Saving...' : 'Save'}
</Button>
```

### 5.3 Required fields
Mark required fields with `*` in the label:
```tsx
<Label>First Name <span className="text-destructive">*</span></Label>
```

---

## 6. Routing

Defined in `src/App.tsx` using React Router v6.

| Path | Auth | Component |
|------|------|-----------|
| `/login` | Public | `LoginPage` |
| `/forgot-password` | Public | `ForgotPasswordPage` |
| `/reset-password` | Public | `ResetPasswordPage` |
| `/` | ✅ Auth | `Index` (Dashboard) |
| `/students` | ✅ Auth | `StudentsPage` |
| `/students/:id` | ✅ Auth | `StudentDetailPage` |
| `/staff` | ✅ Auth | `StaffPage` |
| `/staff/new` | ✅ Auth | `AddStaffPage` |
| `/staff/:id` | ✅ Auth | `StaffDetailPage` |
| `/staff/:id/edit` | ✅ Auth | `EditStaffPage` |
| `/departments` | ✅ Auth | `DepartmentsPage` |
| `/departments/new` | ✅ Auth | `AddDepartmentPage` |
| `/departments/:id/edit` | ✅ Auth | `EditDepartmentPage` |
| `/compliance` | ✅ Auth | `CompliancePage` |

**Rule:** All routes under `RequireAuth` redirect to `/login` if the JWT is missing/expired.

---

## 7. Data Fetching Pattern (Current)

Currently uses `useEffect` + `useState`:

```tsx
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
    apiFunction()
        .then(setData)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
}, []);
```

**Desired:** Migrate to TanStack Query:

```tsx
const { data, isLoading, error } = useQuery({
    queryKey: ['staff', schoolId],
    queryFn: getAllStaff,
});
```

---

## 8. Error Handling

The frontend `ApiError` class carries `status` and `message`. Always surface:
- API validation errors (`400`) as form-level errors
- Conflict errors (`409`) as inline alerts
- Server errors (`500`) as a generic toast/banner

**Rule:** Never swallow errors silently. Every `catch` block must either show UI feedback or rethrow.

---

## 9. Accessibility

- Every form `<input>` MUST have an associated `<label>` via `htmlFor`
- Interactive elements must be keyboard-navigable
- Icon-only buttons MUST have `aria-label`
- Colour is never the only indicator of status (use text + colour)
