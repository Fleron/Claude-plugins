# Code quality cheks related to frontend
**Frontend-Specific:** ONLY for Frontend related. 
1. **Component size** — Flag components > 200 lines. Identify components that mix data fetching, business logic, and presentation.
2. **State management** — Is state lifted to the appropriate level? Flag prop drilling > 3 levels. Flag global state used for local concerns.
3. **Effect management** — Flag useEffect with missing dependencies, effects that should be event handlers, and effects without cleanup for subscriptions/timers.
4. **Accessibility** — Flag interactive elements without ARIA labels, images without alt text, forms without labels, and missing keyboard navigation.

**Boundary Safety** See [reference/boundary-safety.md](reference/boundary-safety.md):
5. **Framework abstraction misuse** — Flag `<Link>` / `navigate()` / router-based navigation targeting API routes, external URLs, OAuth endpoints, or file downloads. These need raw `<a href>` or `window.location`.
6. **Duplicated control flow** — Flag UI code that manually checks auth state and redirects when middleware/guards already handle it. Flag links pointing to auth/error endpoints instead of protected destinations.
7. **Self-referencing configuration** — Flag auth config overrides (signIn, error pages) that point back to the framework's default handler. Compare override values against known defaults.
8. **Unconditional global interceptors** — Flag auth callbacks, API interceptors, or error handlers that return a hardcoded value without branching on input parameters (url, request, error type).
9. **Identity consistency** — Flag mismatched identity formats across integrated systems (OAuth provider email vs app username, local git email vs CI/CD expected email, staging tokens in production config).
10. **Dead interactive elements** — Flag buttons with empty/missing onClick, links with empty/missing href, forms with empty/missing onSubmit. Every interactive element that renders MUST be wired to a real action. Dead elements are Critical findings.
11. **Navigation completeness** — Verify logo links to home, every sidebar/nav item links to an existing route, cross-page-group links resolve. Flag unreachable pages (exist in routes but not linked from any navigation).
