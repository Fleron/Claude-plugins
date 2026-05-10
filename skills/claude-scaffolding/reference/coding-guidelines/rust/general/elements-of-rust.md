# Elements of Rust: Technical Reference

This document is a distilled technical reference based on the "Elements of Rust" collection, focusing on software engineering techniques to express intent effectively in Rust. It provides actionable patterns for cleaning up complex logic, improving development ergonomics, and utilizing advanced type-system features to prevent misuse or bypass language limitations.

Use this guide as a refactoring resource when dealing with "rightward pressure" (deep nesting), complex iterator transformations, or when seeking to optimize your compile-test cycle. Each section identifies a common friction point and provides the idiomatic Rust solution or tool to resolve it.

---

## 1. Cleanup & De-nesting

### Combating Rightward Pressure

* **Flattening Error Handling**: Use the `?` operator to flatten results. Keep separate concerns in separate types; avoid converting all errors into a single top-level enum unless they are truly handled at the same point.
* **Breaking Combinator Chains**: Split chains that grow beyond one line. Assign names to intermediate steps. If a chain becomes unreadable, rewrite it as a `for` loop.
* **Complex Pattern Matching**: Match on the full complex type (tuples) rather than using nested `match` statements.
* **`if let` vs. `match`**: Replace `match` statements that only care about a single pattern and a wildcard with an `if let` (and optional `else`).
* **Tooling**: Use `cargo clippy` for automated cleanup suggestions.

### Tuple Matching & Decision Tables

Use tuple matching to de-nest logic. This is particularly effective for encoding "decision tables," such as handling mutually exclusive flags.

* **Example**: `match (is_bin, is_lib) { (true, false) => ..., (false, true) => ..., _ => ... }`.

---

## 2. Iteration Techniques

### Pulling the First Error from an Iterator

The `collect` method can transform an iterator of `Result<A, E>` into a `Result<Collection<A>, E>`. It will return either a collection of all `Ok` items or the very first `Err` encountered.

* **Reference**: [std docs on collect](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.collect).

### Reverse Ranges

To iterate backwards (e.g., 49 down to 0), use `.rev()` on a range.

* **Correct Syntax**: `for item in (0..50).rev() { ... }`.
* Note: `for item in 50..0` will result in an empty iterator and no execution.

### Empty and Singular Iterators

Instead of `vec![].into_iter()` or `vec![item].into_iter()`, use standard library helpers:

* `std::iter::empty()`
* `std::iter::once(item)`

### Tuple Structs/Variants as Functions

Tuple structs and enum tuple variants can be used as functions that map their members to an instance of that type. This is useful for wrapping items in a collection.

* **Example**: `let wrapped: Vec<_> = items.into_iter().map(MyWrapper).collect();`.

---

## 3. Blocks for Clarity

### Precise Closure Capture

Use blocks to evaluate a closure. This allows you to clone or prepare variables (like `Arc` handles) specifically for that closure without shadowing variables in the outer scope or inventing names like `config1`, `config2`.

* **Reference**: [Rust pattern: Precise closure capture clauses](https://medium.com/@al_m_sh/rust-pattern-precise-closure-capture-clauses-60b6b230896).

---

## 4. Ergonomics & Workflow

### Handling Compiler Errors

* **Type Evidence**: Rust requires explicit types at function boundaries to drive inference. A gap in the "chain of evidence" connecting arguments to return types often causes a cascade of errors. Fix the first error in the list first, as others are often downstream ambiguities.
* **`cargo watch`**: Use [cargo-watch](https://github.com/watchexec/cargo-watch) to automatically run `cargo check` on file save.
  * **Tip**: Use `cargo watch -c -x "check -q" --shell "2>&1 | head -n 20"` to clear the terminal and show only the start of error messages.
* **`sccache`**: Use [sccache](https://github.com/mozilla/sccache) for compiler caching across projects to reduce build times for common dependencies.
* **Editor Support**: Use plugins like `vim.rust` + `Syntastic` (Vim) or `flycheck-rust` (Emacs) to jump directly to compiler errors.

---

## 5. Lockdown Patterns

### The "Never" Type

To represent a type that can never be instantiated (e.g., a `Result` that will never be an `Err`), use an empty enum: `enum Never {}`.

* Functions that never return (infinite loops/process exit) return the `!` type.

### Deactivating Mutability

To prevent misuse of an object after it has been "finalized," wrap it in a newtype that implements `Deref` but **not** `DerefMut`. This disables mutability even in mutable owned copies of the wrapper.

---

## 6. Avoiding Limitations

### `Box<FnOnce>`

* **Note**: As of Rust 1.35, `Box<dyn FnOnce>` is stable and works directly.
* **Historical Workaround**: For older versions, `self: Box<Self>` was required to make the call object-safe.

### Shared Reference Swap Trick

`std::cell::Cell<T>` allows for "internal mutability" without a `&mut` reference, even for non-`Copy` types, using `take()` and `replace()`.

* This allows implementing `fmt::Display` for an iterator (which requires consuming the iterator) despite `Display` only providing a shared `&self`.

### Using Sets as Maps

To avoid cloning keys when storing structs in a map (e.g., `HashMap<String, Person>`), use a `HashSet<Person>` and implement the `Borrow` trait.

* **Requirement**: You must override `Eq` and `Hash` for the struct to match the borrowed key (e.g., comparing `Person` instances only by their `name` field).
* **Reference**: [Rust stdlib docs on Borrow](https://doc.rust-lang.org/std/borrow/trait.Borrow.html).
