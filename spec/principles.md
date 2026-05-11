# Project Philosophy & Design Principles

Core values that guide every decision in this project. These apply to all contributors.

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

---

## Long-Term Vision

This system is designed to scale across multiple organisations, maintain strict tenant isolation, remain easy to extend without breaking existing behaviour, and avoid architectural drift over time.
