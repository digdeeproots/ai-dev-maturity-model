# Handoff — Next Claude Instance

*Written 2026-05-20. Updated same day as the behavioral matrix reached v6.*

---

## Read First (in order)

1. **`closet/dev-and-check/briefings/pattern-iterate.md`** — the iteration workflow used throughout. Read it carefully. You will use it constantly. Key rule: commit before showing anything, commit human edits before responding to them.

2. **`work/local/CLAUDE.md`** — project structure (Vue 3 app, model JSON files, path aliases).

3. **`work/local/working-notes/vigilance-axis-brainstorm.md`** — the core concepts document. Includes three rounds of transcript + interpretations sections. Read all of it.

4. **`work/local/working-notes/behavioral-matrix.md`** — the current primary model document (v6). The careless safety ladder, product facets, worry surface, rate event, and per-work-type agency delegation paths all live here. Read before doing any model work.

5. **`work/local/working-notes/alternatives/delegation-model.md`** — earlier prototype. Still useful for the portfolio vs. structured-map framing and the safety spectrum definitions. Secondary reference.

6. **`work/local/working-notes/alternatives/fluency-dag.md`** — the DAG target form. Read for the node/edge structure and the vigilance-toil-as-missing-safety-nodes insight.

7. **`work/local/model/`** — the existing maturity model JSON files (overview.json, agency_stages.json, agency_substages.json, fate-determining-choices.json, responsibility_ownership.json). These are the source being extended. Skim them; refer back as needed.

### Background (read if you need context on where ideas came from)

- `work/talks/craft2026-arlo/core-insight.md` — the craft talk's core insight (vigilance toil, design for carelessness, deterministic orchestration). Dense; useful.
- `work/talks/craft2026-arlo/brainstorm.md` — rich brainstorm of talk concepts; the world-design section and "agent's universe" examples are directly relevant.
- `work/talks/craft2026-arlo/concept-sort.md` — what's in/out of the talk. Good for terminology.
- `work/talks/craft2026-arlo/topic.md` — the talk document, including the key-moments/stories section. Concrete examples.

---

## What We've Built

### The Core Extension

The existing model tracks one thing per responsibility: **agency** (who performs the work, on a human → AI spectrum). We are extending the model to also track **safety** for each responsibility: how careless can an implementor be and still achieve safety, on a 0–5 ladder.

The key finding: delegating work without corresponding safety investment creates a **gap**. Gaps produce vigilance toil. Gap cost is multiplicative: `toil ∝ rate event × worry surface × safety gap`. This is why the problem is severe in brownfield codebases and why AI makes it worse (AI increases rate without changing the existing body).

The model is not a grid. It is a structured view of product work, organized by product facet, with each type of work carrying worries that have independent vigilance costs. The goal of maturity progress is to close safety gaps by investing in mechanisms that either shrink the worry surface or raise the safety level for each worry.

**Agency is now a portfolio, not a single axis.** Instead of one global agency stage (A0–A5), each work type has its own agency delegation path. A team can be at A3 for "evolving the design" (because AST tools give Carefree safety for behavioral regression) while still at A2 for "making architectural decisions" (because they lack a planning tool). This heterogeneous reality was always true; the model now makes it visible.

### Key Findings (already established — don't re-derive)

**Vigilance toil is multiplicative:** `toil cost ∝ rate event × worry surface × safety gap`. Greenfield: worry surface ≈ 0, so weak safety is survivable. Brownfield: large worry surface, so weak safety is catastrophic. AI increases rate; it doesn't change the worry surface — but the existing body amplifies everything.

**The careless safety ladder (0–5):** How careless can an implementor be and still achieve safety?
- 5: Carefree — environment makes the right action easy and mistakes structurally hard. Careless implementors thrive.
- 4: Prevention — mistake cannot propagate past the originator. Careless is fine within scope.
- 3: Deterministic — catches known worries reliably. Careless is fine for covered ones.
- 2: Probabilistic — errors sometimes caught. Careless is sometimes fine.
- 1: Vigilance — errors caught only when someone is paying attention. Careless is never fine.
- 0: Hope — no mechanism. Errors propagate undetected.

