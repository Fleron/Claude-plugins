---
paths:
  - "**/*.py"
  - "**/pyproject.toml"
  - "**/setup.py"
  - "**/setup.cfg"
---

# Python Standards

## Code Style

- Follow PEP 8 style conventions.
- Use `pathlib` over `os.path`, f-strings over `.format()`, `dataclasses` or `pydantic` models where appropriate.
- Use context managers for resource management.
- Prefer `enum` over magic strings or constants scattered across files.
- Use the latest Python idioms and features appropriate to the project's Python version.
- Prefer standard library solutions over third-party dependencies when reasonable.

## Documentation

- Every module must have a module-level docstring explaining its purpose and responsibility.
- Every public function and class must have a clear docstring describing what it does, its parameters, return values, and any exceptions it may raise.
- Use type hints consistently on all function signatures.
- Do not add comments that merely restate the code. Comments should explain the reasoning, not the mechanics.

## Testing

- Quality over quantity. A single well-crafted test that exercises the full workflow is more valuable than ten shallow unit tests.
- Prefer integration-style tests that validate real behavior over mocking everything away.
- Test the contract and behavior, not implementation details.
- Cover edge cases and error paths, not just the happy path.
- Test names should describe the scenario and expected outcome clearly.
