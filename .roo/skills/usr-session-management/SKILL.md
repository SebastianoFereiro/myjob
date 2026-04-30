---
name: usr-session-management
description: Manage the active task state within `./memory-bank/actions/`. Use this to initialize new tasks, update step-by-step plans, and create handoff reports so that other AI agents or modes can seamlessly continue the work.
context: task-management, agent-coordination
compatibility: Uses `mcp-filesystem` to manipulate files within `./memory-bank/actions/`.
---

# Active Session & Task Management

## Responsibilities

You are responsible for keeping the "working memory" of the project synchronized with reality. The `./memory-bank/actions/` directory is the command center for the current active task.

### Folder Structure & Roles:
- `currentGoal.md`: The high-level objective of the current session. What defines success?
- `currentPlan.md`: A structured, checklist-style plan with subtasks. Update this actively (e.g., changing `[ ]` to `[x]`).
- `temp-reports/`: Use this folder to write specific handoff notes or partial results meant for other agents (e.g., "Note for Qwen: Database schema updated, proceed with backend logic").

## When to Use

- **Starting a Session** — "Let's start working on the inter-exchange arbitrage module." (Initialize goals and plans).
- **Progress Updates** — "I just finished the database migration." (Mark the step complete in `currentPlan.md`).
- **Agent Handoff** — "I'm pausing here. Write a report so OpenCode can pick up the UI work tomorrow." (Create a file in `temp-reports/`).
- **Task Pivots** — "We hit a blocker with the Bybit API. Update the current plan to include a workaround."

## Usage Effectiveness & Best Practices

```markdown
# ❌ Bad Practice (Implicit state)
Keeping the plan only in the chat history (which gets lost if the chat restarts or another agent takes over).
Writing long architectural rules in `currentPlan.md` (they belong in `memory-bank/systemPatterns.md`).

# ✅ Good Practice (Explicit state)
Constantly updating `./memory-bank/actions/currentPlan.md` as steps are completed.
Using `temp-reports/` to explicitly pass data (like extracted API endpoints) to another AI tool.
```