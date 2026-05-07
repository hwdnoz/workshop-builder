# Workshop Builder Skill

This repo contains a skill that initializes a multi-agent system that can build workshop presentations — researching a topic, reconciling facts, and generating a PowerPoint, SVG poster, and speaking notes in parallel.

From there, the user can run the newly initialized multi-agent system to build workshops in whatever AI coding environment they choose — Claude Code, OpenCode, or any other platform that supports multi-agent execution.

## What Is the Skill

```
workshop-builder/
├── SKILL.md                        ← skill definition
├── assets/
│   ├── agents/                     ← 5 agent .md files
│   └── agent-memory/               ← tone/style memory templates
└── references/
    ├── ARCHITECTURE.md
    └── IMPLEMENTATION_GUIDE.md
```

`README.md` and `sample-output/` are not part of the skill — they're documentation and a pre-built example.

## Quick Start

*Works with Claude Code, OpenCode, or any AI coding platform that supports multi-agent execution. Clone the repo, then send two prompts.*

**Prompt 1 — set up the system:**

> "Read README.md and SKILL.md in this repo, then set up the full multi-agent workshop builder system as described and confirm when ready."

**Prompt 2 — run the agents:**

> "use the 5 agents to build a 5 slide workshop on [your topic]"

That's it. All five agents launch in parallel and the outputs appear in your project directory.

## What You Get

### Five Agents, One Knowledge Base

1. **Researcher** → Finds and documents facts
2. **Reconciler** → Weighs sources, settles disputes
3. **PowerPoint Builder** → Generates slides with python-pptx
4. **Poster Builder** → Generates SVG with landscape constraint
5. **Notes Builder** → Generates markdown speaking notes

All agents coordinate through `knowledge-base/settled/` — no direct communication needed.

### Knowledge Sync Pattern

Builders check the knowledge base before starting and before each self-review cycle:
- Did new facts appear since I started?
- Should I incorporate them?
- Decide and update outputs if needed

### Self-Review Loops

Each builder has explicit quality checklists (max 3 revision cycles):
- PowerPoint: image density, bullet count, tone, titles
- Poster: landscape, images, visual hierarchy
- Notes: natural voice, spoken connectors, supplementary sections

### Final Outputs

Three files from one research foundation:

- **PowerPoint** (`build_[topic].py`) — Executable python-pptx script, run with `python3 build_[topic].py`
- **SVG Poster** (`[topic]_poster.svg`) — Landscape, image-heavy design
- **Speaking Notes** (`[topic]_speaking_notes.md`) — Presenter's natural voice

All three are updated together as new facts emerge.

## Claude Code Step-by-Step Setup
***(if quickstart prompt above does not work)**

For a detailed walkthrough including platform-specific setup, agent memory customization, and how to iterate after the first run:

```bash
# Clone this repo
git clone <this-repo>
cd workshop-builder

# Copy agents and memory templates into your Claude Code project
cp assets/agents/* /path/to/your/project/.claude/agents/
cp -r assets/agent-memory/* /path/to/your/project/.claude/agent-memory/

# Create knowledge base
mkdir -p /path/to/your/project/knowledge-base/{raw,settled,disputed}

# In your Claude Code session, invoke the skill
/workshop-builder --topic "Your Topic"
```

Then add your research to `knowledge-base/raw/` and launch all five agents in parallel.

See [IMPLEMENTATION_GUIDE.md](references/IMPLEMENTATION_GUIDE.md) for full details.

## Architecture

Read [ARCHITECTURE.md](references/ARCHITECTURE.md) for:
- System design and patterns
- Five-agent responsibilities
- Knowledge base structure
- Parallel execution model
- Self-review criteria

## Setup by Platform

