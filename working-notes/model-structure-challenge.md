# Challenging the 2D Grid Model

*Analysis by Claude, 2026-05-20. Challenges, alternatives, and reworkings of the agency × sustainability grid.*

---

## The Claim Being Challenged

The maturity model becomes two-dimensional: Agency (who acts) × Sustainability (ease of achieving safety). Most cells in the grid are dangerous — they require vigilance toil that humans cannot actually sustain. A narrow path of safe cells exists. Falling off the path leads to compounding maintenance costs and defects.

---

## Flaws

### 1. Sustainability is not one thing

You described sustainability as involving: tool narrowness, context scoping, memory design, goal specification, invocation timing, result handling, non-deterministic guardian mechanisms, and the translation layer between abstraction and detail. These are not a single dial. They can be varied independently.

A team could have excellent tool narrowness and poor context scoping. Or excellent memory design and no translation layer. The aggregate "sustainability" score for such a team is undefined — the components don't compose into a number. A single axis forces a false compression.

The minimum split that preserves meaning might be:
- **Prevention axis**: how structurally impossible are unintended actions? (tool narrowness, invocation constraints, write restrictions)
- **Recovery axis**: how quickly and cheaply do you detect and correct mistakes? (evaluation mechanisms, guardian loops, escalation)

These are genuinely orthogonal. High prevention / low recovery is a different failure mode from low prevention / high recovery.

### 2. The axes are probably not orthogonal to each other

High agency with low sustainability is the danger zone — but can you actually have high sustainability with low agency? At A0-A1, sustainability barely matters because you're reviewing everything. The sustainability requirements grow with agency level. If that's true, the axes are correlated, not independent, and a rectangular grid misrepresents the shape.

The actual shape might be a triangle or wedge: the left edge (low agency) allows any sustainability level safely; the right edge (high agency) requires high sustainability; the danger zone is the bottom-right triangle. A rectangular grid implies dangerous combinations that don't actually exist (high agency / high sustainability without prerequisites) and safe combinations that overstate safety at the bottom-left.

### 3. The "safe path" implies a single correct route

Different teams might reach high agency via different valid sequences. A team working in a well-typed functional language has structural safety properties from day one that a Python team must build explicitly. The path they walk is different. "The path" singular may be wrong — there may be a family of paths, or even a safe region rather than a path.

Relatedly, the path metaphor implies you're trying to move toward higher agency. Some teams should stay at A2 or A3. The model should not communicate that maximizing agency is the goal.

### 4. "Safe spaces" may not be where you think

The claim is "small number of safe spaces, large number of dangerous combinations." But at low agency levels (A0-A2), even low sustainability is safe — because the human is reviewing everything anyway. The dangerous zone is specifically high agency + low sustainability. The safe region at the bottom of the grid may be quite large, not a narrow path.

This matters for the narrative: the vigilance trap isn't "most of the grid is dangerous." It's "as you move toward higher agency, sustainability requirements grow faster than most teams realize, and the danger zone expands rapidly."

### 5. Sustainability is binary within scopes, not continuous across the axis

You described "bounded scopes that are entirely safe" — zero risk within a scope. But a continuous axis implies you're sliding along a dial. The actual structure is more like: you have a portfolio of zero-risk zones (scopes where you've stacked enough guarantees), and an uncovered remainder where vigilance is required. Your "position" on the sustainability axis is really a description of how much of the mistake space your portfolio covers.

This matters because: moving along the axis isn't smooth. You make discrete investments (add a refactoring tool, add a type system, add a deterministic planning tool) and each one eliminates a class of mistakes. The portfolio grows in steps, not continuously.

### 6. The model doesn't capture where assurance transfers to

