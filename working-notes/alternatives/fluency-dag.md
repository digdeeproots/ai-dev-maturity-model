# Alternative Model: Fluency DAG

*Prototype — incomplete by design. Inspired by the Agile Engineering Fluency map.*

Reference: https://arlobelshee.github.io/AgileEngineeringFluency/Stages_of_practice_map.html

---

## Core Concept

A directed acyclic graph where nodes are practices (specific investments in work delegation or assurance delegation) and edges are prerequisite relationships. You cannot safely reach a node without having acquired its prerequisites.

Unlike a subway diagram with ordered lines, the DAG has:
- **Multiple entry points** — different teams can start in different places based on where it hurts
- **Branching paths** — many valid traversal orders, not one canonical route
- **Prerequisite visibility** — you can see exactly why you can't do X yet
- **No implied endpoint** — the graph doesn't end; teams stop when the value of the next node doesn't justify the cost

---

## Node Types

**Work nodes** — practices that transfer work from human to AI. Each work node represents a capability: "AI can now do X without constant human involvement."

**Assurance nodes** — practices that transfer assurance from human vigilance to a system. Each assurance node eliminates a class of vigilance toil: "humans no longer need to watch for Y."

**Key skill nodes** (like the Engineering Fluency map's highlighted nodes) — foundational practices that unlock many others. Skipping them caps your ceiling early.

---

## What the Vigilance Toil Looks Like on the Graph

**Missing assurance nodes before work nodes:** A team that has a work node without its prerequisite assurance nodes has a visible gap — the work node is unlocked, the assurance node is not, and the edge between them points at something missing. This is the vigilance trap, structurally visible in the graph.

**Clusters of level-0 assurance:** In the full graph, each work node has one or more assurance nodes that should accompany it. A team in chronic maintenance mode has reached several work nodes (their developers can do the work) without the assurance nodes. Their position in the graph shows assurance nodes consistently missing or at the lowest levels.

**The maintenance trap without AI:** The graph applies to human-work delegation, not just AI. A team where humans do all the work but have no testing recipe, no type system, no planning discipline — they're at A1/A2 work nodes with level-0 assurance nodes throughout. The graph shows where their foot-guns come from: every work region without an assurance node is a gun pointed at their feet.

---

## Sample Graph Fragment (Code Changes Domain)

```
[Manual code review] ──────────────────────────────────┐
                                                        ↓
[Type system (strict)] ──────────────────────────── [New code: assurance level 3]
                                                        ↓
[Automated tests: basic] ──────────────────────────────┘
        ↓
[Test recipe tool] ─────────────────────────────── [Test structure: assurance level 4]
        ↓
[Session exploratory testing] ──────────────────── [Test coverage: assurance level 2]
        ↓
[Coverage guardian + abstraction] ──────────────── [Test coverage: assurance level 3/4]


[Bounded task delegation] ← requires: [Type system] + [Automated tests: basic]
        ↓
[AST refactoring tools only] ───────────────────── [Refactoring: assurance level 4]
        ↓
[Closed-loop delegation] ← requires: [Test recipe tool] + [AST refactoring tools]
```

Reading this:
- A team can reach [Bounded task delegation] once they have [Type system] and [Automated tests: basic]
- They cannot safely reach [Closed-loop delegation] until [Test recipe tool] and [AST refactoring tools] are in place
- If they do reach [Closed-loop delegation] without [Test recipe tool], the [Test structure: assurance] node is missing — vigilance gap is visible

---

## Sample Graph Fragment (Architecture Domain)

```
[Architecture decision records] ────────────────── [Architecture decisions: assurance level 2]
        ↓
[ADR review process] ──────────────────────────── [Architecture decisions: assurance level 3]
        ↓
[Deterministic planning tool] ─────────────────── [Planning structure: assurance level 4]
        ↓
[Architecture review in planning loop] ← requires: [ADR review] + [Planning tool]


[AI-assisted architecture review] ← requires: [ADR review process]
        ↓
[Architecture drift guardian] ──────────────────── [Architecture drift: assurance level 2]
        ↓
[Drift → ADR pipeline] ─────────────────────────── [Architecture drift: assurance level 3]
```

---

## Two Reading Modes

**Forward (investment planning):** Start at your current nodes. Follow edges to see what's immediately achievable. Pick the next node based on which gap is causing the most vigilance toil.

**Backward (diagnosis):** Identify your worst vigilance toil. Find the corresponding assurance node. Trace back to find which prerequisite nodes you're missing. Those are your investments.

The backward reading is the immune system diagnosis: your symptoms (maintenance burden, bug tail, rework) map to specific missing or low-level assurance nodes. The graph makes the path from symptom to investment navigable.

---

## Scale and Structure

The full graph would have:
- One **work node** per practice/delegation increment (roughly 40-60 nodes covering the responsibility matrix)
- One to three **assurance nodes** per work node (one per mistake class that work node could introduce)
- **Key skill nodes**: a small number (5-10) that unlock many others — the foundational investments (type system, test recipe, deterministic build, planning discipline, session-based exploratory testing)
- **Domain clusters**: nodes grouped by responsibility region (code changes, test creation, architecture, migrations, planning, etc.) — visually separate but with cross-domain edges

The DAG would be similar in density to the Agile Engineering Fluency map: navigable by zooming into one region at a time, with the overall shape visible at zoom-out.

---

## Opportunities

- **Directly navigable from pain.** "What hurts?" → find the missing assurance node → trace prerequisites → invest.
- **Makes prerequisite relationships visible.** You can see why you can't do X yet without being told — it's in the graph structure.
- **Multiple valid paths.** Different teams, different starting points, different traversals. No single canonical order.
- **Scales to full complexity.** The DAG can contain all the detail of the structured delegation map without overwhelming any one team — they zoom into their region.
- **Shows the maintenance trap.** A human-only team's graph shows the same assurance gaps as an AI-delegation team's — the model is universal.
- **Progressive disclosure.** Teams only need to understand their immediate neighborhood of the graph; the full picture is there for those who want it.

## Challenges

- **Graph design is hard.** Getting the node granularity and edge structure right requires significant design work. Too coarse: teams can't navigate. Too fine: overwhelming.
- **Static graph may not match dynamic reality.** Some edges may be conditional ("you need X before Y in context Z but not in context W"). DAGs don't represent conditional prerequisites easily.
- **Visual complexity at full scale.** Even with domain clustering, 100+ nodes is hard to render accessibly. Requires good interactive tooling (zoom, filter, highlight path).
- **No aggregate position.** Leaders who want a dashboard number can't get one from a DAG. This is honest but may be resisted.
- **Maintenance.** The graph itself needs updates as the practice landscape evolves. Stale nodes mislead teams.