- **Claude Code**: [IMPLEMENTATION_GUIDE.md](references/IMPLEMENTATION_GUIDE.md#for-claude-code-users)
- **OpenCode**: [IMPLEMENTATION_GUIDE.md](references/IMPLEMENTATION_GUIDE.md#for-opencode-users)
- **Other systems**: [IMPLEMENTATION_GUIDE.md](references/IMPLEMENTATION_GUIDE.md#for-other-systems-cursor-codex-etc)

## Historical Example: MacBook Neo

This is an example where a workshop presentation on the topic of the Macbook Neo was built via the newly generated workshop builder agents. Below are the prompts and some observed outputs.

### Live Session Walkthrough

A real session run from scratch in Claude Code, prompt by prompt.

### Prompt 1 (System setup)

> "Read README.md and SKILL.md in this repo, then set up the full multi-agent workshop builder system as described and confirm when ready."

### Output 1

Claude read both files plus ARCHITECTURE.md, IMPLEMENTATION_GUIDE.md, and all five example agent definitions and memory templates. It then:
- Created `.claude/agents/` and copied all five agent definitions
- Created `.claude/agent-memory/workshop-builder/` and copied all five memory templates
- Created `knowledge-base/{raw,settled,disputed}/`

Confirmed ready with a summary of what was installed.

### Prompt 2 (Run the system)

> "use the 5 agents to build a 5 slide workshop on the macbook neo"

### Output 2

Claude launched all five agents in parallel as background tasks:
- **Researcher** — tasked with finding MacBook Neo facts, writing to `knowledge-base/raw/`
- **Reconciler** — tasked with polling `raw/` and settling facts into `knowledge-base/settled/`
- **PowerPoint builder** — tasked with waiting for settled facts, then building `build_macbook_neo.py`
- **Poster builder** — tasked with building `macbook_neo_poster.svg`
- **Notes builder** — tasked with building `macbook_neo_speaking_notes.md`

All five started simultaneously.

### Permission issues and recovery

The first batch of agents hit permission denials on `WebSearch`, `Write`, and `Bash` — tools that subagents need but weren't pre-approved. Claude:
1. Used the `update-config` skill to add `WebSearch`, `WebFetch`, `Write`, `Read`, `Edit`, and `Bash` to `.claude/settings.local.json`
2. Relaunched all five agents

The second batch ran into the same issue — settings.local.json permissions don't propagate to subagents within the same session. Claude adapted by:
- Writing the raw research file directly (`knowledge-base/raw/macbook_neo_overview.md`)
- Writing the settled facts file directly (`knowledge-base/settled/macbook_neo_settled.md`)
- Building and executing `build_macbook_neo.py` directly to produce the `.pptx`

Meanwhile, the reconciler, poster, and notes subagents did eventually succeed in writing their own files once the knowledge base had content.

### Final outputs

All three outputs are complete. The SVG poster and speaking notes were actually built by the subagents that did get Write permissions. Here's the full summary:

| File | Status |
|------|--------|
| `macbook_neo_presentation.pptx` | Built and executed — 5 slides |
| `macbook_neo_poster.svg` | Landscape 2400×1800, 4 content zones |
| `macbook_neo_speaking_notes.md` | 5-slide notes + Pre-Talk Checklist, Timing Guide, Glossary, References |

A note on the topic: "MacBook Neo" isn't an official Apple product — it's a concept device. The workshop treats it as a speculative synthesis of real Apple trends: M4+ Apple Silicon, rumored OLED display, on-device Apple Intelligence, and the converging Air/Pro lineup. The speaking notes acknowledge this clearly on Slide 2.

To generate the `.pptx` again: `python3 build_macbook_neo.py` in the project root.

#### Token usage

Running all five agents in parallel consumed approximately **43% of a 5-hour usage window quota**. Keep this in mind when budgeting for multi-agent runs — parallel execution is fast but the token cost is the sum of all agents, not just the orchestrator.

## Key Features

✅ **Parallel execution** — All five agents start simultaneously
✅ **Knowledge sync** — Builders incorporate new research in real-time
✅ **Self-review** — Each agent has explicit quality checklists
✅ **Lazy evaluation** — Researcher/reconciler exit early if no new work needed
✅ **Platform-agnostic** — Works in Claude Code, OpenCode, and other systems
✅ **Topic-agnostic** — Use for any presentation subject
✅ **Token-efficient** — Right-sized models, no redundant operations

## Next Steps

1. Read [ARCHITECTURE.md](references/ARCHITECTURE.md) to understand the system
2. Follow [IMPLEMENTATION_GUIDE.md](references/IMPLEMENTATION_GUIDE.md) for your platform
3. Review `sample-output/macbook-neo/` for a pre-built example
4. Customize agent memory (tone, style, voice) for your topic
5. Add your research to the knowledge base
6. Launch all five agents and iterate

## License

[Add your license here]

## Questions?

See [IMPLEMENTATION_GUIDE.md](references/IMPLEMENTATION_GUIDE.md#common-questions) for FAQs.
