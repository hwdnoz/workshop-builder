---
name: workshop-builder
description: Set up a multi-agent workshop presentation system for your platform. Reads the existing agent definitions and tone reference, then scaffolds equivalent agents using your platform's native conventions.
---

# Workshop Builder Skill

When invoked, read the existing agent definitions and set up equivalent agents for the current platform.

## Step 1 — Read the source files

Read all five agent definitions in `.claude/agents/`:
- `researcher.md`
- `reconciler.md`
- `builder-pptx.md`
- `builder-poster.md`
- `builder-notes.md`

Read the shared tone reference: `references/tone.md`

## Step 2 — Scaffold agents for your platform

Using the agent definitions as source of truth, create equivalent agents using your platform's native conventions. Preserve:
- Each agent's role and responsibilities
- The knowledge base structure (`knowledge-base/raw/`, `knowledge-base/settled/`, `knowledge-base/disputed/`)
- The tone and voice rules from `references/tone.md`
- The self-review checklists
- The knowledge sync pattern (agents read settled facts before and during each revision cycle)

Do not copy Claude Code conventions verbatim — adapt paths, formats, and agent definitions to what your platform natively supports.

## Step 3 — Create knowledge base directories

```
knowledge-base/
├── raw/
├── settled/
└── disputed/
```

## Step 4 — Confirm

Report what was created and give the user this next step:

> "use the 5 agents to build a workshop on [topic]"
