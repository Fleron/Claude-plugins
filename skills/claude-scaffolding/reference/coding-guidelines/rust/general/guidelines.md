### Core Principles

* **Technical Writing Approach**: Write code for the reviewer and future debuggers. Use an inverted pyramid (highlight salient details first) and progressive disclosure.
* **Locality**: Weaker abstractions should be closer to their use point.
* **Simplicity**: Strong abstractions obviate the need to dig into details.
* Rust doesn’t prevent mistakes; it makes it easier to catch them early.
* The compiler is not your enemy, it is a powerful tool. Think of it as your best friend.

### Project Structure (P-*)

* **Root Modules (P-MOD)**: Prefer `mod.rs` over `name.rs`. It ensures the module is an atomic unit for searching/moving and signals self-containment.
  * *Automation*: Enable `clippy.self_named_module_files = "warn"`.
* **Re-exports (P-DIR-MOD)**: `mod.rs` and `lib.rs` should only contain re-exports. Definitions should live in topically named files. Exception: titular definitions (e.g., `fn compile` inside `mod compile`).
* **Preludes (P-PRELUDE-MOD)**: Use only for import convenience; do not include original logic.
* **Standard Lookup (P-PATH-MOD)**: Avoid `#[path]`. Exception: `build.rs` generated files.
* **API/Layout Alignment (P-API)**: API should be a subset of the file layout. Avoid inline modules (except test modules/preludes) so users can browse to code based on the API.
* **Visibility (P-VISIBILITY)**: Limit to module-scope, `pub(crate)`, or `pub`. Use `pub(crate)` to reduce refactoring friction.

### File Structure (M-*)

* **Import Grouping (M-PRIV-PUB-USE)**: Group public imports with the public API; place private implementation imports separately as they are skimmable details.
* **Import Limits (M-PRIV-USE)**: Limit imports to items where intent is clear from the name (e.g., traits) to reduce merge conflicts.
* **Individual Imports (M-SINGLE-USE)**: Avoid compound imports to reduce merge conflicts and friction in line-based editors like vim.
* **Item Ordering**:
    1. **Central Item (M-ITEM-TOC)**: Put the titular/quintessential item first to provide a "Table of Contents" for the module.
    2. **Types then Associated Functions (M-TYPE-ASSOC)**: Interface before implementation. Exception: newtypes for data-only types.
    3. **Associated Functions then Trait Impls (M-ASSOC-TRAIT)**: Core API before augmentations.
    4. **Caller then Callee (M-CALLER-CALLEE)**: The caller provides context for understanding callees.
    5. **Public then Private (M-PUB-PRIV)**: Group public items before private ones in blocks.

### Function Structure (F-*)

* **Logical Grouping (F-GROUP)**: Use newlines to create "paragraphs" of logic.
* **Output Declarations (F-OUT)**: Open blocks with the state/variable they intend to build to announce intent.
* **Visual Business Logic (F-VISUAL)**: Use blocks (`if`, `else`, `match`) for mutually exclusive business paths. Use early returns for non-business bookkeeping/validation. Use combinators for non-business transformations.
* **Side Effects (F-PURE-MUT)**: Do not mix side effects and pure expressions in the same block. Closures in combinators must not have business side effects (F-COMBINATOR). Exception: "invisible" side effects like logging/caching.

### Memory Management: Borrowing and Cloning

* **Borrow over Clone**: Favor `&T` over `T.clone()`.
  * **When to Clone**: Immutable snapshots, `Arc`/`Rc` pointers, shared data across threads, caching, or when an API expects owned data.
  * **Clone Traps**: Avoid auto-cloning in loops (use `.cloned()` or `.copied()` instead). Avoid cloning large structures like `Vec` or `HashMap`. Do not clone to fix bad API design/lifetimes.
* **Type Preferences**: Prefer `&[T]` over `&Vec<T>`, `&str` over `&String`, and `&T` over `T` (for large types).
* **Pass by Value (Copy trait)**: Pass by value if the type is small and cheap to copy.
  * **Copy Structs**: Should represent "plain data objects" (no heap allocations) and be small: up to 24 bytes (3 words).
  * **Copy Enums**: Use if they act as tags/atoms and payloads are `Copy`. Enum size is determined by the largest element.
* **Primitive Sizes**:
  * Integers: i8/u8 (1b), i16/u16 (2b), i32/u32 (4b), i64/u64 (8b), i128/u128 (16b).
  * Floating: f32 (4b), f64 (8b).
  * Other: bool (1b), char (4b).

### Option and Result Handling

* **Unpacking**: Use `let ... else { ... }` for early returns when the missing case is expected and normal (not exceptional).
* **Pattern Matching**:
  * Use `match` for complex transformations (e.g., `Result<T, E>` to `Result<Option<U>, E>`).
  * Use `if let ... else { ... }` if the diverging code needs extra computation.
* **Propagation**: Use `?` to propagate `Err` if you don't care about its value.
* **Conversions**: Use `.ok()`, `.ok_or()`, and `.ok_or_else()` for Result/Option conversion.
* **Avoid**: Do not use `unwrap` or `expect` outside of tests.
* **Allocation**: Use `_else` counterparts (e.g., `unwrap_or_else`, `ok_or_else`) to prevent early memory allocation.

### Iterators and Loops

* **Prefer `for` loops**: For early exits (`break`, `continue`, `return`), simple iteration with side effects (IO), or when readability is prioritized over chaining.
* **Prefer Iterators**: For transforming collections, elegant composition, indexed values (`.enumerate`), or using specialized functions like `.windows` or `.chunks`.
* **Rules**:
  * **Laziness**: Iterators do nothing until a consumer (`.collect`, `.sum`, `.for_each`) is called.
  * **Summing**: Prefer `.sum()` over `.fold()` as the compiler can optimize `.sum()` specifically.
  * **Formatting**: Place each chained function on its own line.
  * **Ownership**: Prefer `iter()` over `into_iter()` unless ownership is required.

### Comments and Documentation

* **Context over Clutter**: Comments should explain **why**, not what or how.
* **Good Comments**: Safety concerns, performance quirks, links to Design Docs/ADRs.
* **Refactoring**: If a function requires a "wall-of-text" explanation, refactor by splitting the function or using expressive naming instead.
* **Stale Comments**: If a comment is outdated, fix or remove it immediately.
* **Documentation**: Use `///` (doc-comments) and `//!` (module-level) to allow testing via `cargo doc`.

### Use Declarations (Imports)

* **Standard Sorting Order**:
    1. `std`, `core`, `alloc`.
    2. External crates (`Cargo.toml`).
    3. Workspace member crates.
    4. `super::`.
    5. `crate::`.
* **Configuration**: Use `rustfmt.toml` with `group_imports = "StdExternalCrate"` and `imports_granularity = "Crate"`.