Levels 4–5 can reach zero vigilance within scope; levels 0–3 cannot.

**Product facets:** The product has seven properties that work can improve or degrade: capability, adaptability, explainability, abstractability, transparency, consistency, security. Each has a work type phrase (what people are doing to improve it) and a business stake (why it matters). Work that improves one facet always risks degrading others.

**Worry surface and rate event:** Each worry has a countable scope (worry surface) and a named trigger (rate event). These are the two multipliers in the toil formula. Scope-shrinking investments reduce the worry surface; efficiency investments reduce safety gap (toil per unit of worry surface).

**Tests are safety mechanisms, not work types.** Test quality (structure, coverage, duplication, environment coupling) determines the effective safety level of the mechanism. Coverage gaps are a reduced effective safety level, not a separate worry.

**Reversibility is a scope-shrinking investment.** When errors are easy to undo (feature flags, canary deployments, AST refactoring tools, short iteration cycles), the effective worry surface is smaller. Reversibility investments appear in the scope-shrinking table of each relevant worry.

**The error visibility criterion:** Safety level 4 vs. 3 is propagation, not timing. A type checker that runs before output is shared prevents propagation — level 4. Unit tests catch known cases after injection — level 3. You can't "fail to imagine" a type comparison the way you can a test case.

**Agency may not be primary:** Safety comes first; agency is the reward after work is made safe to delegate. The relationship is asymmetric.

**The immune system metaphor (root):** Software developers are the company's immune system; product is the brain. The brain survives tigers; the immune system prevents disease. "Only a little salmonella" is fine to the brain; the immune system sees the categorical difference between "you'll probably fight it off" and "actually clean food." Vigilance toil = immune suppression.

**The maintenance trap is in scope:** Teams in 100% maintenance mode, no AI, are already in the vigilance trap. Same investment path — just fewer available mechanisms at levels 4–5 in the human universe. AI makes it visible faster; it didn't create it.

**The "no human to blame" dynamic:** Low agency hides gaps (blame Bob). High AI agency makes them undeniable. Expectations rise; tolerance for the same failure rate drops.

**Brakes, not engine:** Speed (agency) is limited by brakes (safety). Teams obsess over engine; the bottleneck is always the brakes.

### The Current Model Form

**Behavioral matrix** (`working-notes/behavioral-matrix.md`): The primary model document. Organized by product facet and work type. Each work type has: (1) business stake, (2) agency delegation path with safety minimums per level, (3) worries with worry statement, worry surface, rate event, scope-shrinking options, and efficiency options. The careless safety ladder governs all option tables.

**Fluency DAG** (`working-notes/alternatives/fluency-dag.md`): The target form. Work nodes and safety nodes in a directed acyclic graph. Edges are prerequisites. Missing safety nodes before work nodes = visible vigilance trap. Inspired by the Agile Engineering Fluency map.

**Delegation model** (`working-notes/alternatives/delegation-model.md`): Earlier prototype. Portfolio vs. structured-map variants; useful for the foundational framing. The behavioral matrix supersedes it for actual model content.

---

## What's Next

### Step 1: Behavioral Matrix — substantially done

The behavioral matrix (v6) covers all work types with full safety dimensions. Still open:

- Encoding the behavioral matrix as JSON (extending the model/*.json files)
- Extending the Vue app to render the safety dimension alongside the agency dimension

### Step 2: Fluency DAG

Convert the behavioral matrix into a DAG:
- Each work type × safety investment = one node
- Edges = prerequisite relationships
- Work nodes and safety nodes visually distinct; missing safety nodes are visible gaps
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

### File Paths

Wing root is `D:\_Lairs\talks\wings\incorporate-vigilance\`. All unqualified paths resolve to `work/local/` per the wing CLAUDE.md. Maturity model JSON files are in `work/local/model/`. Working notes are in `work/local/working-notes/`.

---

## One Thing to Watch

Arlo's edits are normative. When he adds `@ai:` comments, process them and remove the comments. When he edits text directly, propagate that direction everywhere it applies. Deletions are normative — remove from everywhere without back-compat. See pattern-iterate.md for the full doc-review protocol.
