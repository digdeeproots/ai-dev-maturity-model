# Alternative Model: Subway Diagram

*Prototype — incomplete by design. Elaborates the core concept and what it makes visible.*

---

## Core Concept

Inspired by the Agile Engineering Fluency map. Rather than a grid showing where you are, a subway diagram shows:
- **Stations** — specific, nameable investments in sustainability
- **Lines** — sequences of stations that build toward capability
- **Unlocks** — what each station makes safe to do next
- **Your current station** — where you actually are on the map, not an abstracted score

The starting point is not "what agency level are we?" but "what vigilance toil is most painful right now?" That identifies your current station. The diagram shows what to tackle next.

---

## The Map Structure (Partial Draft)

### Lines

**The Safety Line** (foundation, runs left-right):
Stations that reduce vigilance toil without requiring AI agency delegation. Teams can and should build this before advancing on agency.

```
[Manual Review] → [Testing Recipe] → [Type System] → [Deterministic Build] → [AST Refactoring] → ...
```

**The Delegation Line** (runs parallel, connects to Safety Line):
Agency delegation stations — each requires specific Safety Line stations to have been reached first.

```
[Ad-hoc AI Help] → [Bounded Task Delegation] → [Closed Loop Delegation] → [Supervised Autonomy] → ...
```

**The Guardian Line** (connects to both):
Non-deterministic assurance investments that bootstrap toward deterministic ones.

```
[Exploratory Testing] → [Pattern-Match Guardian] → [Automated Anomaly Detection] → [Guardian-Bootstrapped Det. Guard] → ...
```

**Transfer points** (stations that connect lines):
- "Closed Loop Delegation" on the Delegation Line requires "Deterministic Build" on the Safety Line
- "Supervised Autonomy" requires both "Type System" AND "Automated Anomaly Detection"
- Reaching "Guardian-Bootstrapped Det. Guard" moves that mistake class from the Guardian Line to the Safety Line permanently

---

## What a Station Description Looks Like

**Station: Testing Recipe**
- *Line*: Safety
- *What it is*: A deterministic scaffolding tool that injects the team's testing recipe into every test-writing context — Nullables for dependencies, snapshot-formatted output with filtering, business-concept assertion methods.
- *Vigilance eliminated*: AI writing naively structured tests with raw mocks and primitive assertions; developers reviewing whether tests "look right"
- *What it requires upstream*: Manual Review (baseline — you must know what your recipe is)
- *What it unlocks downstream*: Bounded Task Delegation for test writing (agent can write tests without human review of each one)
- *Decay risk*: Medium — recipe requires maintenance as patterns evolve
- *Mechanism type*: Structural prevention (tool enforces recipe), deterministic evaluation (recipe content verified by tool)

---

## A Team's Journey on the Map

A team currently in pain because AI-written tests keep using raw mocks and are hard to read:

1. **Find their current station**: they're at "Ad-hoc AI Help" on the Delegation Line, but missing "Testing Recipe" on the Safety Line.
2. **The map shows**: before advancing delegation, install Testing Recipe.
3. **After installing Testing Recipe**: they can safely advance to "Bounded Task Delegation" for test writing specifically.
4. **Next pain**: AI architecture decisions are inconsistent. The map shows "Architecture Recipe" station, which requires "Deterministic Planning Tool" upstream.
5. **Progressive journey**: each investment addresses a specific pain, unlocks a specific next step.

The "brakes before engine" principle is native to this structure: you can only go as fast as your Safety Line coverage allows.

---

## The "Immune System" Reading

The subway map can be read two ways:
- **Forward**: what do we need to invest in to delegate more safely?
- **Backward**: what does our current vigilance toil tell us about which stations we've skipped?

The backward reading is the immune system diagnosis: your bug tail, your maintenance burden, your lax review process — these are symptoms. Each symptom maps to a missing station. The diagram makes the diagnosis navigable.

---

## What This Model Makes Visible

- **Where you actually are** — your current station, not an abstracted grid position
- **What's causing your current pain** — vigilance toil maps to missing stations
- **What to do next** — follow the line to the next station; prerequisites are shown
- **What each investment unlocks** — not abstract "more sustainable" but specific delegation capability
- **Multiple valid paths** — different lines can be traversed in different orders; teams choose based on their pain
- **The enabling relationship between sustainability and agency** — Safety Line must precede Delegation Line at each level; this is structural, not incidental

---

## What It Doesn't Make Visible (by design)

- **Your aggregate position** — there's no single score. This is a feature (honesty) and a challenge (executives want a number).
- **Comparison across teams** — two teams can be on different lines at different stations and it's not obvious how to rank them.

---

## Opportunities

- **Actionable from day one.** "What hurts most?" → "That maps to this station." → "Install this." No need to understand the whole model first.
- **Honest about prerequisites.** The subway map makes it structurally visible that you can't safely reach Station X without having passed through Station Y.
- **Multiple valid paths.** Different teams can traverse in different orders; the map accommodates this without implying one is wrong.
- **Progressive disclosure.** A team only needs to know their current line and the next few stations, not the whole map.
- **Makes the "sustainability first" principle obvious.** Safety Line stations visibly precede Delegation Line stations.

## Challenges

- **Requires careful station definition.** What are the stations? Getting the granularity and sequencing right is a significant design problem.
- **Implies more linearity than may exist.** Subway diagrams suggest ordered paths; real investments may have more complex dependency structures (closer to a DAG than a line).
- **Hard to represent all interactions.** A station on the Safety Line may have different effects depending on which Delegation Line station you're at. Subway maps don't show conditional relationships easily.
- **Doesn't aggregate.** Leaders who want a dashboard-style summary will resist a model that refuses to give them a score.
- **Risk of false confidence at each station.** Reaching a station covers a specific mistake class. Teams may feel globally safer after one investment when they've only covered one zone.
