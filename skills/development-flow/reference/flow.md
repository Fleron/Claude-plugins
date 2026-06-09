# development-flow: Plan → Build → Ship

```mermaid
flowchart LR
  FP[feature-planning<br/>plan mode → feature-plan] -->|accept clears ctx| IP[implementation-planning<br/>plan mode → technical plan]
  IP -->|accept clears ctx| EX[execute the plan<br/>not a skill — plan is self-describing]
  EX -->|plan's last step| BR[build-review<br/>N parallel · base prompt · ranked]
  BR -->|fixes| EX
  BR -->|clean + testing plan| HT{human acceptance test}
  HT -->|issues| EX
  HT -->|good| SR[ship-review<br/>N parallel · ship prompt · simple fixes]
  SR -->|must-fix| EX
  SR -->|ok| C[commit msg / manual publish]
```

Each box is a skill or gate. Planning skills accept via `ExitPlanMode` (saves +
clears context). Reviews run standalone, any time, read-only. The human commits
and publishes manually.
