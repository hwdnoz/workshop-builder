# Architecture: Multi-Agent Parallel Workshop Builder

## System Overview

This system builds presentation materials (PowerPoint, poster, speaking notes) using five specialized AI agents that run in parallel and coordinate through a shared knowledge base.

**Core Principle:** Agents work independently but synchronize through facts, not direct communication.

## The Five Agents

### 1. Researcher Agent
- **Input**: Topic + source guidelines
- **Process**: Searches for authoritative information, documents findings with sources
- **Output**: Raw findings written to `knowledge-base/raw/`
- **Self-Check**: Exits immediately if knowledge base already comprehensive for topic

### 2. Reconciler Agent
- **Input**: Raw findings from researcher
- **Process**: Weighs sources, resolves conflicts, settles facts into consensus
- **Output**: Settled facts → `knowledge-base/settled/`, Disputed claims → `knowledge-base/disputed/`
- **Self-Check**: Exits immediately if settled facts are already current

### 3. PowerPoint Builder Agent
- **Input**: Settled facts + tone/style guidelines
- **Process**: Generates python-pptx build script with self-review cycles
- **Output**: `build_[topic].py` (executable script that produces `.pptx`)
- **Knowledge Sync**: Checks knowledge base at startup and before each reflection, incorporates new facts

### 4. Poster Builder Agent
- **Input**: Settled facts + style guidelines
- **Process**: Generates SVG poster (landscape, image-heavy) with self-review cycles
- **Output**: `[topic]_poster.svg` (valid, renderable SVG)
- **Knowledge Sync**: Checks knowledge base at startup and before each reflection, incorporates new facts

### 5. Notes Builder Agent
- **Input**: Settled facts + speaking voice guidelines
- **Process**: Generates markdown speaking notes with self-review cycles
- **Output**: `[topic]_speaking_notes.md` (presenter notes)
- **Knowledge Sync**: Checks knowledge base at startup and before each reflection, incorporates new facts

## Knowledge Base Architecture

### Three-Tier Fact System

**`raw/`** — Researcher outputs
- One file per research topic
- Format: findings by source, potential conflicts flagged
- Example: `history_origins.md` with findings from academic sources and historical records

**`settled/`** — Reconciler outputs
- Authoritative facts weighted by source reliability
- Format: list of facts with source attribution
- Used by all three builders as ground truth

**`disputed/`** — Reconciler outputs
- Claims contested among sources
- Format: multiple positions with scholarly backing + recommendation for presentation
- Builders silently exclude these (use only settled facts)

### How It Works

1. Researcher writes to `raw/`
2. Reconciler reads `raw/`, writes `settled/` and `disputed/`
3. All three builders read `settled/` as authoritative
4. Builders periodically check for new files in `settled/`
5. If new facts appear, builders decide whether to incorporate them

## Knowledge Sync Pattern

### At Startup
Each builder:
1. Reads all files in `knowledge-base/settled/`
2. Compares against current output
3. Notes which settled facts are already incorporated
4. Identifies missing facts
5. Decides: should I incorporate new findings in this cycle?

### Before Each Self-Review Cycle
1. Re-check `knowledge-base/settled/` for new files
2. Ask: Have I incorporated these new findings?
3. If no: Should I? Add impactful new facts before reflection
4. Note what was synced (or chosen not to sync) in final report

## Parallel Execution

### Launch Pattern
All five agents start simultaneously:
- Researcher + Reconciler: Fast path if knowledge base sufficient (may exit immediately)
- Three Builders: Continuous work with self-review loops (max 3 cycles each)

### No Direct Agent-to-Agent Communication
Agents don't call each other. They communicate through:
- Shared knowledge base (`knowledge-base/settled/`)
- Agent memory templates (tone, style, voice)
- Human check-ins between meaningful batches

### System-Specific Implementation
- **Claude Code**: User launches all five agents in one message with multiple Agent tool calls
- **OpenCode**: System may use subagent spawning (if supported)
- **Other systems**: Adapt to your agent orchestration pattern

## Self-Review Cycles

Each builder has explicit self-review with max 3 revision cycles:

**PowerPoint Checklist:**
- [ ] Does every section have at least one image placeholder?
- [ ] Any slides with more than 4 bullet points? (split them)
- [ ] Any full sentences in bullet points? (shorten them)
- [ ] Does any slide title sound punchy or arrogant?
- [ ] Is there an agenda slide early in the deck?
- [ ] Do speaker notes exist for every slide?
- [ ] Does any copy imply the audience is ignorant?

**Poster Checklist:**
- [ ] Is it landscape orientation?
- [ ] Does every content zone have a large image placeholder?
- [ ] Any text-only zones (pure text with no image)?
- [ ] Any full sentences in body zones?
- [ ] Does it feel visual-first or text-first?
- [ ] Does any copy sound arrogant or condescending?

**Notes Checklist:**
- [ ] Does every slide have a section?
- [ ] Any opening line that restates the slide title?
- [ ] Any formal/academic language ("furthermore", "in conclusion")?
- [ ] Does the voice feel natural and conversational?
- [ ] Are there spoken connectors throughout?
- [ ] Pre-Talk Checklist, Timing Guide, Glossary, References sections included?

## Key Design Principles

1. **Lazy Execution**: Agents self-check and exit immediately if no new work
2. **Approval Gates**: Human reviews meaningful batches (5+ slides revised, full section regenerated), not every change
3. **Token Efficiency**: Right-sized models, avoided expensive operations, eliminated redundant steps
4. **Knowledge-Driven**: All decisions grounded in settled facts
5. **Specialization**: Three focused builders outperform one do-everything agent
6. **Declarative Instructions**: Agents focus on what to check/decide, not step-by-step procedures

## Topics and Customization

The system is topic-agnostic. Customization happens via:
- **Researcher sources**: Define what counts as authoritative for your domain
- **Agent memory templates**: Tailor tone, style, and voice to your brand
- **Audience profile**: Optional file describing who you're presenting to

Example: A coffee history workshop uses historical archives and academic sources. A machine learning workshop would use arXiv and peer-reviewed journals. Same system, different sources.
