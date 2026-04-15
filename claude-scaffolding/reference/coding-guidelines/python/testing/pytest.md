
# Complete Guide to Pytest: From Basics to Advanced

**Pytest** is a powerful Python testing framework that is widely used for unit testing, integration testing, and functional testing. This guide will take you step by step from basic to advanced features of Pytest, providing a comprehensive understanding of its capabilities.

---

## 1. Introduction to Pytest

**What is Pytest?**

- Pytest is a Python testing framework that makes it easy to write small, scalable, and highly maintainable test cases.
- It supports fixtures, parameterized testing, and plugins to extend its capabilities.

**Why Use Pytest?**

- Simple syntax for writing tests.
- Automatic test discovery.
- Rich ecosystem of plugins.
- Built-in support for fixtures and mocking.

---

## 2. Setting Up Pytest

1. **Install Pytest**

   ```bash
   pip install pytest
   ```

2. **Verify Installation**

   ```bash
   pytest --version
   ```

3. **Directory Structure**
   - Example structure for a basic Pytest project:

     ```
     my_project/
     ├── src/
     │   └── my_code.py
     └── tests/
         └── test_my_code.py
     ```

---

## 3. Writing Your First Test

**Example Code:**

- Create a Python file `src/my_code.py`:

  ```python
  def add(a, b):
      return a + b
  ```

- Create a test file `tests/test_my_code.py`:

  ```python
  from src.my_code import add

  def test_add():
      assert add(1, 2) == 3
      assert add(-1, 1) == 0
  ```

**Run the Test:**

```bash
pytest tests/test_my_code.py
```

---

## 4. Test Discovery

- Pytest automatically discovers tests by looking for files starting with `test_` or ending with `_test.py`.
- Test functions must start with `test_`.

**Run All Tests:**

```bash
pytest
```

---

## 5. Assertions in Pytest

- Pytest uses Python's `assert` keyword for making assertions.
- Examples:

  ```python
  def test_example():
      assert 1 + 1 == 2
      assert "pytest" in "Learning pytest is fun!"
      assert {"key": "value"} == {"key": "value"}
  ```

---

## 6. Using Fixtures

Fixtures are used to set up and tear down the test environment.

**Basic Fixture Example:**

```python
import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3]

def test_data(sample_data):
    assert len(sample_data) == 3
    assert sum(sample_data) == 6
```

---

## 7. Parameterized Testing

Parameterization allows you to run the same test with different inputs.

**Example:**

```python
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, -1, -2),
    (0, 0, 0),
])
def test_add(a, b, expected):
    assert a + b == expected
```

---

## 8. Marking Tests

Markers help you organize and run specific groups of tests.

**Using Markers:**

```python
import pytest

@pytest.mark.slow
def test_slow_function():
    import time
    time.sleep(5)
    assert True
```

**Run Tests with Specific Markers:**

```bash
pytest -m slow
```

---

## 9. Running Tests with Command-Line Options

- **Run Verbosely:**

  ```bash
  pytest -v
  ```

- **Stop on First Failure:**

  ```bash
  pytest -x
  ```

- **Generate Test Report:**

  ```bash
  pytest --html=report.html
  ```

---

## 10. Pytest Plugins

Popular Pytest Plugins:

- `pytest-html`: Generate HTML reports.
- `pytest-mock`: Mocking library.
- `pytest-cov`: Code coverage reports.

**Install a Plugin:**

```bash
pip install pytest-html
```

**Usage:**

```bash
pytest --html=report.html
```

---

## 11. Mocking with Pytest

Mock external dependencies using `pytest-mock`.

**Example:**

```python
from unittest.mock import MagicMock

def test_mock(mocker):
    mock_function = mocker.patch("src.my_code.external_function")
    mock_function.return_value = 42

    assert mock_function() == 42
```

---

## 12. Working with Pytest.ini and Configuration

- Create a `pytest.ini` file:

  ```ini
  [pytest]
  markers =
      slow: marks tests as slow
  addopts = --maxfail=3 -v
  ```

---

## 13. Advanced Features of Pytest

1. **Running Tests in Parallel:**
   - Install `pytest-xdist`:

     ```bash
     pip install pytest-xdist
     ```

   - Run tests:

     ```bash
     pytest -n 4
     ```

2. **Code Coverage:**
   - Install `pytest-cov`:

     ```bash
     pip install pytest-cov
     ```

   - Run tests with coverage:

     ```bash
     pytest --cov=src
     ```

3. **Custom Fixtures:**

   ```python
   @pytest.fixture(scope="module")
   def db_connection():
       conn = setup_database_connection()
       yield conn
       conn.close()
   ```

---

## 14. Best Practices for Writing Tests

1. Keep tests simple and focused.
2. Use meaningful test names.
3. Avoid hardcoding values; use fixtures and parameterization.
4. Run tests frequently during development.
5. Use CI/CD pipelines to automate test execution.

---

## Conclusion

This step-by-step guide covers everything you need to get started with Pytest and progress to advanced testing capabilities. Pytest is a versatile tool that can handle a variety of testing scenarios, from simple unit tests to complex integration tests. By mastering Pytest, you can ensure the reliability and quality of your Python codebase.

Let me know if you'd like detailed examples or further elaboration on any specific section!
