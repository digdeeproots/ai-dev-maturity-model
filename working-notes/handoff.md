# Handoff — Next Claude Instance

*Written 2026-05-20. Context was getting full; this picks up cleanly.*

---

## Read First (in order)

1. **`closet/dev-and-check/briefings/pattern-iterate.md`** — the iteration workflow used throughout. Read it carefully. You will use it constantly. Key rule: commit before showing anything, commit human edits before responding to them.

2. **`work/local/CLAUDE.md`** — project structure (Vue 3 app, model JSON files, path aliases).

3. **`work/local/working-notes/vigilance-axis-brainstorm.md`** — the core concepts document. This is the primary reference for everything we've developed. Includes three rounds of transcript + interpretations sections. Read all of it.

4. **`work/local/working-notes/model-structure-challenge.md`** — challenges to the 2D grid, the systemic insights section, and the summary of alternative models. Read for orientation before touching the alternatives.

5. **`work/local/working-notes/alternatives/delegation-model.md`** — the main model prototype. The assurance spectrum (levels 0–5) lives here. This is the most detailed developed artifact. Read before doing any model work.

6. **`work/local/working-notes/alternatives/fluency-dag.md`** — the DAG alternative. Shorter; read for the node/edge structure and the vigilance-toil-as-missing-assurance-nodes insight.

7. **`work/local/model/`** — the existing maturity model JSON files (overview.json, agency_stages.json, agency_substages.json, fate-determining-choices.json, responsibility_ownership.json). These are the source you are extending. Skim them once; refer back as needed.

### Background (read if you need context on where ideas came from)

- `work/talks/craft2026-arlo/core-insight.md` — the craft talk's core insight (vigilance toil, design for carelessness, deterministic orchestration). Dense; useful.
- `work/talks/craft2026-arlo/brainstorm.md` — rich brainstorm of talk concepts; the world-design section and "agent's universe" examples are directly relevant.
- `work/talks/craft2026-arlo/concept-sort.md` — what's in/out of the talk. Good for terminology.
- `work/talks/craft2026-arlo/topic.md` — the talk document, including the key-moments/stories section. Concrete examples.

---

## What We've Built

### The Core Extension

The existing model has one primary axis: **Agency** (who acts / who decides what happens next). We are adding a second axis: **Sustainability** (working name — ease of achieving high safety; specifically, how easily careless implementors can thrive without producing unintended effects).

The two axes together define a 2D space where most combinations are dangerous and a narrow safe path exists. The danger zone: high agency without corresponding sustainability investment produces vigilance toil that humans cannot sustain, leading to compounding maintenance costs and defects.

### Key Findings (already established — don't re-derive)

