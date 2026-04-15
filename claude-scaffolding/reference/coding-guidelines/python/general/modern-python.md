#  Modern Python Tooling

…well except for this first chapter actually, which is about tooling. However, this directly affects how you write code, setup your projects, share your code, etc. So it’s of course highly relevant and something I wanted to include here.

2.1 UV
UV is an extremely fast package and project manager for Python. You are probably already familiar with pip, conda, or poetry. UV is a drop-in replacement for all of them. It has seen light-speed adoption in the Python ecosystem since being launched just a year ago in 2024. And that did not happen for no reason - uv makes working with virtual environments and libraries incredibly simple and fast, with a speedup of 10–100x as compared to pip.

Link to docs: <https://docs.astral.sh/uv/>

Once installed, here’s just a couple of ways you can use it.

a) Scripts: You can just run a single script with libraries being installed on the go (yes it’s that fast). You can even add the package metadata directly to a script (thanks to PEP 723) and thereby make it fully self-contained. All you then need to do is run the script (or whoever you share the code with).

# CLI commands

# Run script

uv run my_script.py - with polars rich

# Or add metadata to file and then run

uv add - script my_script.py polars rich
uv run my_script.py

b) Jupyter: Of course you can also use uv for Jupyter notebooks (see here for detailed documentation). If needed, you can even run a standalone Jupyter notebook/lab instance and just fill your first code cell with !uv add xyz statements to realize the ultimate dream of truly self-contained notebooks that can be shared and launched within seconds.

uv tool run jupyter notebook

c) Projects: However, most often you’ll want to create a full project, even if you then work in notebooks. Running the following commands will initialize a new project folder. Adding libraries to your project is done with uv add xyz. No more manual initializing of virtual environments, just cd into your project. Your .venv folder will be inside that folder and uv will just find it.

uv init my-project
cd my-project
uv add polars rich

Besides all that, uv also handles all your Python versions, allows you to install and run tools (like ruff), smartly uses caching to speed up things even further, and much more.

It’s honestly just a delight to use.

2.2 Ruff
Ruff is a blazingly fast Python linter and formatter. It is developed by the same (incredible) team that also builds uv. It replaces many other code quality tools including Flake8, isort, and black.

Documentation: <https://docs.astral.sh/ruff/>

You can run code checks or formatting as described below.

# Check for issues

ruff check .

# Format your code

ruff format .

# Check and apply auto-fixes where possible

ruff check . - fix

However, rather than manually running these commands, for me ruff is most helpful as a real-time formatting and linting tool, which I use via the ruff VS Code extension, but other IDEs also have support. That way, ruff can automatically format your code as you write it (or rather on save) and it provides in-line warnings for any issues it detects.

The list of rules ruff supports to is way too long to outline here, but it includes detecting style violations and anti-patterns, sorting imports, applying a consistent formatting, and even suggesting updates for modern Python syntax. All that is pretty neat. All the code in this document has been formatted by ruff for example.

You can configure ruff within your pyproject.toml file or with a dedicated ruff.toml file. This gives you control over which rules ruff should consider or ignore.

Collaboration: One thing to call out is that if your work on a project with other developers, you’ll want to make sure all of you use the exact same formatter, so either check-in the ruff config into your git repository or set up a git pre-commit hook that applies formatting before sharing any code.

In summary, ruff requires minimal effort to set up in return for a massive gain in value. Using ruff is a no-brainer.

2.3 Mypy
Mypy is a static type checker for Python.

However, I only want to pre-tease this one here, simply because it ideally belongs in this section, but we’ll actually talk about it later, just after the section on static typing. It will make more sense then, especially if you’re not already familiar with type hints in Python.

3 Chapter 03 - Static Typing

Python is a dynamically typed language, which means that you can assign any data type to any variable. For example, you can assign an integer to x (x=1) and later overwrite the same variable with a string (x="abc"). This works because types are determined dynamically at run time in Python.

This is arguably one of Python’s biggest strength and weakness at the same time. On the one hand, it makes Python flexible and easy to learn and use. This is great for getting things done quickly, and one of the reasons Python has become so incredibly popular. However at the same type…I mean time, it also brings ambiguity and lends itself to bugs.

Since the introduction of type hints in Python 3.5 (PEP 484) static typing is now possible in Python too. However, these are only type “hints”, ie Python still does not enforce them at runtime (this is where mypy and Pydantic come in, two topics we’ll get to later on).

To type or not to type? Some argue that type hints are an abuse of Python, which was created as a dynamically typed language by design. Others say this is exactly what Python has always been missing. My personal opinion is that I find type hints very useful and I like them because (1) it aids readability, especially for function and class signatures, and (2) it forces you to be more thoughtful with your code.

You may not need them if you only work on experiments, but they do add value if you write code you want to share, reuse later, or put into production.

3.1 Basic Type Hints
Say we want to write a function setup_dataloader that contains some logic to create a PyTorch dataloader.

Note that throughout this tutorial, I will often leave out the actual implementation of the function (using …) since it doesn’t really bother us here. We mainly care about the design of the code.
def setup_dataloader(data_path, batch_size, shuffle):
    """Builds a data loader for training a model."""
    ...

