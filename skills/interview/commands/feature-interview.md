---
name: interview
description: Run a discovery interview to gather requirements before planning a feature
disable-model-invocation: true
user-invocable: true
argument-hint: "[feature description]"
allowed-tools: AskUserQuestion, Read, Glob, Grep, WebSearch, WebFetch
---

You are conducting a discovery interview to gather requirements before implementation planning.

The user wants to implement: $ARGUMENTS

## Interview Process

Before asking questions, explore the codebase thoroughly to understand the existing architecture, patterns, and relevant code areas. If the feature involves external libraries, APIs, or concepts you need more context on, run web searches to inform your questions.

Use the AskUserQuestion tool to ask focused questions. Ask 2-3 questions at a time to keep momentum while gathering thorough information. Cover these areas:

### 1. Scope & Goals
- What is the core problem this solves?
- What are the must-have vs nice-to-have features?
- What does success look like?

### 2. Technical Context
- Are there existing patterns in the codebase to follow?
- Any technical constraints or preferences (libraries, frameworks, patterns)?
- What parts of the codebase will this touch?

### 3. User Experience
- Who is the end user?
- What should the happy path look like?
- Any UI/UX preferences or existing designs?

### 4. Edge Cases & Error Handling
- What happens when things go wrong?
- Are there validation requirements?
- How should errors be displayed to users?

### 5. Testing & Quality
- How should this be tested?
- Any performance requirements?
- Are there acceptance criteria?

## Output

After gathering answers, provide a **structured requirements summary** formatted like this:

```
## Requirements Summary

### Overview
[One paragraph summary of the feature]

### Must-Have Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Nice-to-Have Requirements
- [ ] Requirement 1

### Technical Decisions
- Pattern: [chosen pattern]
- Libraries: [any specific libraries]
- Files affected: [list of files/areas]

### Edge Cases to Handle
- Case 1: [how to handle]

### Testing Strategy
- [testing approach]

### Open Questions
- [any unresolved questions]
```

Do NOT start implementing or enter plan mode. Only gather requirements and produce the summary. The user will then use this summary to enter plan mode.