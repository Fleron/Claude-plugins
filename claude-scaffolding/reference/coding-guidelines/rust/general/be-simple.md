# The "Be Simple" Principle in Idiomatic Rust

This guide outlines the core philosophy and best practices for maintaining simplicity in Rust development, as detailed in the "Be Simple" principles by Matthias Endler.
Core message: Simplicity is prerequisite for reliability.

## 1. Core Philosophy: Simple vs. Clever

* **Simple is Predictable:** Simple systems have fewer moving parts, making them easier to reason about and more reliable.
* **Simple is for Humans:** Code should be written for human maintainers, not just for the compiler or for the "cool factor" of using advanced features.
* **Simple is the Last Revision:** Simplicity rarely happens on the first try. It is usually the result of a "last revision" after refining a naïve implementation.
* **Simple Code is often fast code:**  Simplicity is a sign of deep insight, of great understanding, of clarity—and clarity has a positive effect on the way a system functions

## 2. Managing Complexity

* **Avoid Accidental Complexity:** Focus on the "inherent complexity" of the task and eliminate "accidental complexity"—the unnecessary hurdles developers introduce themselves.
* **Abstractions Are Not Zero-Cost:** Layers of indirection and "thin veneers" increase cognitive load and can alienate less experienced team members.
* **The "3 AM" Test:** If a production error occurs at 3 AM, can you understand the stack trace? Deeply nested generics and trait objects make debugging significantly harder.

## 3. Best Practices for Generics

* **Generics are a Liability:** They increase cognitive load and impact compile times through monomorphization.
* **Resist Premature Generalization:** Only make code generic if you need to switch implementations *immediately*. Avoid "we might need it in the future" scenarios.
* **Keep Signatures Simple:** Avoid turning simple functions into "monstrosities" with complex bounds (e.g., `AsRef<str>`) just to support multiple input types if a simple `&str` suffices.

## 4. Performance and Efficiency

* **Simple Code is Fast Code:** Simple algorithms (like quicksort) are often more efficient because they use predictable access patterns that CPUs and compilers can easily optimize.
* **Acceptable "Performance Crimes":** In non-critical paths, liberal cloning or using `Arc`/`Box` is preferable to adding complex lifetime management that obscures the code's intent.
* **Measure Before Optimizing:** Don't jump at optimization opportunities without validation. Many "optimizations" result in slower or less maintainable code.

## 5. Practical Development Workflow

* **The Seinfeld Method:** Separate "creating mode" (writing the naïve implementation) from "editing mode" (refining and polishing) to avoid paralysis.
* **Defer Refactoring:** Don't refactor too early based on limited information. Refactoring a simple program later is much easier than fixing a prematurely complex one.
* **Wait for Patterns:** Only abstract when code feels repetitive. Let the "hidden pattern" in your data reveal the right abstraction over time.

## 6. API and Library Design

* **Target the Common Case:** Your API should make the most frequent task the easiest to perform. Don't force users through "hoops" (like builder patterns) for standard operations.
* **Application vs. Library Code:** Application code (business logic) should be straightforward. Library code can be more complex but should provide a simple "canonical" entry point for users.
* **The Litmus Test:** A good abstraction should "click." It should feel obvious where to add functionality or look for bugs without needing excessive mocks or type conversions.

## 7. Summary of Simple Design

* **Don't Cut Corners:** Simple is not "sloppy." Use the type system to make illegal states unrepresentable—this adds safety without adding accidental complexity.
* **Succinct Expression:** Remove the unnecessary, the irrelevant, and the noise. Be clear, not clever.
