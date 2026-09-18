# Lens: change size

Unless the change is mechanical, the total number of changed lines should not exceed 800.
For complex logic changes the size should be under 500 lines.

Report the actual counts from the diff, separating mechanical lines (renames, generated files, formatting, lockfiles) from logic.

If the change is larger, explain whether it can be split into reviewable stages and identify the smallest coherent stage to land first.
Base the staging suggestion on the actual diff, dependencies and affected call sites.
