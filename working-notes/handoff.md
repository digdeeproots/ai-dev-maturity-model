# Handoff — Next Claude Instance

*Written 2026-05-20. Context was getting full; this picks up cleanly.*

---

## Read First (in order)

1. **`closet/dev-and-check/briefings/pattern-iterate.md`** — the iteration workflow used throughout. Read it carefully. You will use it constantly. Key rule: commit before showing anything, commit human edits before responding to them.

2. **`work/local/CLAUDE.md`** — project structure (Vue 3 app, model JSON files, path aliases).

3. **`work/local/working-notes/vigilance-axis-brainstorm.md`** — the core concepts document. This is the primary reference for everything developed. Includes three rounds of transcript + interpretations sections. Read all of it.

4. **`work/local/working-notes/alternatives/delegation-model.md`** — the main model prototype. The assurance spectrum (levels 0–5) lives here. Read before doing any model work.

5. **`work/local/working-notes/alternatives/fluency-dag.md`** — the DAG target. Read for the node/edge structure and the vigilance-toil-as-missing-assurance-nodes insight.

6. **`work/local/model/`** — the existing maturity model JSON files (overview.json, agency_stages.json, agency_substages.json, fate-determining-choices.json, responsibility_ownership.json). These are the source being extended. Skim them; refer back as needed.

### Background (read if you need context on where ideas came from)

- `work/talks/craft2026-arlo/core-insight.md` — the craft talk's core insight (vigilance toil, design for carelessness, deterministic orchestration). Dense; useful.
- `work/talks/craft2026-arlo/brainstorm.md` — rich brainstorm of talk concepts; the world-design section and "agent's universe" examples are directly relevant.
- `work/talks/craft2026-arlo/concept-sort.md` — what's in/out of the talk. Good for terminology.
- `work/talks/craft2026-arlo/topic.md` — the talk document, including the key-moments/stories section. Concrete examples.

---

## What We've Built

### The Core Extension

The existing model tracks one thing per responsibility: **agency** (who performs the work, on a human → AI spectrum). This is the model's primary axis.

We are extending the model to also track **assurance** for each responsibility: what mechanism ensures the work was done correctly, on a 0–5 spectrum (see delegation-model.md for the full spectrum definition). Together, work delegation and assurance delegation define a **delegation region** — a named scope with both sides tracked.

The core finding: delegating work without corresponding assurance investment creates a **gap**. Gaps produce vigilance toil. Gap cost is multiplicative: `toil ∝ new work rate × existing body of work`. This is why the problem is severe in brownfield codebases and why AI makes it worse (AI increases new work rate without changing the existing body).

The model is not a grid. It is a structured view of responsibilities, each with a work side and an assurance side, and a gap between them when the two are mismatched. The goal of maturity progress is to close gaps by either advancing assurance mechanisms or by ensuring assurance advances in step with work delegation.

### Key Findings (already established — don't re-derive)

**Vigilance toil is multiplicative:** `toil cost ∝ new work rate × existing body of work`. Greenfield: existing body ≈ 0, so weak assurance is survivable. Brownfield: large existing body, so weak assurance is catastrophic. AI hits brownfield disproportionately.

**The assurance spectrum (0–5):**
- 5: Guided correctness — environment makes the right action easy and the wrong action hard to attempt (refactoring tools, compiler-backed reference finding). Zero vigilance + improved work quality.
- 4: Prevention — mistake cannot propagate past the originator (type systems, theorem provers, AST tools enforced by workflow). Zero vigilance within scope.
- 3: Deterministic detection — catches known classes reliably; predictable gaps (entirely misses some categories). Near-zero for covered classes.
- 2: Non-deterministic guardian — probabilistic detection; unpredictable gaps; can be broader than level 3 via multiple runs. Use to discover new categories, then harden to 3/4.
- 1: Human review — full vigilance burden; decays over time.
- 0: None.

Levels 4–5 can reach zero vigilance within scope; levels 0–3 cannot. Every level has a scope; precision of scope description increases with level ("catches 70% of everything, no pattern" at low levels vs. "100% guaranteed for this class; no false positives for anything else" at high levels).

