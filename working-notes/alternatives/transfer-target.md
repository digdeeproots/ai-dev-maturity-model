# Alternative Model: Transfer-Target (Bipartite View)

*Prototype — incomplete by design. Elaborates the core concept and what it makes visible.*

---

## Core Concept

Every act of delegation has two independent movements:
1. **Work transfers** — from human to AI (the agency question)
2. **Assurance transfers** — from human vigilance to some system (the sustainability question)

Teams focus on the first. The vigilance trap is the gap between them: work moves right, assurance stays on the human.

The transfer-target model makes both transfers visible simultaneously, for each responsibility, and makes the gap structurally visible rather than inferrable.

---

## The Structure

Two parallel spectra, one for each transfer:

**Work transfer spectrum (agency axis):**
```
Human ──────────────────────────────── AI
  A0      A1      A2      A3      A4
```

**Assurance transfer spectrum (sustainability axis):**
```
Human vigilance ──────────────────────── Structural prevention
   (fatigues,        Non-det AI    Det code    (impossible
   lax over time)    (probabilistic) (reliable)   to do wrong)
```

Each responsibility can be plotted as a point on each spectrum. The vigilance trap is visible as any responsibility where the work point is further right than the assurance point.

---

## What the Gap Looks Like

For a team moving from A2 to A3:

```
BEFORE (A2):

Code changes:
  Work:      [Human──AI]──────────────────  (Human writes)
  Assurance: [Human vigilance]────────────  (Human reviews)
  Gap: None — same actor does both

AFTER (A3, without assurance investment):

Code changes:
  Work:      ──────────[AI]───────────────  (AI writes)
  Assurance: [Human vigilance]────────────  (Human still reviews)
  Gap: ████████████████ (large — work moved right, assurance didn't)

AFTER (A3, with refactoring tool + type system):

Code changes (refactoring):
  Work:      ──────────[AI]───────────────  (AI refactors)
  Assurance: ──────────────────[Structural] (AST tools prevent behavior change)
  Gap: None — assurance moved with work

Code changes (new code):
  Work:      ──────────[AI]───────────────  (AI writes)
  Assurance: ──────────────[Det code]──────  (Type system + tests)
  Gap: Small — partial coverage
```

---

## The "No Human to Blame" Insight

At low agency, the gap is often present but invisible. A human doing work with human-vigilance assurance has a gap (vigilance cost, lax detection) but the gap is attributed to individual failure: "Bob made a mistake." The systemic nature of the gap is hidden.

As work moves right (more AI agency), the same gap becomes undeniable. You can't ask the AI to be more careful. The expectations of stakeholders rise because the human excuse is gone. The gap becomes visible — not because it got worse, but because the human scapegoat disappeared.

This is why the danger zone at high agency / low sustainability is so acute: the gap has always been there, but now everyone can see it.

---

## Visualizing the Transfer Target

For a responsibility that goes through a typical A2 → A3 transition:

```
BEFORE: Human does the work AND provides the assurance
        ┌─────────────┐         ┌─────────────────┐
Work:   │   Human     │         │                 │
        └─────────────┘         └─────────────────┘
        ┌─────────────┐         ┌─────────────────┐
Assur:  │   Human     │         │                 │
        └─────────────┘         └─────────────────┘
                                           ↑ Gap = 0

TARGET: AI does the work; structural mechanism provides assurance
        ┌─────────────────────────────────┐
Work:   │                           AI   │
        └─────────────────────────────────┘
        ┌─────────────────────────────────┐
Assur:  │            Det code / Structural│
        └─────────────────────────────────┘
                                           ↑ Gap = 0 (moved together)

DANGER: AI does the work; human still provides assurance
        ┌─────────────────────────────────┐
Work:   │                           AI   │
        └─────────────────────────────────┘
        ┌─────────────┐
Assur:  │   Human     │ ← hasn't moved
        └─────────────┘
        ░░░░░░░░░░░░░░░░░░░░░ ← Vigilance gap
```

---

## What This Model Makes Visible

- **The vigilance trap as a structural gap** — not a metaphor but a visible mismatch between two plotted positions
- **Whether a team is safe to advance** — if work is ahead of assurance, advancing agency widens the gap
- **The "no human to blame" dynamic** — low agency hides the gap; high agency exposes it
- **Assurance transfer target** — where assurance *should* land (not just "was there a human review?") is structurally central
- **Per-responsibility assessment** — different responsibilities can be at different points; the model doesn't aggregate away the differences

---

## Opportunities

- **Makes the vigilance trap mechanically visible** — the gap is the thing, and you can see it directly
- **Motivates assurance investment** — the gap is not "we should be careful" but "work is here, assurance is there, close the gap"
- **Works well at the responsibility level** — each responsibility has its own pair of positions; no false aggregation
- **The "no human to blame" insight is native** — it falls out of the model structure, not added as commentary

## Challenges

- **Complex to visualize for all responsibilities at once.** A bipartite graph with 21 responsibilities and two spectra each is hard to render compactly.
- **Assurance placement is still judgment-dependent.** Determining whether a mechanism is "deterministic code" vs. "non-deterministic AI" requires shared definitions.
- **Doesn't naturally suggest what to do.** The model shows the gap but not how to close it. Portfolio model is more actionable.
- **Two spectra imply false symmetry.** The work spectrum and assurance spectrum aren't scaled the same way — moving from human to AI on work is a different kind of move than moving from human vigilance to structural prevention on assurance. The parallel-spectra representation may mislead.
