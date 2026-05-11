# Project Philosophy & Design Principles

Core values that guide every decision in this project.  
These apply to all contributors, including AI agents.

---

## Philosophy

> Clarity, explicitness, and long-term maintainability over cleverness.  
> Predictable, transparent solutions over hidden magic.

- Code must be **boring, predictable, and explicit**
- Architecture must be **stable and intentional**, not accidental
- Business logic must be **cleanly separated** from UI, API, and infrastructure
- Every decision must improve **readability, testability, and maintainability**

---

## Architectural Principles

| Principle | Rule |
|-----------|------|
| **Separation of Concerns** | UI, API, domain logic, and data access stay clearly separated |
| **Explicitness over Implicitness** | No hidden defaults, no magic, all behaviour visible in code |
| **Consistency over Novelty** | Follow established patterns; new features match existing style |
| **Predictable Data Flow** | Data moves in clear, traceable paths — avoid unnecessary indirection |
| **Stable Domain Boundaries** | Domain models are well-defined; cross-domain coupling is minimised |

---

## Decision Trade-offs

When trade-offs arise, prefer:

```
Maintainability  > Performance   (unless performance is critical)
Explicitness     > Magic
Predictability   > Cleverness
Consistency      > Novelty
Stability        > Innovation    (unless explicitly requested)
```

---

## Anti-Patterns — Not Allowed Without Approval

- Hidden side effects or silent error handling
- Implicit global state
- Overly generic or "smart" abstractions that hide complexity
- Tight coupling between domain modules
- Mixing domain logic with UI or API layers
- Introducing new libraries without approval

---

## Evolution & Change

- **Architectural changes** require explicit approval before implementation
- **Refactors** must preserve domain boundaries and follow the spec
- **New features** must comply with existing spec and principles
- **The `/spec` folder is the authoritative source of truth** — if the codebase conflicts with it, the spec wins

---

## Long-Term Vision

This system is designed to:

- Scale across multiple organisations
- Maintain strict permission boundaries and tenant isolation
- Support predictable, auditable data access patterns
- Be easy to extend without breaking existing behaviour
- Remain maintainable as the team and codebase grow
- Avoid architectural drift over time

---

## AI Agent Responsibilities

An AI agent working on this project must:

- Follow all principles in this document and all rules in `/spec`
- Maintain consistency across the codebase
- Avoid introducing unnecessary complexity
- Ask for approval before architectural or structural changes
- List improvement suggestions under **"Suggested Improvements"** — never apply them automatically
- Surface spec conflicts clearly — never deviate silently
- Explain reasoning transparently