You described a spectrum of assurance mechanisms:
- Human vigilance (weakest — fatigues, misses things in detail space)
- Non-deterministic AI vigilance (reduces but doesn't eliminate vigilance burden; requires a checker)
- Deterministic code evaluation (reliable, doesn't fatigue)
- Structural prevention via tool/universe design (strongest — mistakes become impossible, not just detected)

This "what does the assurance transfer to" dimension is currently invisible in the grid. Two teams at the same (agency, sustainability) cell might have completely different durability: one is relying on non-deterministic AI guardians (fragile long-term), the other on structural prevention (durable). They look the same on the grid but have very different futures.

### 7. The responsibility matrix is the underlying structure; the grid is a visualization artifact

You described a responsibility matrix where each item has a work component and an assurance component, and most items are currently missing one. This is the actual content. The 2D grid is a way to present it — but it's one visualization choice among several, and it may flatten structure that the matrix captures better.

A grid shows aggregate position. The matrix shows which specific responsibilities have been addressed and which haven't. A team could look "mid-sustainability" on the grid while having specific critical assurance gaps (the things that will bite them) alongside irrelevant assurance strengths.

### 8. The observability problem: you don't know where you are

The grid implies you can locate your position. But the dangerous property of low sustainability at high agency is that you feel safe until you're not. Vigilance toil builds up slowly; defects appear later; the relationship between your choices and your outcome is delayed and indirect.

A model that doesn't address "how do you know your sustainability level?" may cause teams to misplace themselves — usually too optimistically. The model needs something about signals and leading indicators, not just the grid positions.

### 9. Temporal dynamics are missing

"Small forever beats large occasionally" — the rate at which you expand your zero-risk portfolio matters as much as your current position. A team adding one new scoped guarantee per week compounds to massive sustainability coverage. A team that builds a lot at once and then coasts will find their guarantees decaying (tools become stale, contexts drift, patterns are abandoned).

The grid is a static snapshot. A model that doesn't capture movement and decay misses a critical dimension.

---

## Alternative Models

### Alternative A: Three-Axis Model

**Agency** × **Prevention** × **Recovery**

- Agency: who acts / decides
- Prevention: how structurally impossible are unintended actions (tool narrowness, scope restriction, universe design)
- Recovery: how quickly and cheaply do you detect and fix mistakes (evaluation, testing, guardian loops)

This is more honest about the independence of these concerns. Teams can and do have high prevention / low recovery (rare mistakes, slow to detect when they occur) or low prevention / high recovery (mistakes happen often but are caught fast). Both can be viable at certain agency levels; they have different risk profiles.

The "safe path" becomes a surface in 3D space, not a line in 2D space.

### Alternative B: Safety Cone Model

Rather than a rectangular grid, model the safe zone as a cone:

- At agency level 0, any sustainability level is safe (you're reviewing everything)
- As agency increases, the minimum required sustainability increases
- The slope of the cone encodes how fast the requirements grow
- Above the cone surface: safe. Below: danger zone.

This is honest about the shape of the problem. Teams see immediately that advancing on agency without sustainability investments puts them below the cone surface. The visualization also makes clear that low-agency teams don't need to worry about sustainability yet — which corrects the false urgency of a symmetric rectangular grid.

### Alternative C: Portfolio Model

Instead of a single sustainability axis, track a portfolio of "zero-risk zones" achieved:

Each zone is named (e.g., "behavioral safety of refactorings," "thought structure of planning," "test file write isolation"). The portfolio grows as teams add scoped guarantees. "Sustainability" is the aggregate coverage of the mistake space, calculated from the portfolio.

Benefits:
- Honest about how teams actually progress (discrete investments, not smooth movement)
- Identifies specific gaps (you see exactly which mistake classes aren't covered)
- Doesn't aggregate away the important detail about which specific guarantees you have
- More actionable: "add X to your portfolio" is a clearer recommendation than "move along the sustainability axis"

The 2D grid could still be used as a summary visualization, where position is calculated from portfolio coverage — but the portfolio is the underlying model.

### Alternative D: Responsibility-Pair Matrix as the Primary Model

Instead of a 2D grid, make the responsibility matrix the center of the model. For each responsibility:

| Responsibility | Work item | Assurance item |
|----------------|-----------|----------------|
| Code changes | Who writes? | What prevents unintended behavior changes? |
| Test creation | Who writes? | What ensures test quality? |
| Architecture | Who decides? | What prevents architectural drift? |
| ... | ... | ... |

Each row has: who does the work (agency axis), what mechanism provides assurance (sustainability / assurance-transfer-target). The 2D grid is a summary; the matrix is the detail.

This is more actionable: you can see exactly which responsibilities have assurance gaps and which don't, rather than inferring from a grid position.

### Alternative E: Transfer-Target Model

Make explicit the spectrum of what assurance can transfer to:

1. **Human vigilance** — fragile, fatigues, fails in detail-space problems
2. **Non-deterministic AI guardian** — reduces but doesn't eliminate vigilance; requires a checker; good for probabilistic problems and bootstrapping deterministic guards
3. **Deterministic code evaluation** — reliable, doesn't fatigue; catches mistakes after the fact
4. **Structural prevention** — eliminates the mistake from possibility; requires universe design

Each responsibility can have its assurance mechanism located on this spectrum. Progress on the sustainability axis is really progress on this spectrum: moving assurance for each responsibility from human vigilance toward structural prevention.

This adds a third dimension to the model but explains the mechanism of progress, not just the position.

### Alternative F: The "What Transfers To What" Bipartite Graph

The fundamental move is: work responsibility transfers from human to AI. Assurance responsibility transfers from human vigilance to some system. These are two independent transfers. Model this as a bipartite graph:

- Left nodes: who performs (human → AI spectrum)
- Right nodes: what provides assurance (human vigilance → structural prevention spectrum)
- Edges: each responsibility, plotted at its (work-performer, assurance-mechanism) position

The safe zone is: work-performer and assurance-mechanism move together. The danger zone is: work-performer advances without the corresponding assurance-mechanism advance.

This makes the vigilance trap structurally visible: it's the gap between where work landed and where assurance is.

---

## Opportunities for Clarity the Grid Misses

**The complementarity insight needs a home.** Humans are strong at abstraction; AIs are strong at detail-pattern-discovery. The grid doesn't capture this. A model that shows "which kinds of work are safe to transfer" and "which kinds of assurance mechanisms fail in which domains" would make this structural. Currently the complementarity is a note in the brainstorm, not part of the model architecture.

**"Careless Engineering" as a named practice.** The model should distinguish the goal (high sustainability) from the practice that achieves it (Careless Engineering: designing for careless implementors). The grid shows the destination but not the discipline.

**The translation layer is a recurring pattern worth naming.** Abstract → detail → execute → abstract → verify appears repeatedly. It could be a named concept in the model — the "abstraction stack" — with explicit attention to where it's present and where it's missing.

**Leading indicators vs. lagging indicators.** The grid shows stable states. Teams need to know: what signals tell you you're drifting toward the danger zone before the defects arrive? The model is silent on this.

**The "check the checker" problem.** When you delegate vigilance to a non-deterministic system, you need a meta-evaluation mechanism. This recursion — who guards the guardian — isn't currently modeled. It applies at every level of the assurance hierarchy.

---

## Summary: What the 2D Grid Gets Right and Wrong

| Gets right | Gets wrong or misses |
|---|---|
| Two things are varying independently (agency, sustainability) | Sustainability isn't one thing |
| Dangerous combinations exist | The grid's rectangular shape misrepresents the actual danger zone shape |
| A path of safe spaces exists | "A path" may be "a family of paths" or "a safe region" |
| Vigilance toil is the penalty for falling off | Where you fall off determines the character of the toil |
| The safe path requires both axes to move together | The model doesn't show what moves each axis |
| — | The "what assurance transfers to" dimension is invisible |
| — | Portfolio structure of sustainability is lost |
| — | Temporal dynamics (rate of portfolio growth, decay) are absent |
| — | Observability of position is unaddressed |