**The error visibility criterion:** Level 4 vs. level 3 is propagation, not timing. A type checker that runs immediately before output is shared prevents propagation — level 4. Unit tests catch known cases after injection — level 3. You can't "fail to imagine" a type comparison the way you can a test case.

**Agency may not be primary:** Sustainability comes first; agency is the reward after work is made safe to delegate. The relationship is asymmetric.

**The immune system metaphor (root):** Software developers are the company's immune system; product is the brain. The brain survives tigers; the immune system prevents disease. "Only a little salmonella" is fine to the brain; the immune system sees the categorical difference between "you'll probably fight it off" and "actually clean food." Vigilance toil = immune suppression.

**The maintenance trap is in scope:** Teams in 100% maintenance mode, no AI, are already in the vigilance trap. Same investment path — just fewer available mechanisms at levels 4–5 in the human universe. AI makes it visible faster; it didn't create it.

**The "no human to blame" dynamic:** Low agency hides gaps (blame Bob). High AI agency makes them undeniable. Expectations rise; tolerance for the same failure rate drops.

**Brakes, not engine:** Speed (agency) is limited by brakes (sustainability). Teams obsess over engine; the bottleneck is always the brakes.

### The Two Model Forms

**Delegation model — behavioral matrix** (`working-notes/alternatives/delegation-model.md`): The structured variant applied to the full responsibility matrix. Each responsibility gets work-delegation and assurance-level measurements. Drill-down per responsibility lists specific investments. Two flavors: portfolio (open-world, you define zones) and structured map (closed-world, comprehensive taxonomy). Use the structured map to discover gaps; use the portfolio to track investments.

**Fluency DAG** (`working-notes/alternatives/fluency-dag.md`): The target form. Work nodes and assurance nodes in a directed acyclic graph. Edges are prerequisites. Missing assurance nodes before work nodes = visible vigilance trap. Multiple valid traversal paths. Inspired by the Agile Engineering Fluency map.

---

## What's Next

### Step 1: Behavioral Matrix (next version of the model)

Extend the existing responsibility matrix into a full behavioral matrix:
- Each responsibility gets a **work delegation** column (who performs this, agency level) and one or more **assurance** columns (what mechanism, 0–5 level)
- Currently missing: most responsibilities have only the work side; the assurance side needs to be added for each
- For each responsibility, identify **portfolio options** — specific investments that can improve assurance level (concrete, actionable, labeled by mechanism type and level achieved)
- Make gaps visible: work delegation level ahead of assurance level = vigilance toil

This is the structured delegation map variant of the delegation model, applied to the existing responsibility matrix.

### Step 2: Fluency DAG (version after that)

Convert the behavioral matrix into a DAG:
- Each responsibility × assurance-investment = one node
- Edges = prerequisite relationships
- Work nodes and assurance nodes visually distinct; missing assurance nodes are visible gaps
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

**Use sub-agents to protect your context.** When iterating on a specific document set with Arlo (e.g., building the behavioral matrix), spawn a sub-agent with the relevant files as context and the goal clearly stated. This keeps your main context clean for navigation and coordination. The sub-agent should read pattern-iterate.md and the relevant working-notes files, then run the iteration loop directly with Arlo.

Commit rule: every edit (yours or Arlo's) gets its own commit before the next turn.

### Git

Branch: `l/talks/w/incorporate-vigilance` in `work/local/`.

The movement MCP tool (`mcp__cabinet__movement`) requires connection via `/mcp/henchery/<wing-name>` and is not accessible. Use raw git commands (`git add`, `git commit`) instead. The CLAUDE.md says to use the movement tool, but fall back to raw git when it fails.

### File Paths

Wing root is `D:\_Lairs\talks\wings\incorporate-vigilance\`. All unqualified paths resolve to `work/local/` per the wing CLAUDE.md. Maturity model JSON files are in `work/local/model/`. Working notes are in `work/local/working-notes/`.

---

## One Thing to Watch

Arlo's edits are normative. When he adds `@ai:` comments, process them and remove the comments. When he edits text directly, propagate that direction everywhere it applies. Deletions are normative — remove from everywhere without back-compat. See pattern-iterate.md for the full doc-review protocol.
