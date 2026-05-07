---
name: scaffold-workshop-builder
description: Scaffold a multi-agent parallel presentation builder system for any topic. Creates five specialized agents that research, reconcile facts, and generate PowerPoint, SVG poster, and speaking notes in parallel with knowledge sync checkpoints.
---

# Scaffold Workshop Builder Skill

## What This Skill Does

Creates a complete multi-agent workshop presentation system tailored to any topic. When invoked, it scaffolds:
- Five specialized agents (researcher, reconciler, pptx builder, poster builder, notes builder)
- Knowledge base structure (raw findings, settled facts, disputed claims)
- Agent memory templates (tone, style, voice guidelines)
- Orchestration pattern for parallel execution

## When to Use

Invoke this skill when you want to:
- Build a workshop presentation on a specific topic
- Generate multiple output formats (PowerPoint, poster, speaking notes) from one research foundation
- Use an AI-driven research and design system with quality checkpoints

## Quick Start

```
/scaffold-workshop-builder --topic "Your Presentation Topic"
```

This creates:
```
workshop-builder-[topic]/
├── agents/
│   ├── researcher.md
│   ├── reconciler.md
│   ├── builder-pptx.md
│   ├── builder-poster.md
│   └── builder-notes.md
├── agent-memory/workshop-builder/
│   ├── powerpoint_tone.md
│   ├── speaking_notes_tone.md
│   ├── poster_style.md
│   └── workshop_style_and_audience.md
├── knowledge-base/
│   ├── raw/
│   ├── settled/
│   └── disputed/
└── README.md (setup instructions)
```

## How It Works

### The Five-Agent System

1. **Researcher Agent** — Finds and documents facts about your topic
2. **Reconciler Agent** — Weighs sources, settles disputes, produces authoritative facts
3. **PowerPoint Builder** — Generates `build_[topic].py` (python-pptx script)
4. **Poster Builder** — Generates `[topic]_poster.svg` (landscape SVG)
5. **Notes Builder** — Generates `[topic]_speaking_notes.md` (presenter notes)

### Parallel Execution

All five agents launch simultaneously. The researcher and reconciler may exit early if the knowledge base already has sufficient facts. The three builders work continuously and sync with the knowledge base before each self-review cycle, incorporating new findings as they arrive.

### Knowledge Sync Pattern

Builders check the knowledge base at startup and before each reflection cycle:
- Compare current output against available settled facts
- Decide whether new research warrants incorporating into the presentation
- Update outputs if impactful new information exists

### Self-Review Cycles

Each builder has an explicit self-review checklist (max 3 cycles):
- PowerPoint: image placeholders, bullet density, tone, titles, agenda, speaker notes
- Poster: landscape orientation, image density, text density, visual hierarchy
- Notes: slide coverage, natural voice, spoken connectors, supplementary sections

## Next Steps

1. **Review ARCHITECTURE.md** — Understand the five-agent pattern and knowledge sync
2. **Read IMPLEMENTATION_GUIDE.md** — Set up for your system (Claude Code, OpenCode, etc.)
3. **Populate knowledge base** — Add research to `knowledge-base/raw/`
4. **Launch all five agents** — Follow platform-specific instructions in IMPLEMENTATION_GUIDE.md
5. **Review and iterate** — Check in after meaningful batches of work

## References

- [ARCHITECTURE.md](references/ARCHITECTURE.md) — System design and patterns
- [IMPLEMENTATION_GUIDE.md](references/IMPLEMENTATION_GUIDE.md) — How to set up for your platform
- [assets/](assets/) — Template agent and memory files
- [sample-output/macbook-neo/](sample-output/macbook-neo/) — Pre-built example output
