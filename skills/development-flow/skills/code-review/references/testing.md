# Lens: testing

Prefer integration tests over unit tests. Find where this repo keeps its integration tests and what harness or fixtures they use before judging anything.

Changes to behaviour MUST add an integration test:
- List the major logic changes and user-facing behaviours in the diff that need a test.
- For each, name the test that covers it, or report it as uncovered with file and line.
- Edge cases count. A happy-path test alone is a finding.

If unit tests are warranted, they belong in the repo's dedicated test files, following its naming convention. Avoid test-only functions or branches in the main implementation.

Check whether existing test helpers would make the new tests shorter and more readable, and flag tests that reimplement them.

Flag tests that pin implementation details rather than behaviour, and tests edited to pass instead of code fixed.
