# Implementation Guide

Choose your platform below and follow the setup instructions.

## For Claude Code Users

### Setup

1. **Clone or download this repo** into your Claude Code workspace
2. **Copy agent definitions**:
   ```
   cp assets/agents/* .claude/agents/
   cp -r assets/agent-memory/* .claude/agent-memory/
   ```
3. **Create knowledge base structure**:
   ```
   mkdir -p knowledge-base/{raw,settled,disputed}
   ```
4. **Create `.claude/agent-memory/workshop-builder/` if it doesn't exist** and populate with tone/style files from `assets/agent-memory/`

### Populate with Your Research

Add your research findings to `knowledge-base/raw/`:
- Create `.md` files documenting what you've found
- Include sources (URLs, books, authors)
- Flag any conflicting information
- See `sample-output/macbook-neo/knowledge-base/` for format examples

### Launching All Five Agents in Parallel

In your Claude Code session, send a single message with all five Agent tool calls:

```
Use the researcher agent to research "[Your Topic]"
Use the reconciler agent to reconcile the knowledge base
Use the builder-pptx agent to build the PowerPoint
Use the builder-poster agent to build the SVG poster
Use the builder-notes agent to build the speaking notes
```

Claude will spawn all five simultaneously. The researcher and reconciler may exit immediately if no new work is needed.

### What to Expect

**Timing:**
- Researcher: 2-5 minutes (if researching) or <30 seconds (if exiting early)
- Reconciler: 2-3 minutes (if reconciling) or <30 seconds (if exiting early)
- Three builders: 5-10 minutes each with 2-3 self-review cycles

**Outputs:**
- `build_[topic].py` — Run with `python3 build_[topic].py` to generate `.pptx`
- `[topic]_poster.svg` — Open in any browser or design tool
- `[topic]_speaking_notes.md` — Open in any markdown editor

**Check-ins:**
- After researcher/reconciler complete, you can start iterating with the builders
- Builders periodically check the knowledge base and may incorporate new findings

### Subsequent Cycles

To improve the outputs, you can:
1. Add more research to `knowledge-base/raw/`
2. Launch the reconciler again (it will update `settled/` with new findings)
3. Launch the builders again (they'll notice new facts and decide whether to incorporate)
4. Review and iterate

## For OpenCode Users

### Architecture Understanding

First, read [ARCHITECTURE.md](ARCHITECTURE.md) to understand:
- The five-agent pattern
- Knowledge base structure
- Parallel execution model
- Knowledge sync checkpoints

### Setup

1. **Clone or download this repo**
2. **Adapt agent definitions**:
   - Review `assets/agents/*.md`
   - Convert to opencode's agent format
   - Maintain the same responsibilities and self-review checklists
3. **Implement orchestration**:
   - If opencode supports subagent spawning: Create an orchestrator that launches all five
   - If not: Create a runner script that executes them in sequence or parallel batches
4. **Set up knowledge base** structure (same as Claude Code)

### Key Constraints to Maintain

- **Researcher self-checks**: If knowledge base is comprehensive, exit immediately (don't re-research)
- **Reconciler self-checks**: If settled facts are current, exit immediately (don't re-reconcile)
- **Three builders**: Should run continuously with 2-3 self-review cycles
- **Knowledge sync**: Builders check knowledge base at startup and before each reflection
- **Max 3 revision cycles**: Per builder, to avoid infinite loops

### Implementation Decisions You'll Make

**Parallel vs. Sequential:**
- Claude Code uses user-initiated parallel Agent calls
- OpenCode may support subagent spawning (use it if available)
- Otherwise, batch in stages: (researcher + reconciler) → (three builders)

**Model selection:**
- Lightweight: Haiku-class model for researcher
- Mid-level: Sonnet-class for reconciler and builders
- Avoid expensive models unless you need them

**File I/O:**
- All agents read/write to the shared `knowledge-base/` directory
- Use same directory structure (`raw/`, `settled/`, `disputed/`)

## For Other Systems (Cursor, Codex, etc.)

### Understanding the Pattern

Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the five-agent system and how they coordinate through a shared knowledge base, not direct communication.

### Adaptation Steps

1. **Map to your agent system**: How does your system define and execute agents?
2. **Implement the five roles**:
   - Researcher (searches for facts)
   - Reconciler (settles disputes)
   - Three builders (PowerPoint, poster, notes)
3. **Create knowledge base** with `raw/`, `settled/`, `disputed/` directories
4. **Implement knowledge sync**: Builders check for new facts before each reflection
5. **Set up self-review checklists**: Copy from `assets/agents/` for each builder type
6. **Handle orchestration**: Find your system's way to launch agents in parallel

### Reference Examples

- `assets/agents/` — See how Claude Code agent definitions work
- `assets/agent-memory/` — See how memory/context works
- [ARCHITECTURE.md](ARCHITECTURE.md) — Understand the system design

## Common Questions

**Q: Can I run just one or two agents?**
A: Yes. The system is modular. You can run just the researcher, or just the builders. The knowledge base will be incomplete but it will work.

**Q: What if my topic has lots of disputed facts?**
A: Disputed facts go to `knowledge-base/disputed/`. Builders ignore them (use only settled facts). If too many disputes exist, the reconciler should do more research or ask a human to resolve.

**Q: Can I customize the tone/style?**
A: Yes. All tone and style is in `agent-memory/workshop-builder/`. Edit `powerpoint_tone.md`, `speaking_notes_tone.md`, `poster_style.md` to match your voice.

**Q: How often should I check in?**
A: After a meaningful batch of work: 5+ slides revised, a full section regenerated, or a major structural change. Not for every small fix.

**Q: Can I add my own custom agents?**
A: Yes. Follow the pattern (read from knowledge base, write outputs to project directory, implement self-review). Add to `agents/` folder.

## Next Steps

1. Choose your platform (Claude Code, OpenCode, other)
2. Follow the setup instructions above
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) for deeper understanding
4. Review `sample-output/macbook-neo/` to see a pre-built example
5. Customize agent memory templates for your topic and voice
6. Populate your knowledge base with research
7. Launch the system and iterate
