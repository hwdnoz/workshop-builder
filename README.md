# Scaffold Workshop Builder

**Build professional presentation materials (PowerPoint, poster, speaking notes) using AI agents that research, reconcile facts, and generate outputs in parallel.**

This system demonstrates how to architect a multi-agent AI workflow that:
- Runs five specialized agents simultaneously
- Coordinates through a shared knowledge base (not direct communication)
- Incorporates new research findings in real-time
- Maintains quality through self-review cycles
- Works across different AI coding platforms (Claude Code, OpenCode, Codex, etc.)

## Quick Start (Claude Code)

```bash
# Clone this repo
git clone <this-repo>
cd scaffold-workshop-builder

# Copy agents and memory templates into your Claude Code project
cp examples/claude-code/agents/* /path/to/your/project/.claude/agents/
cp -r examples/claude-code/agent-memory/* /path/to/your/project/.claude/agent-memory/

# Create knowledge base
mkdir -p /path/to/your/project/knowledge-base/{raw,settled,disputed}

# In your Claude Code session, invoke the skill
/scaffold-workshop-builder --topic "Your Topic"
```

Then add your research to `knowledge-base/raw/` and launch all five agents in parallel.

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for detailed setup.

## What You Get

Three output formats from one system:

- **PowerPoint** (`build_[topic].py`) — Executable python-pptx script
- **SVG Poster** (`[topic]_poster.svg`) — Landscape, image-heavy design
- **Speaking Notes** (`[topic]_speaking_notes.md`) — Presenter's natural voice

All three share the same research foundation and are updated together as new facts emerge.

## How It Works

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

## Architecture

Read [ARCHITECTURE.md](ARCHITECTURE.md) for:
- System design and patterns
- Five-agent responsibilities
- Knowledge base structure
- Parallel execution model
- Self-review criteria

## Setup by Platform

- **Claude Code**: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md#for-claude-code-users)
- **OpenCode**: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md#for-opencode-users)
- **Other systems**: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md#for-other-systems-cursor-codex-etc)

## Examples

`examples/claude-code/` contains a complete working example:
- Five agent definitions (`.md` files)
- Agent memory templates (tone, style, voice)
- Sample knowledge base structure
- README with setup instructions

This was built for a coffee history workshop as a working example, but the system is topic-agnostic. Swap out the research sources and agent memory, and it works for any presentation topic.

## Key Features

✅ **Parallel execution** — All five agents start simultaneously
✅ **Knowledge sync** — Builders incorporate new research in real-time
✅ **Self-review** — Each agent has explicit quality checklists
✅ **Lazy evaluation** — Researcher/reconciler exit early if no new work needed
✅ **Platform-agnostic** — Works in Claude Code, OpenCode, and other systems
✅ **Topic-agnostic** — Use for any presentation subject
✅ **Token-efficient** — Right-sized models, no redundant operations

## Next Steps

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
2. Follow [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for your platform
3. Review `examples/claude-code/` for a working implementation
4. Customize agent memory (tone, style, voice) for your topic
5. Add your research to the knowledge base
6. Launch all five agents and iterate

## License

[Add your license here]

## Questions?

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md#common-questions) for FAQs.