# Example usage

# Will this work? What will it return?

my_dataloader = setup_dataloader(
    data_path="data/train", batch_size="large", shuffle="yes"
)

# No autocomplete

my_dataloader.a...

Based on the above implementation, it’s not clear what exactly parameters should be. For example, does batch_size="large" work, or should it be a number like batch_size=64? Similarly for shuffle - it could be a “yes/no” or a boolean. In addition, your code editor will probably not even know what the function returns, so you won’t get autocomplete suggestions for attributes and methods of your new variable my_dataloader.

With typing, things are much clearer.

from torch.utils.data import DataLoader

# Same function with type hints

def setup_dataloader(data_path: str, batch_size: int, shuffle: bool) -> DataLoader:
    """Builds a data loader for training a model."""
    ...

# Example usage

my_dataloader = setup_dataloader(data_path="data/train", batch_size=32, shuffle=True)

Now it’s clear that what we expect is an integer for batch_size and a boolean for shuffle. We now also know the function returns a PyTorch Dataloader object.

Below is a summary of basic type hints.

# Some other basic examples

x: int = 42
y: float = 3.14
s: str = "Hello, world!"
a: bool = True

# Union types (can be either type)

a: int | float = 42

# Optional types

b: int | None = None

# Nested types

list_of_ints: list[int] = [1, 2, 3, 4, 5]
list_of_ints_or_floats: list[int | float] = [1, 2.5, 3, 4.0, 5]
cartesian_point: tuple[float, float] = (1.0, 2.0)
dict_of_str_to_int: dict[str, int] = {"a": 1, "b": 2}

# Other types

df: pd.DataFrame = pd.DataFrame({"a": [1, 2], "b": [3, 4]})
predictions: np.ndarray = np.array([0.1, 0.2, 0.3])

# Create a custom type

Vector = list[float]
scalar = float
my_vector: Vector = [1.0, 2.0, 3.0]
my_scalar: scalar = 3.14

Note that type hints are most useful for parameters in functions or methods, and for class attributes. For simple variables as in x=123, typing is typically unnecessary since it is perfectly clear that x is an integer here.
3.2 Literals
Whenever you have a parameter that should only take on one of a few values, you can use a Literal. Here is an example that contains two literals, one for environment and one for batch_size:

from typing import Literal

# `environment` should only be "dev", "sandbox", or "prod"

# `batch_size` should only be 16, 32, 64, or 128

def train_model(
    environment: Literal["dev", "sandbox", "prod"] = "dev",
    batch_size: Literal[16, 32, 64, 128] = 16,
):
    if environment == "dev" and batch_size != 16:
        raise ValueError("Batch size must be 16 in dev environment.")
    ...

# Example usage

# Your IDE should show you a warning that 24 is not a valid value for `batch_size`

train_model(environment="dev", batch_size=24, shuffle=True)

# > ValueError: Batch size must be 16 in dev environment

3.3 Enums
Similarly to literals, we can also create a dedicated Enum, which is a specific data type for a categorical variable. A StrEnum for example essentially behaves like a string, and an IntEnum like an integer.

We can then use them in multiple places so we don’t have to repeat ourselves. This also helps prevent bugs as you need to be more specific and upfront about what values you accept, and you can access its values using dot syntax.

from enum import StrEnum, IntEnum

# Define a str enum

# `StrEnum` is a subclass of `str` and `Enum`

class Environment(StrEnum):
    DEV = "dev"
    SANDBOX = "sandbox"
    PROD = "prod"

# Define an int enum

# `IntEnum` is a subclass of `int` and `Enum`

class BatchSize(IntEnum):
    SMALL = 16
    MEDIUM = 32
    LARGE = 64
    EXTRA_LARGE = 128

def train_model(
    environment: Environment = Environment.DEV,  # defaults to dev environment
    batch_size: BatchSize = BatchSize.SMALL,  # defaults to small batch size
):
    # You can then use the enum values directly
    if environment == Environment.DEV and batch_size != BatchSize.SMALL:
        raise ValueError("Batch size must be SMALL in DEV environment.")

# Example usage

print(Environment.DEV)

# > "dev"

print(BatchSize.MEDIUM)

# > 32

train_model(
    environment=Environment.DEV,
    batch_size=BatchSize.MEDIUM,
)

# > ValueError: Batch size must be SMALL in DEV environment

Enums are really great (and surprisingly fun to write). However, at the same time it’s easy to overuse them. In the example above, for instance, I would argue that using a Literal, not enums, is the better choice because they will actually display for you their values in the function signature whereas enums do not.

3.4 Callable
Let’s take typing a step further with the Callable type hint, which describes a function.

The callable we use below for the transformation parameter describes a function with a single argument of type float, and a return value of type float, ie it’s signature follows (float) -> float.

import numpy as np
from typing import Callable

# Our function takes two arguments

# `data` is a list of floats

# `transformation` is a function that takes a float and returns a float

# The function returns a list of floats