**Vigilance toil is multiplicative:** `toil cost ∝ new work rate × existing body of work`. This is why AI hits brownfield codebases disproportionately (AI increases new work rate; it doesn't change the existing body). Greenfield is nearly immune; brownfield is catastrophic without sustainability investment first.

**The assurance spectrum (0–5):**
- 5: Guided correctness — environment makes right action easy, wrong action hard to attempt (refactoring tools, compiler-backed reference finding). Zero vigilance + improved work quality.
- 4: Prevention — mistake cannot propagate past the originator (type systems, theorem provers, AST tools enforced by workflow). Zero vigilance within scope.
- 3: Deterministic detection — catches known classes reliably; predictable gaps (entirely misses some categories). Near-zero for covered classes.
- 2: Non-deterministic guardian — probabilistic detection; unpredictable gaps; can be broader than level 3 via multiple runs. Use to discover new categories, then harden to 3/4.
- 1: Human review — full vigilance burden; decays over time.
- 0: None.

Key distinctions: levels 4–5 can reach zero vigilance within scope; levels 0–3 cannot. Level 2 can be broader than level 3 (accumulates discovery across runs) but has unpredictable gaps. Every level has a scope; precision of scope description increases with level.

**The error visibility criterion:** Level 4 vs. level 3 distinction is propagation, not timing. A type checker that runs immediately before output is shared prevents propagation — that's level 4. Unit tests catch known cases after the fact — level 3. You can't "fail to imagine" a type comparison the way you can a test case.

**Agency may not be primary:** Sustainability comes first; agency is the reward you get after you've made work safe to delegate. The relationship is asymmetric, not symmetric.

**The immune system metaphor (root):** Software developers are the company's immune system; product is the brain. The brain survives tigers; the immune system prevents disease. "Only a little salmonella" makes sense to the brain; the immune system sees the categorical difference between "you'll probably fight it off" and "actually clean food." Vigilance toil = immune suppression.

**The maintenance trap is in scope:** Teams in 100% maintenance mode, with no AI, are already in the vigilance trap. The investment path is identical — just with fewer available mechanisms at levels 4–5 in the human universe. This is not an AI problem; AI just makes it visible faster.

**The "no human to blame" dynamic:** At low agency, failures are attributed to individual humans (fiction that hides systemic gaps). As AI agency increases, that fiction disappears; expectations rise; the gap becomes undeniable.

**Brakes, not engine:** Your speed (agency) is limited by your brakes (sustainability). Teams obsess over engine; the bottleneck is always the brakes.

### Model Alternatives Explored

Three alternatives are prototyped in `working-notes/alternatives/`:

**Delegation model** (portfolio + structured variants) — the main working model. Portfolio is open-world (you define zones); structured map is closed-world (comprehensive taxonomy from responsibility matrix, consistent measurement, drill-down options per region). Use structured map to discover gaps; use portfolio to track investments. Both use the same 0–5 assurance spectrum.

**Fluency DAG** — directed acyclic graph. Work nodes and assurance nodes. Edges are prerequisites. Missing assurance nodes before work nodes = visible vigilance trap. Multiple valid paths. Inspired by the Agile Engineering Fluency map.

The 2D grid is challenged but not abandoned — it may still be useful as a summary visualization calculated from the underlying portfolio/matrix state.

---

## What's Next

### Step 1: Behavioral Matrix (next version of the model)

Extend the existing responsibility matrix into a full behavioral matrix:
- Each responsibility gets both a **work delegation** column (who performs this, agency level) and one or more **assurance** columns (what mechanism ensures correctness, 0–5 level)
- Currently missing: most responsibilities have only the work side; the assurance side needs to be added for each
- For each responsibility, identify **portfolio options** — specific investments that can improve assurance level (concrete, actionable, labeled by mechanism type and assurance level achieved)
- Make visible where gaps exist: work delegation level > assurance level = vigilance toil

This is the "structured delegation map" variant of the delegation model, applied to the existing responsibility matrix.

### Step 2: Fluency DAG (version after that)

Convert the behavioral matrix into a DAG:
- Each responsibility × assurance-investment = one node
- Edges = prerequisite relationships (you need X before you can safely do Y)
- Visualize with work nodes and assurance nodes; missing assurance nodes are visually distinct
- Should resemble the Agile Engineering Fluency map in structure and navigability
- Reference: https://arlobelshee.github.io/AgileEngineeringFluency/Stages_of_practice_map.html

---

## How to Work

### Iteration Pattern

Use `closet/dev-and-check/briefings/pattern-iterate.md` for all document work. The key modes:
- **Word vomit**: when Arlo needs to talk through something broad
- **Doc review**: after substantial changes; show the doc, ask for edits
- **Diff review**: after surgical changes (1–4 things)
- **Interview**: when one specific question would reshape the document

**Use sub-agents to protect your context.** When iterating on a specific document set with Arlo (e.g., building the behavioral matrix), spawn a sub-agent with the relevant files as context and the goal clearly stated. This keeps your main context clean for navigation and coordination. Pattern: `Agent(subagent_type="general-purpose", prompt="Run the blended iteration loop with Arlo on [files] toward [goal]. Read pattern-iterate.md first at [path].")`.

Commit rule: every edit (yours or Arlo's) gets its own commit before the next turn.

### Git

Branch: `l/talks/w/incorporate-vigilance` in `work/local/`.

The movement MCP tool (`mcp__cabinet__movement`) is not accessible in this session — it needs to be connected via `/mcp/henchery/<wing-name>`. Use raw git commands (`git add`, `git commit`) instead. The CLAUDE.md says to use the movement tool, but it doesn't work here; fall back to raw git.

### File Paths

Wing root is `D:\_Lairs\talks\wings\incorporate-vigilance\`. All unqualified paths resolve to `work/local/` per the wing CLAUDE.md. The maturity model JSON files are in `work/local/model/`. Working notes are in `work/local/working-notes/`.

---

## One Thing to Watch

Arlo's edits are normative. When he adds `@ai:` comments, process them and remove the comments. When he edits text directly, propagate that direction to everywhere it applies. Deletions are normative — remove from everywhere without back-compat. See pattern-iterate.md for the full doc-review protocol.
