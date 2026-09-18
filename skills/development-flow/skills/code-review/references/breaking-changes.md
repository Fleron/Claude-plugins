# Lens: breaking changes

Search for breaking changes in every external integration surface the repo exposes. Discover which apply here, then check each:

- HTTP or RPC APIs, their routes, request and response schemas, status codes
- CLI commands, parameters, flags, exit codes and output formats scripts may parse
- Configuration loading: file formats, keys, defaults, environment variables
- Persisted data: file formats, database schemas and migrations, serialized sessions or state that existing users must still load
- Library or package public exports, function signatures, exported types
- Events, messages, webhooks and queue payload contracts
- Anything a downstream consumer, CI pipeline or deploy script depends on

Do not stop after finding one issue. Analyze all possible ways a breaking change can happen, including removed defaults, tightened validation and changed ordering. For each, name what breaks, who is affected and whether a migration or compatibility path exists.