def transform_data(
    data: list[float], transformation: Callable[[float], float]
) -> list[float]:
    """Applies a transformation to each element."""

    return [transformation(value) for value in data]

# Example transformation functions

# that follow the signature of Callable[[float], float]

def cap(value: float) -> float:
    """Cap value at 1.0."""
    return min(value, 1.0)

def log(value: float) -> float:
    """Logarithm of value."""
    return np.log(value).item()

# Example usage

my_data = [0.5, 0.8, 1.4, 2.5]

capped_data = transform_data(data=my_data, transformation=cap)
print(capped_data)

# > [0.5, 0.8, 1.0, 1.0]

log_data = transform_data(data=my_data, transformation=log)
print(log_data)

# > [-0.69314718, -0.223143551, 0.336472236, 0.91629073]

What is the benefit here? Note how we have made the transform_data agnostic to whatever function we eventually want to apply to the data, which may be a log, square, cap, etc. Using the callable we only defined a “contract” that the function must adhere to. This example is actually also reminiscent of the “strategy pattern”, which we’ll get to later on.
3.5 Mypy
Now that we covered basic type hints, we can finally talk about mypy. Mypy is a static type checker for Python.

As already explained, Python does not enforce type hints at runtime. They are merely “hints”, mainly for you and your IDE. This is where mypy comes in. As a static type checker, mypy verifies type consistency before execution, catching a whole range of bugs that would otherwise only appear at runtime. Essentially, mypy takes all your type hints and looks for any inconsistencies, giving you warnings or errors for anything it finds.

Mypy has also excellent IDE support (for example in VS Code), so you can install the extension and see these warnings as you type.

Here’s just a simple example of a function that does not fully adhere to what the type hints specify.

# Mypy should recognize that the function may return None

# unlike its return type hint suggests

def square(data: list[float]) -> list[float]:
    """Square each element in data."""

    if not data:
        return None
    else:
        return [value**2 for value in data]

# Example usgage

# Mypy should also show that the following is incorrect

# even though it may technically work, you just weren't

# specific enough

data = np.array([1, 2, 3])
square(data)

Quick side note: Guess what? Astral, the team who already built uv and ruff, are also working on “ty”, a static type checker for Python. You can expect that to be a pretty good option too once it’s ready for broad use.
4 Chapter 04 - Typed Data Structures

Simple type hints are already great, but you can use them also to create more comprehensive data structures.

4.1 Typed Dictionaries
Typed dictionaries essentially behave and look like regular dictionaries, but incorporate type hints. That means they come with clear expectations about keys and values, unlike regular dictionaries. Below, for example, we create a typed dict Metrics that represents some model eval results. The advantage is that we define exactly what any instance of this dictionary will look like, so the receiver can be more confident in further processing it.

from typing import TypedDict

# Define a typed dict by inheriting from `TypedDict`

class Metrics(TypedDict):
    accuracy: float
    precision: float
    recall: float
    AUC: float | None  # AUC is an optional field

# Our function here computes some metrics given two

# numpy arrays and returns a typed dict of metrics

