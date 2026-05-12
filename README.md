# Workshop Builder

A skill that initializes a multi-agent system for building workshop presentations — researching a topic, reconciling facts, and generating a PowerPoint, SVG poster, and speaking notes.

## Quick Start

| Platform | Command |
|----------|---------|
| Claude Code | `/workshop-builder` |
| Opencode | `run workshop-builder` |

Then:

```
use the 5 agents to build a workshop on [your topic]
```

That's it.

## Architecture

The system is defined in `.claude/skills/workshop-builder/SKILL.md`. The key concepts:

**Five-agent pipeline**
- **Researcher** — finds facts from authoritative sources, writes to `knowledge-base/raw/`
- **Reconciler** — weighs sources, resolves conflicts, writes to `knowledge-base/settled/` and `knowledge-base/disputed/`
- **PowerPoint builder** — generates a python-pptx build script → `.pptx`
- **Poster builder** — generates a landscape SVG poster
- **Notes builder** — generates markdown speaking notes in the presenter's natural voice

**Shared knowledge base**
All agents coordinate through the file system — no direct communication. Builders read `knowledge-base/settled/` before starting and before each self-review cycle, so new research is incorporated as it arrives.

**Reflective decision steps**
Each agent checks whether work is actually needed before starting (researcher and reconciler exit early if the knowledge base is already current). Each builder runs an explicit quality checklist and self-corrects up to 3 times before reporting done.

**Parallel execution**
All five agents can run simultaneously. The builders poll for settled facts and incorporate them as the researcher and reconciler complete their work.

## Outputs

Three files from one research foundation:

| File | Description |
|------|-------------|
| `build_[topic].py` | python-pptx build script — run with `python3 build_[topic].py` |
| `[topic]_poster.svg` | Landscape 2400×1800 SVG poster |
| `[topic]_speaking_notes.md` | Markdown speaking notes in presenter voice |

## Example: MacBook Neo

A real session run from scratch in Claude Code.

**Prompt:** `use the 5 agents to build a 5 slide workshop on the macbook neo`

Claude launched all five agents in parallel:
- Researcher found MacBook Neo facts and wrote to `knowledge-base/raw/`
- Reconciler settled facts into `knowledge-base/settled/`
- Three builders generated outputs simultaneously

**Final outputs:**

| File | Status |
|------|--------|
| `macbook_neo_presentation.pptx` | 5 slides |
| `macbook_neo_poster.svg` | Landscape 2400×1800, 4 content zones |
| `macbook_neo_speaking_notes.md` | 5-slide notes + Pre-Talk Checklist, Timing Guide, Glossary, References |

A note on the topic: "MacBook Neo" isn't an official Apple product — it's a speculative synthesis of real Apple trends: M4+ Apple Silicon, rumored OLED display, on-device Apple Intelligence, and the converging Air/Pro lineup. The speaking notes acknowledge this on Slide 2.

Note: the researcher agent treated MacBook Neo as a theoretical/unreleased product rather than a live one.

**Token usage:** Running all five agents in parallel consumed approximately 43% of a 5-hour usage window quota. Parallel execution is fast but the token cost is the sum of all agents.

See `sample-output/macbook-neo/` for the pre-built example files.

## Presentation Coach

A local web app for practicing your talk and refining your speaking notes.

```
presentation-coach/
├── Makefile
├── backend/          ← FastAPI + Whisper + Ollama
└── frontend/         ← React/Vite UI
```

Record yourself practicing a section → Whisper transcribes it locally → Mistral 7B rewrites your speaking notes to clean up delivery (removes filler words, repetition, run-ons) without changing your voice or tone. Also gives brief coaching feedback on pacing, clarity, and energy.

### Prerequisites

```bash
brew install ffmpeg
```

> **Note:** The `/suggest` endpoint (which rewrites speaking notes via Mistral 7B) requires Ollama. If you don't have Ollama installed or don't need AI rewriting, comment out the `ollama pull` step and the `/suggest` route in `backend/main.py` — the transcription and save features will still work.
>
> To enable the full experience:
> ```bash
> brew install ollama
> ollama pull mistral:7b
> ```

### Run

```bash
cd presentation-coach
make
```

Open [http://localhost:5173](http://localhost:5173). Ollama starts automatically if not already running.

### Configuring the notes file

By default the backend looks for `speaking_notes.md` two directories above `backend/`. Override with:

```bash
NOTES_PATH=/path/to/your/notes.md make
```

---

## License

[Add your license here]
