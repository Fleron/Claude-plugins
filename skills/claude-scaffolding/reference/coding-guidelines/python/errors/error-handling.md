This comprehensive guideline outlines best practices for error handling and logging in Python, drawing on modern methodologies, architectural patterns, and the **Loguru** library.

## 1. Philosophical Approaches to Error Handling

* **Prioritize EAFP over LBYL:** In Python, the **"Easier to Ask Forgiveness than Permission" (EAFP)** style is generally preferred over "Look Before You Leap" (LBYL). Instead of checking for conditions that might fail (which can lead to race conditions and complex logic), you should attempt the action and handle potential exceptions.
* **Design for Idempotency:** Ensure operations are **idempotent**, meaning performing them multiple times produces the same result as performing them once. This is critical for reliable data recovery and redundancy, allowing failed operations to be safely re-executed without side effects or data corruption.
* **Distinguish Assertions from Error Handling:** Use `assert` statements strictly for **testing and development**, not for production error handling. Assertions check for conditions expected to be true; if they fail, the application crashes, which is undesirable in production code.

## 2. Error Classification and Handling Strategies

Errors should be categorized by their **origin** (New vs. Bubbled-up) and their **severity** (Recoverable vs. Non-recoverable).

### The Four Types of Error Handling

1. **Type 1: New Recoverable Errors:** When your code finds an error it can fix internally, simply **correct the state and continue** without raising an exception.
2. **Type 2: Bubbled-Up Recoverable Errors:** When a called function raises an exception that you know how to fix, use a `try/except` block to **recover from the error and continue**.
3. **Type 3: New Non-Recoverable Errors:** If your code encounters a severe issue it cannot fix, **raise an appropriate exception** (built-in like `ValueError` or a custom subclass) to alert the caller.
4. **Type 4: Bubbled-Up Non-Recoverable Errors:** If a called function fails and you have no way to fix it, the best strategy is often to **do nothing**. This allows the error to "bubble up" to a higher level that has more context to handle it.

### Catching Exceptions

* **Avoid Catching All Exceptions:** Except at the highest level of an application, catching all exceptions is a bad practice because it can **silence bugs** and make debugging difficult. Always catch the smallest possible list of specific exception classes.
* **High-Level Catch-All:** The only place to catch all exceptions (`except Exception:`) is at the **top layer** of your application (e.g., in the CLI entry point or web framework handler) to prevent the program from crashing and to log the final error message.

## 3. Best Practices for Logging Errors

Effective logging is essential for debugging production failures where stack traces might otherwise be lost.

* **Use Descriptive Stack Traces:** When logging an error, use `logger.exception()` rather than `logger.error()`. This ensures the **entire stack trace** is recorded, which is the most important tool for identifying root causes.
* **Log Variable Values:** Modern logging tools like **Loguru** can display the values of variables within the stack trace, providing immediate context for why a function failed.
* **Structured Logging:** For applications where logs are processed by other systems, use **structured logging** (e.g., serializing logs to JSON) to make them easier to parse and analyze.
* **Leverage Automatic Catching:** Use decorators like `@logger.catch` to ensure that any error—including those occurring in threads—is correctly **propagated and logged** without requiring manual `try/except` boilerplate for every function.

## 4. Modern Tooling for Error Prevention

* **Runtime Validation with Pydantic:** Use **Pydantic** to enforce type annotations through **runtime validation**. This ensures that once data enters your system, it is in the correct format, preventing many common runtime errors.
* **Static Type Checking:** Use **Mypy** to verify type consistency **before execution**. This catches potential bugs and inconsistencies that would otherwise only manifest as errors during runtime.
* **Fast Linting with Ruff:** Implement **Ruff** to detect anti-patterns and style violations that could lead to errors. Use it via IDE extensions or pre-commit hooks to catch issues during the development phase.

## 5. Environment-Specific Behavior

* **Development vs. Production:** Configure your error handling to behave differently based on the environment. In **development**, it is often better to let the application crash and show a full stack trace to aid fixing bugs. In **production**, the application should be "rock solid," catching runaway exceptions at the top level to log them and exit gracefully without leaking private details to users.
* **Retries and Robustness:** Tools like **uv** demonstrate robustness by automatically retrying failed operations, such as package uploads, while handling potential race conditions. Ensure your own network-dependent code implements similar **retry logic** for transient failures.