def evaluate_predictions(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> Metrics:
    """Given true and predicted values, compute metrics."""
    ...
    return Metrics(
        accuracy=0.66,
        precision=1.0,
        recall=0.5,
    )

# Example usage

y_true = np.array([1, 1, 0])
y_pred = np.array([1, 0, 0])

my_metrics = evaluate_predictions(y_true, y_pred)

print(my_metrics)

# > {'accuracy': 0.66, 'precision': 1.0, 'recall': 0.5}

4.2 Dataclasses
Dataclasses are another great Python feature. They have been around for some time now (since 2015 I think), but they are absolutely great for many use cases, and their popularity has grown recently.

The simple @dataclass decorator reduces much of the boilerplate code needed to create classes (eg the __init__ method), letting you focus on the data structure.

Below is an example of a config dataclass. We set frozen=True here to ensure that any instance of it isn’t (accidentally) modified later (using immutable data types is often a good idea, as we’ll discuss later). from dataclasses import dataclass

# Define a dataclass using the decorator

# `frozen=True` to make it immutable

@dataclass(frozen=True)
class ModelConfig:
    model_path: str
    data_path: str
    batch_size: int = 32
    learning_rate: float = 1e-3
    num_epochs: int = 10
    early_stopping: bool = False

# Example usage

my_model_config = ModelConfig(
    model_path="models/v1",
    data_path="data/train",
    batch_size=64,
    # Rest of fields will have default values
)

# Allows for dot notation access

print(ModelConfig.batch_size)

# > 64

Dataclass or TypedDict? Dataclasses are great - that’s all I want to say here.

4.3 Nested Structures
Dataclasses and typed dictionaries both allow you to create nested data structures. This is very useful, but don’t create too heavily nested structures for the sake of simplicity.

from datetime import datetime

# Our dataclass here contains a model config (another dataclass)

# and a metrics typed dict

@dataclass
class ExperimentSummary:
    datetime: datetime
    model_config: ModelConfig
    metrics: Metrics

# Example usage

my_experiment = ExperimentSummary(
    datetime=datetime.now(),
    model_config=my_model_config,
    metrics=my_metrics,
)

print(my_experiment.model_config.batch_size)

# > 64

At this point it’s also worth mentioning that you can easily take this too far to the point where only pass around objects. For example, you may create functions that have just a single (or a few) abstract arguments, which contain the actual values the function needs (like the model_config above). This can make your functions harder to use rather than easier, if not used thoughtfully and sparingly. It takes some experience to decide where abstract inputs make more sense and what should just be native function parameters (ie str, int, etc).

5 Chapter 05 - Pydantic

Pydantic is a data validation (and serialization) library. In the last few years, Pydantic has taken the Python ecosystem by storm, with many major libraries existentially relying on or building on top of it, notably for example FastAPI or the the OpenAI SDK.

Unlike static type checkers, Pydantic enforces type annotations through runtime validation. That means that you can trust your data is in the right format once it’s validated by your Pydantic data model.

I would argue that the popularity of Pydantic is the final proof that the community at large has embraced typing and type safety in Python. And it’s also just incredibly fun to create Pydantic models - this hard to describe, it’s just enjoyable to use. I think you’ll see why when you try it out. This cannot be a full intro to Pydantic, since it’s a very comprehensive library. But we’ll cover some key topics.

Link to their (absolutely great) docs: <https://docs.pydantic.dev/latest/>

5.1 Pydantic Models
Say we want to build a data structure for a product. We may want to ensure that price cannot be below 0, and that the production date occurs before the shelf date. Both could be the result of mistakes (or even manipulation) and lead to bugs.

# Define a pydantic model by inheriting from `BaseModel`

from pydantic import BaseModel, field_validator, model_validator
from datetime import date

# To define a Pydantic model, inherit from `BaseModel`

# It looks a bit like a dataclass, no need for __init__

# but there is a lot more to it

class Product(BaseModel):
    product_id: int
    production_date: date
    due_date: date
    price: float

    # Here we define a custom `field_validator` for `price`
    # making sure it's not negative.

    @field_validator("price", mode="after")
    @classmethod
    def validate_price(cls, value: float) -> float:
        if value < 0:
            raise ValueError()
        return value

    # A custom `model_validator` for dates
    # checking that `production_date` is before `due_date`.

    @model_validator(mode="after")
    def validate_dates(self) -> None:
        if not self.production_date < self.due_date:
            raise ValueError()
        return self

# Example usage

# Pydantic will automatically validate the data

# and raise an error if it doesn't match the type hints

# or if any custom validators fail

product = Product(
    product_id=123,
    production_date="2023-10-01",
    due_date="2023-10-15",
    price=19.50,
)
print(product)

# > Product(product_id=123, production_date=datetime.date(2023, 10, 1), due_date=datetime.date(2023, 10, 15), price=19.5)

5.2 Validation Decorator
Pydantic also makes it really easy to validate inputs of a function. Just use their validate_call decorator. Just as with Pydantic models, validation occurs at runtime.

from pydantic import validate_call

# The `validate_call` decorator validates the function's arguments

# and raises an error if not valid

@validate_call(validate_return=True)
def process_input(user_input: str, budget: float) -> float: ...

# Example usage (fails)

process_input(user_input="Hello", budget="high")

# > ValidationError: 1 validation error for process_input

# > budget

# > value is not a valid float (type=value_error.float)

5.3 Type Annotations
Type annotations were added in Python 3.XY. The main idea is to append some metadata to a type. They’ve become a common tool for various different use cases.

For example, in combination with Pydantic, they can be used to create custom, validated data types. Below, we’ll define a noneEmptyStrType and a roundedFloatType. These types can then be used just like any other types (eg str, int, etc), and runtime validation is just baked int. In the case of the roundedFloatType, it’s actually not so much validation as it is post-processing (ie rounding the value). Here’s how this works (see code below):

Say we pass a wrong data type, like the string "19.49" - Pydantic then first attempts to cast the string into a float (that’s just part of Pydantic’s validation). If that works, it then applies the AfterValidator which rounds the float to 19.5.

from typing import Annotated
from pydantic import AfterValidator

# Custom validator function

# Raises an error if the string is empty

def check_str_not_empty(s: str) -> str:
    if not s.strip():
        raise ValueError()
    return s

# We define two custom types using `Annotated` and a Pydantic `AfterValidator`

# `nonEmptyStr` is a string that is not empty

# `roundedFloat` is a float rounded to 1 decimal place

nonEmptyStrType = Annotated[str, AfterValidator(check_str_not_empty)]
roundedFloatType = Annotated[float, AfterValidator(lambda x: round(x, 1))]

# Example usage

@validate_call
def process_user_input(input: nonEmptyStrType, budget: roundedFloatType) -> str:
    ...
    return f"Input: {input}, Budget: {budget}"

processed = process_user_input(input="Hello", budget="19.49")

print(processed)

# > Input: Hello, Budget: 19.5

6 Chapter 06 - Software Design Patterns

6.1 Protocols
Ever heard of duck typing? It’s one of Python’s (and other languages’) most ubiquitous features. It’s is captured in the saying: “If it walks like a duck and quacks like a duck, then it might as well be a duck”. This is useful because often you don’t really care what an object is, but rather what it can do.

Enter protocols. Using a Protocol, you can specify an “interface”. Any objects that implement this interface, ie its methods and/or attributes, are considered compatible. In fact, this is somewhat similar to an abstract base class that defines some abstract methods, and then inheriting from it. Except that protocols do not require inheritance at all.

This is best explained using an example.

Say we want to recommend items from among a mixed pool of products and services. We may decide that all we need to do this is for each item to just have some kind of relevance score (computed elsewhere) that we can use to rank them, no matter what else they may contain. So let’s define a new protocol Recommendable which matches any object that contains a relevance attribute. It’s important to recognize how this is all we really care about here - we can recommend totally different items as long as they have that attribute.

When can then define a recommendation function that expects a list of Recommendable. The function is now flexible enough to recommend from among any set of items as long as they implement the right interface. The Recommendable is only a “contract” or “promise” so to say, which helps us make explicit what the function really needs.

from typing import Protocol
from dataclasses import dataclass

# Define a protocol which requires a `relevance` field

# Both `Product` and `Service` will implement this protocol

# even without inheriting from it

class Recommendable(Protocol):
    relevance: float

# Let's define `Product` and `Service` classes

# Both have the `relevance` field

@dataclass
class Product:
    product_id: str
    weight: float
    relevance: float

@dataclass
class Service:
    service_id: str
    relevance: float

# A simple recommendation function that takes a list of recommendable items

def make_recommendation(items: list[Recommendable], k: int = 3) -> list[Recommendable]:
    """Recommends the top k items based on relevance."""
    sorted_items = sorted(items, key=lambda x: x.relevance, reverse=True)
    return sorted_items[:k]

# Example usage

items = [
    Product("TV", weight=6.0, relevance=0.2),
    Product("Book", weight=0.5, relevance=0.9),
    Service("Netflix Subscription", relevance=0.4),
    Service("Spotify Subscription", relevance=0.8),
]

recommendations = make_recommendation(items, k=2)

print(recommendations)

# > [Product(product_id='Book', weight=0.5, relevance=0.9), Service(service_id='Spotify Subscription', relevance=0.8)]

6.2 Structural Pattern Matching
If you’ve seen match/case statements in Python, they may seem like if - else replacements initially, but they are much more than that.

You should also read the original proposal for PEP 636, which is really good and highly readable: <https://peps.python.org/pep-0636/>

Let’s say we now want to ship our product or service (which we both defined above), but we need to apply a different shipping logic for heavy products, light products, and services.

The first case statement below matches on objects of type Product but only if it also has a weight of at least 5.0. The second matches all other products, the third one any services, and finally _ is just a catchall case.

Structural pattern matching is quite powerful if used in the right places.

def ship(item: Product | Service):
    """Ships the item; logic depends on item type and weight."""

    match item:
        case Product(weight=weight) if weight >= 5.0:
            print("Shipping heavy product by ship.")
            ...
        case Product():
            print("Shipping light product by air.")
            ...
        case Service():
            print("Shipping service by email.")
            ...
        case _:
            # otherwise raise error
            raise ValueError()

# Example usage

item = Product(product_id="TV", weight=6.0, relevance=0.2)

ship(item)

# > Shipping heavy product by ship

6.3 Dependency Injection
This is a fairly useful principle that we’ve already implicitly applied many times throughout this tutorial. But here we go more formally.

Definition: Dependencies should be injected rather than created internally. This is also related to the open-closed principle, which says that “your code should be open to extension but closed to modification.”

What this means in practical terms is that you should pass dependencies as arguments to functions/methods (or as attributes to classes), rather than initialize them from within. That reduces tight coupling and increases modularity.

Many modern and popular Python libraries make heavy use of dependency injection, including FastAPI, pytest, and many of the recent AI frameworks like PydanticAI and OpenAI’s Agent Framework.

######## ATTEMPT 1

# Not good

# because the connection is created

# inside the function. If we need to change the

# database, we need to change the function

def query_database(query: str) -> pd.DataFrame:
    con = sqlite3.connect("database.db")
    with con:
        df = pd.read_sql_query(query, con)
    return df

# Example usage

query_database("SELECT * FROM users")

######## ATTEMPT 2

# Even worse

# because the connection is created outside

# the function but accessed from within

con = sqlite3.connect("database.db")

def query_database(query: str) -> pd.DataFrame:
    with con:
        df = pd.read_sql_query(query, con)
    return df

# Example usage

query_database("SELECT * FROM users")

######## ATTEMPT 3

# Better

# because the connection is passed as an argument

# If the connection changes to a different database

# the function will still work

def query_database(con, query: str) -> pd.DataFrame:
    with con:
        df = pd.read_sql_query(query, con)
    return df

# Example usage

con = sqlite3.connect("database.db")
query_database(con, "SELECT * FROM users")

Below is another example, this time using a dataclass.

import httpx

# Not good

# because the client is created inside the function

# That means it will be created every time the function is called

# and it will be hard to change the client

# Also, forecasting logic may not be best placed in the product class

@dataclass
class Product:
    product_id: str

def forecast_demand(self, start_date: datetime, end_date: datetime) -> float:
    client = httpx.Client()
    base_url = "<https://api.endpoint.com/product>"
    forecast = client.get(
        f"{base_url}?id={self.product_id}&start={start_date}&end={end_date}"
    )
    return forecast

# Example usage

my_product = Product(123)

demand = my_product.forecast_demand("2023-01-01", "2023-01-31")

# Better

# because the forecasting logic is now separate from the product

# Also, the client is now initiated only once with the `ForecastingClient`

# There may be more setup logic for the client, but this comes with the

# added flexibility

@dataclass
class Product:
    product_id: str

class ForecastingClient:
    def __init__(self, client: httpx.Client, base_url: str):
        self.client = client
        self.base_url = base_url

    def forecast_product_demand(
        self, product: Product, start_date: datetime, end_date: datetime
    ) -> float:
        forecast = self.client.get(
            f"{self.base_url}?id={product.product_id}&start={start_date}&end={end_date}"
        )
        return forecast

# Example usage

# Setup the client once

client = httpx.Client()
base_url = "<https://api.endpoint.com/product>"
my_forecasting_client = ForecastingClient(client=client, base_url=base_url)

# Use the client to forecast demand for a product

my_product = Product(123)
demand = my_forecasting_client.forecast_product_demand(
    product=my_product,
    start_date="2023-01-01",
    end_date="2023-01-31",
)

print(demand)

# > 123.0

6.4 Factory Pattern
I’ve come across the factory pattern and just liked it so I wanted to include it here too, even though it’s definitely not a “modern” Python topic - it has been a classic software design pattern for many decades. The factory pattern is relevant when you want to help the user create objects, as an alternative to instantiating them directly, for example because some additional logic needs to be applied.

Let’s say you receive a list of dictionaries from an API or perhaps from a language model which can be either products or services. We can create an item_factory function that takes a single dictionary and returns either a Product or Service object, depending on its “type” attribute.

# We'll use a `Product` and `Service` class as before

# Here we'll just add a `type` field to each class

# This feels a little redundant, but will be useful here

class Product(BaseModel):
    type: Literal["product"] = "product"
    product_id: str
    weight: float
    relevance: float

class Service(BaseModel):
    type: Literal["service"] = "service"
    service_id: str
    relevance: float

# The `item_factory` function takes a dictionary and returns

# either a `Product` or a `Service` instance based on the `type` field

def item_factory(data: dict) -> Product | Service:
    match data:
        case {"type": "product"}:
            return Product(**data)
        case {"type": "service"}:
            return Service(**data)
        case_:
            raise ValueError()

    # Alternatively, we could have also used the `product_id`
    # and `service_id` fields directly.

    match data:
        case {"product_id": _}:
            return Product(**data)
        case {"service_id": _}:
            return Service(**data)
        case _:
            raise ValueError()

# Example usage

basket = [
    {
        "type": "service",
        "service_id": "Netflix Subscription",
        "relevance": 0.4,
    },
    {
        "type": "product",
        "product_id": "TV",
        "weight": 6.0,
        "relevance": 0.2,
    },
]

my_items = [item_factory(item) for item in basket]

print(my_items)

# > [Service(type='service', service_id='Netflix Subscription', relevance=0.4), Product(type='product', product_id='TV', weight=6.0, relevance=0.2)]

One problem with this implementation is that we will have to edit our item_factory() if we create a new item type (say a “Subscription” type) - this violates the “open-closed principle”. But I think that’s ok here, especially for illustrative purposes. You can always be more abstract, but that in itself is not a good goal.

Another really good and simple approach to achieve the same here would be to use a Pydantic TypeAdapter, which will run through all possible types and choose the (first) one that successfully validates.

from pydantic import BaseModel, TypeAdapter

ta = TypeAdapter(list[Product | Service])

my_items = ta.validate_python(basket)

print(my_items)

# > [Service(type='service', service_id='Netflix Subscription', relevance=0.4), Product(type='product', product_id='TV', weight=6.0, relevance=0.2)]

6.5 Strategy Pattern
In my own words, the strategy pattern allows you to do the same thing in different ways. Like the factory pattern, it’s not new, but I do find it very useful and wanted to include it. Plus, we’ve already seen the strategy pattern a couple of times before in this tutorial, so it makes sense to formally describe it here.

Say you have a “basket” of charities that you want to donate to. You have a budget but how do you distribute it among the charities? You have different options.

equal allocation: divide budget equally across all charities
by relevance: proportional to a personal relevance score
randomly: each item gets a random share of the budget
These are the different “strategies” here.

In my code below, they are implemented as functions that follow a specific signature (ie (Basket) -> list[float]), defined using a Callable. Each strategy functions only creates a weights vector that defines what share of the budget should go to which charity. When we call the distribute_budget function, it uses the strategy to get the weights and then handles the actual distribution of the budget.

You can also implement the strategies using classes (often with the help of inheritance and/or protocols), but we’ll just keep it simpler and functional here. And hey, functional programming is very much in vogue and a good idea in lots of cases.

from typing import Callable

# Define a class for charity

class Charity(BaseModel):
    name: str
    relevance: float
    donation: float | None = None

    def set_donation(self, donation: float) -> None:
        self.donation = donation

# We define a type alias for the allocation strategy, which

# is a callable with the signature (Basket) -> list[float]

AllocationStrategy = Callable[["Basket"], list[float]]

# Our basket class contains a list of charities and a budget

# The `distribute_budget` method takes an allocation strategy

# and distributes the budget among the charities

class Basket(BaseModel):
    charities: list[Charity]
    budget: float

def distribute_budget(self, allocation_strategy: AllocationStrategy) -> None:
    """Distributes the budget among charities based on the allocation strategy."""

    weights = allocation_strategy(self)

    # Just some sanity checks to ensure the weights are valid
    assert sum(weights) == 1.0, "Weights must sum to 1.0"
    assert len(weights) == len(self.charities), "Weights must match number of charities"

    for charity, weight in zip(self.charities, weights):
        charity.set_donation(self.budget * weight)

# Allocation strategies are below

# They all follow the same signature

# (Basket) -> list[float]

# So they can reliably be passed to the `distribute_budget` method

def allocate_equally(basket: Basket) -> list[float]:
    """Allocates budget equally."""
    equal_weight = 1.0 / len(basket.charities)
    return [equal_weight] * len(basket.charities)

def allocate_by_relevance(basket: Basket) -> list[float]:
    """Allocates budget proportional to relevance."""
    total_relevance = sum(charity.relevance for charity in basket.charities)
    return [charity.relevance / total_relevance for charity in basket.charities]

def allocate_randomly(basket: Basket) -> list[float]:
    """Allocates budget based on a sample from the dirichlet distribution."""
    weights = np.random.dirichlet(np.ones(len(basket.charities)))
    return weights.tolist()

# Example usage

basket = Basket(
    charities=[
        Charity(name="Save the Children", relevance=0.6),
        Charity(name="World Wildlife Fund", relevance=0.3),
        Charity(name="Doctors Without Borders", relevance=0.1),
    ],
    budget=2000.0,
)

# Distribute budget by relevance

basket.distribute_budget(allocation_strategy=allocate_by_relevance)

print(basket)

# > charities=[Charity(name='Save the Children', relevance=0.6, donation=1200.0), Charity(name='World Wildlife Fund', relevance=0.3, donation=600.0), Charity(name='Doctors Without Borders', relevance=0.1, donation=200.0)], budget=2000.0)

Minor note on why we have a set_donation() method for the Charity class. This is an example of the “ask, don’t tell” principle. It’s better to have a class control how variables are set rather than manipulate them directly from outside (eg from the Basket class).
6.6 Functional Programming
Form recent talks and posts that I’ve come along, I gathered that many people feel that the use of object oriented patters in Python may have been taken too far at times.

There has been a recent sense that writing less abstract code and just keeping things simple may just be fine, in a lot of cases. Protocols, for example, are one feature that allows you to get rid of inheritance and instead use flatter hierarchies and duck typing. There’s also a bit of a renaissance of functional programming in Python. While this could be it’s own full tutorial, there are only really a couple of topic that I’d like to touch on here.

Pure Functions: The first one is “pure” functions and why you should use them. Pure functions don’t mutate their input, and they don’t have any side effects. They are deterministic, simpler to understand, easier to test, easier to debug, and harder to break. That sounds pretty desirable, right?

A function’s purpose: A function should do one thing only, and it should do it well. If a function does more than one thing, you may want to rethink the design. Of course take this with a big grain of salt - you definitely don’t want to end up with a mess of functions, and there is at least one place where you HAVE TO combine the loose ends. But anyway, I believe that aiming for a clear purpose of each function is important to keep in mind.

Function compositions: The final topic here is what you may call pipelines, function composition, or function chaining.

Here’s an example. Let’s say we want to implement an “agentic search” feature consisting of three components. That is, given the user’s input, (1) a language model first performs a query expansion (ie writes a search query). Then, (2) the expanded query is sent to a vector store to retrieve the most relevant documents. And finally, (3) we want to format the search results nicely.

So overall we want to chain the following three steps, which we can formalize using callables.

Agent is a callable that takes a str (the user input) and returns a str (the new search query).
Searcher is a callable that takes a str (the agent’s search query) and returns a list of str (the search results).
Formatter is a callable that takes a list of str (the search results) and returns a str (a formatted version).
All that we want to combine into a single AgenticSearch function. This function will correspond to a callable that simply takes a str (the user input) and returns a str (the formatted search results). From the outside, this will look like a simple function, but we know that internally, a lot happens.

from functools import partial
from typing import Any

# Let's implement an "agentic search"

# First we define out callables, which are basically

# our "contracts" for the functions we want to use

# We could use a Protocol instead, but this is simpler

Agent = Callable[[str], str]
Searcher = Callable[[str], list[str]]
Formatter = Callable[[list[str]], str]
AgenticSearch = Callable[[str], str]

# The agentic search function requires three functions

def agentic_search_logic(
    user_input: str,
    agent_fn: Agent,
    search_fn: Searcher,
    format_fn: Formatter,
) -> str:
    """Performs an agentic search."""

    # Type hints just for clarity
    I: str = user_input
    Q: str = agent_fn(I)
    S: list[str] = search_fn(Q)
    F: str = format_fn(S)
    return F

# `invoke_agent` follows the Agent Callable

def invoke_agent(user_input: str, agent: Any) -> str:
    """Invokes the agent with the user input. Returns a search query"""
    ...

# `search_vector_store` follows the Searcher Callable

def search_vector_store(query: str, vector_store: Any, n_docs: int = 5) -> list[str]:
    """Searches a vector store for results matching the query."""
    ...

# `format_search_results` follows the Formatter Callable

def format_search_results(results: list[str]) -> str:
    """Formats the search results for display."""
    ...

# We need to set up our `AgenticSearch` with specific functions

# This is a bit of a boilerplate, but it allows us to

# easily swap out the functions if needed

def setup_agentic_search(
    agent_fn: Agent, search_fn: Searcher, format_fn: Formatter
) -> AgenticSearch:
    """Configures the agentic search with specific functions."""

    return partial(
        agentic_search_logic,
        agent_fn=agent_fn,
        search_fn=search_fn,
        format_fn=format_fn,
    )

# Example usage

agentic_search = setup_agentic_search(
    agent_fn=partial(invoke_agent, agent_name="my_agent"),
    search_fn=partial(search_vector_store, collection="my_collection", n_docs=3),
    format_fn=format_search_results,
)

agentic_search = setup_agentic_search()

agentic_search("I'm looking for Nike sneakers in size 10.")

The benefit is that we can now easily change any of the components and still have a working agentic search.

# For example

# New `AgenticSearch` with "passthrough" agent and table format

# This simple agent adheres to the Agent callable

passthrough_agent: Agent = lambda x: x

passthrough_agentic_search = setup_agentic_search(
    agent_fn=passthrough_agent,
    search_fn=partial(search_vector_store, collection="my_collection"),
    format_fn=format_search_results,
)

passthrough_agentic_search("Nike")

This was probably the most complex example in this tutorial. It can also be implemented using an OOP design. In this case, we would then an Agent, a Searcher, and a Formatter protocol or base class. And our AgenticSearch would be an class that will be initialized with one of each.

7 Conclusion

I hope you enjoyed reading this tutorial as much as I did writing it. In fact, while working on it, I noticed that there are almost no Python tutorials covering “modern” topics that aren’t either beginner-level or are just covering one specific topic. So I wanted to change that.

My goal here was just to give a taste of what’s out there and how these tools and techniques can make your Python life a bit easier and your code a bit better. My suggestion is to take away from it whatever you find interesting and learn more about it, for example by reading the official docs or another tutorial.

Or… and this leads me to the last bit of this tutorial, you can also collaborate with AI tools to see how you can apply them to your code.

7.1 My Advice on using AI for Coding
There’s a lot of talk around how AI is reshaping coding and software engineering, and given the rapid progress, I can only do as much as give my opinion on what works best for me right now (or not).

a) Code completions: First of all, AI in-line code completions - as in the likes of GitHub Copilot - are pretty neat and for many developers now an indispensable part of writing code. They are indeed a big step up from the kind of completions that a linter can provide. But I’d still call this an incremental improvement over what we had before LLMs. You can do far more with them than that.

