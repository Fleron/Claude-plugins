This guideline outlines best practices for logging in Python, with a specific focus on the **Loguru** library, which aims to make logging "enjoyable" and powerful while eliminating the boilerplate of the standard `logging` module.

## 1. Core Philosophy of Modern Logging

* **Avoid "Logging Hell":** The standard Python `logging` module often requires complex configurations involving formatters, handlers, and mysterious percentage symbols. Loguru provides a "zero configuration" alternative that works out of the box.
* **Logging as a Debugging Tool:** Logging is fundamental for debugging production systems where you cannot attach a live debugger. The most important tool in these sessions is the **stack trace**, which provides the necessary context to identify root causes.
* **Structured over Unstructured:** While human-readable logs are great for development, production logs should ideally be **serialized (e.g., to JSON)** for easier parsing by log management systems.

## 2. Getting Started with Loguru

Loguru replaces the traditional logger instantiation with a single, pre-configured object.

* **Quick Start:** To begin logging, simply import the global `logger` object: `from loguru import logger`. You can immediately use levels like `logger.debug()`, `logger.info()`, or `logger.warning()`.
* **The Power of `add()`:** Instead of managing multiple handlers and formatters, Loguru uses the `add()` function to register "sinks" (destinations like files, `stderr`, or even custom functions).
* **Modern Formatting:** Loguru uses **brace-style formatting** (similar to `str.format()` or f-strings) rather than the older `%` style. It also provides **beautiful, colorful output** automatically if your terminal is compatible.

## 3. Advanced File Management

One of Loguru's most practical features is its built-in management of log files to prevent them from consuming all available disk space.

* **Rotation:** Automatically start a new log file based on size (e.g., `rotation="500 MB"`), time (e.g., `rotation="12:00"` for daily logs), or age (e.g., `rotation="1 week"`).
* **Retention:** Keep your log directory clean by specifying how long to keep files: `retention="10 days"`.
* **Compression:** Save space by automatically zipping logs upon rotation: `compression="zip"`.

## 4. Exception Handling and Stack Traces

Effective error logging requires more than just a message; it requires context.

* **The `@logger.catch` Decorator:** This is a "safety net" for functions. It ensures that any unexpected error—even those occurring in **threads**—is caught and logged with a full stack trace without requiring manual `try/except` blocks.
* **Descriptive Exceptions:** Loguru can display the **values of variables** within the stack trace, making it immediately clear why a failure occurred (e.g., showing that a divisor was `0` in a `ZeroDivisionError`).
* **Log Exceptions Correcty:** When catching a known exception, use `logger.exception("Message")` rather than `logger.error()`. This automatically appends the current stack trace to the log entry.

## 5. Structured and Contextual Logging

For complex applications, you often need to attach metadata to every log message.

* **Binding Context:** Use `logger.bind(key="value")` to create a local logger instance that includes specific metadata (like a user ID or IP address) in every subsequent message.
* **Contextualization:** Use the `contextualize()` context manager to temporarily modify the state for a specific block of code, which is useful for tracking tasks or request IDs.
* **Lazy Evaluation:** For expensive debug information that you don't want to calculate in production, use `logger.opt(lazy=True)` to only execute a function if the log level is actually being recorded.

## 6. Integration and Best Practices

* **Library Usage:** If you are developing a library, use `logger.disable("my_library")`. This makes the logging calls no-ops by default so you don't clutter the user's console. Users can then `enable()` it if they need to debug your library.
* **Standard Library Compatibility:** Loguru can be used alongside the standard `logging` module. You can use standard `Handlers` as Loguru sinks, or use an `InterceptHandler` to redirect all standard library logs into your Loguru sinks.
* **Production Robustness:** In production, use `enqueue=True` in your `add()` calls. This ensures that logging is **thread-safe, multiprocess-safe, and asynchronous**, preventing logging calls from blocking your application's main logic.
* **Security Warning:** While `diagnose=True` (which shows variable values in traces) is helpful for development, it can **leak sensitive data** in production logs. Use it with caution in sensitive environments.
