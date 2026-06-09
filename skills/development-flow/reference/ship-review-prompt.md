# Ship review prompt (verbatim — dispatch to each reviewer)

> Do an analysis of the code we wrote. Use `git diff`. Files are not committed —
> that will be done by the human when we are certain there are no issues or
> comments. Verify and ensure we do not have any critical errors, issues, or
> showstoppers that can or will cause crashes or unexpected behavior under diverse
> circumstances. Also check that we don't have duplicated code, and whether any
> code really should be cleaned up or refactored. Also check whether there are
> potential performance issues that really should be optimized. Note that I have
> tested the feature and everything works as expected as far as I have tested —
> but there may be a gap between simple testing and real-world or edge cases.
> I want to ship this now. If you find anything we MUST fix, then propose simple
> solutions. You are only allowed to analyze and read code, not change it in any
> way.