b) Vibe coding: However, I’m also not a fan of taking it as far as vibe coding. It’s cool that this increasingly works, but there are also still some fundamental limitations. And just having a lot of code you don’t really understand won’t cut it if you also want it to work reliably, be maintainable, etc.

One of the limitations that is barely ever talked about (not sure why) is the fact that a coding model won’t necessary know how to write “modern” code. Say a new great library or feature gets released today, your model won’t know know about it and currently cannot just “learn it” like a human can.

c) Code editing: This is something I cannot say too much about, but the idea here is to use a language model to navigate a large existing code base and use it to make incremental code edits, implement feature requests, or solve a GitHub issue. Even though I haven’t tried this much so far, this is definitely another area where AI assistants will become increasingly useful.

d) AI as your software design helper: Most of all, I prefer using AI to help me think through code design choices. This is what I think provides the most value to me right now. In fact, I rarely ever just ask an AI to write large chunks of code all by itself directly. Instead I typically ask for an outline or an example that I can then implement in a way that works for me.

Another tip I have is to ask for options rather than a single solution. I think that’s incredibly powerful - you can only judge a solution based on its alternatives, and this allows you weigh up and understand different options.

For example, I often use questions like:

“As an experienced software engineer, give me some feedback about the design of my code here. Is there anything that you’d do differently.”
“Tell me about dependency injection and how I would use it here. Show me different options.”
“I don’t like that I have xyz as a parameter of the function. What can I do to solve that?”
“Imagine you had to (re-)design ABC…”
