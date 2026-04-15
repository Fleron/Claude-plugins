This is a comprehensive directory of the recommended crates from **Blessed.rs**, organized by category. Each crate includes a link to its official documentation as provided in the source material.

### **1. Common & General Purpose**
*   **Random Numbers**: **[rand](https://docs.rs/rand)** (De facto standard) or **[fastrand](https://docs.rs/fastrand)** (Simple/fast, not secure).
*   **Time & Date**: **[chrono](https://docs.rs/chrono)** (Feature-rich) or **[time](https://docs.rs/time)** (Smaller/simpler).
*   **Regular Expressions**: **[regex](https://docs.rs/regex)** (Standard/fast) or **[fancy-regex](https://docs.rs/fancy-regex)** (Supports backtracking).
*   **Data Structures**:
    *   **[indexmap](https://docs.rs/indexmap)**: HashMap that preserves insertion order.
    *   **[smallvec](https://docs.rs/smallvec)**: Stack-allocated arrays with heap fallback.
    *   **[arrayvec](https://docs.rs/arrayvec)**: Strictly stack-allocated arrays.
    *   **[itertools](https://docs.rs/itertools)**: Essential extra iterator methods.
*   **Utility**: **[uuid](https://docs.rs/uuid)** (UUID generation), **[tempfile](https://docs.rs/tempfile)** (Temporary files), and **[flate2](https://docs.rs/flate2)** (Gzip compression).

### **2. Error Handling & Logging**
*   **Error Handling**:
    *   **[anyhow](https://docs.rs/anyhow)**: Best for application-level errors and stack traces.
    *   **[color-eyre](https://docs.rs/color-eyre)**: Best for user-facing error reports.
    *   **[thiserror](https://docs.rs/thiserror)**: Standard for defining library-level error types.
*   **Logging**:
    *   **[tracing](https://docs.rs/tracing)**: The modern standard for structured and text logging.
    *   **[log](https://docs.rs/log)**: Simple logging for non-async projects.
    *   **[slog](https://docs.rs/slog)**: Alternative for structured logging.

### **3. Serialization & Languages**
*   **General Serialization**: **[serde](https://docs.rs/serde)** is the universal standard.
*   **Formats**: **[serde_json](https://docs.rs/serde_json)** (JSON), **[toml](https://docs.rs/toml)** (Configuration), **[prost](https://docs.rs/prost)** (Protocol Buffers), and **[flatbuffers](https://docs.rs/flatbuffers)** (Zero-copy binary).
*   **Language Extensions**: **[once_cell](https://docs.rs/once_cell)** (Lazy initialization), **[syn](https://docs.rs/syn)** (Macro parsing), and **[bitflags](https://docs.rs/bitflags)** (Typed bitflags).

### **4. System & Tooling**
*   **System**: **[libc](https://docs.rs/libc)** (C bindings), **[rustix](https://docs.rs/rustix)** (Safe Unix/POSIX APIs), and **[memmap2](https://docs.rs/memmap2)** (Memory mapping).
*   **Tooling**:
    *   **Official**: **[rustup](https://docs.rs/rustup)** (Toolchain), **[clippy](https://docs.rs/clippy)** (Linter), and **[rustfmt](https://docs.rs/rustfmt)** (Formatter).
    *   **Development**: **[cargo-audit](https://docs.rs/cargo-audit)** (Security), **[criterion](https://docs.rs/criterion)** (Benchmarking), and **[cargo-release](https://docs.rs/cargo-release)** (Automation).

### **5. Networking & Databases**
*   **Async Runtimes**: **[tokio](https://docs.rs/tokio)** (Recommended standard), **[smol](https://docs.rs/smol)** (Modular), and **[futures](https://docs.rs/futures)** (Utilities).
*   **HTTP**:
    *   **Clients**: **[reqwest](https://docs.rs/reqwest)** (Full-featured) and **[ureq](https://docs.rs/ureq)** (Minimalist sync).
    *   **Servers**: **[axum](https://docs.rs/axum)** (Ergonomic/Official) and **[actix-web](https://docs.rs/actix-web)** (Maximum performance).
*   **Databases**:
    *   **SQL**: **[sqlx](https://docs.rs/sqlx)** (Async/Compile-time checked) and **[diesel](https://docs.rs/diesel)** (Type-safe ORM).
    *   **Specific**: **[rusqlite](https://docs.rs/rusqlite)** (SQLite), **[redis](https://docs.rs/redis)** (Redis), and **[mongodb](https://docs.rs/mongodb)** (MongoDB).

### **6. CLI & Terminal**
*   **Arguments**: **[clap](https://docs.rs/clap)** (Fully-featured) and **[lexopt](https://docs.rs/lexopt)** (Minimal/Fast).
*   **Rendering**: **[ratatui](https://docs.rs/ratatui)** (TUI), **[indicatif](https://docs.rs/indicatif)** (Progress bars), and **[inquire](https://docs.rs/inquire)** (Interactive prompts).
*   **FS Utilities**: **[walkdir](https://docs.rs/walkdir)** (File walking) and **[directories](https://docs.rs/directories)** (Standard user paths).

### **7. Concurrency & Math**
*   **Concurrency**: **[rayon](https://docs.rs/rayon)** (Parallel iterators), **[parking_lot](https://docs.rs/parking_lot)** (Fast Mutexes), and **[crossbeam-channel](https://docs.rs/crossbeam-channel)** (Advanced channels).
*   **Math**: **[num-traits](https://docs.rs/num-traits)** (Numeric generics), **[nalgebra](https://docs.rs/nalgebra)** (Linear algebra), and **[polars](https://docs.rs/polars)** (DataFrames).

### **8. Graphics & Games**
*   **GUI**: **[egui](https://docs.rs/egui)** (Immediate-mode), **[iced](https://docs.rs/iced)** (Retained-mode), and **[tauri](https://docs.rs/tauri)** (Web-based desktop apps).
*   **Windows/Rendering**: **[winit](https://docs.rs/winit)** (Windowing) and **[skia-safe](https://docs.rs/skia-safe)** (2D Rendering).
*   **Games**: **[bevy](https://docs.rs/bevy)** (ECS Engine) and **[glam](https://docs.rs/glam)** (3D Math).

### **9. Interop (FFI) & Cryptography**
*   **FFI**: **[bindgen](https://docs.rs/bindgen)** (C), **[cxx](https://docs.rs/cxx)** (C++), and **[pyo3](https://docs.rs/pyo3)** (Python).
*   **Cryptography**: **[rustls](https://docs.rs/rustls)** (Modern TLS), **[argon2](https://docs.rs/argon2)** (Password hashing), and **[aes-gcm](https://docs.rs/aes-gcm)** (Encryption).

For more details on specific use cases and niche crates, visit the full guide at **[Blessed.rs](https://blessed.rs)**.
