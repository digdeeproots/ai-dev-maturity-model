# Challenging the 2D Grid Model

*Analysis by Claude, 2026-05-20. Challenges, alternatives, and reworkings of the agency × sustainability grid.*

---

## The Claim Being Challenged

The maturity model becomes two-dimensional: Agency (who acts) × Sustainability (ease of achieving safety). Most cells in the grid are dangerous — they require vigilance toil that humans cannot actually sustain. A narrow path of safe cells exists. Falling off the path leads to compounding maintenance costs and defects.

---

## Flaws

### 0. Agency may not be the primary axis

The existing model treats agency as primary. But consider: you can only safely increase agency once you've addressed vigilance toil. Delegating work is the reward you get *after* you've addressed sustainability. Sustainability comes first; agency follows.

If that's true, the axes are ordered — sustainability is the enabling condition, agency is the result — not independent dimensions you can move along in any order.

This maps onto a useful framing of what software developers actually own. Product people own what the business needs to do right now in order to grow. Software people own ensuring the business doesn't die of disease — they are the company's immune system. The cost of vigilance toil is a weakening of that immune system. It doesn't guarantee death, but it makes the organization more vulnerable: slower to adapt, more exposed to defects, more likely to accrue the kind of systemic fragility that eventually becomes a crisis.

Viewed this way, reducing vigilance toil isn't about productivity. It's about immune function. High vigilance cost means the immune system is working overtime on problems that could be designed away — and therefore less available for novel threats.

### 1. Sustainability is not one thing

Sustainability involves: tool narrowness, context scoping, memory design, goal specification, invocation timing, result handling, non-deterministic guardian mechanisms, and the translation layer between abstraction and detail. These are not a single dial. They can be varied independently.

A team could have excellent tool narrowness and poor context scoping. Or excellent memory design and no translation layer. The aggregate "sustainability" score for such a team is undefined — the components don't compose into a number. A single axis forces a false compression.

The minimum split that preserves meaning might be:
- **Prevention**: how structurally impossible are unintended actions? (tool narrowness, invocation constraints, write restrictions)
- **Recovery**: how quickly and cheaply do you detect and correct mistakes? (evaluation mechanisms, guardian loops, escalation)

These are genuinely orthogonal. High prevention / low recovery is a different failure mode from low prevention / high recovery. Critically: recovery is inherently probabilistic. No detection mechanism has a 100% catch rate. This means recovery-based assurance always leaves some residual vigilance burden; prevention-based assurance can genuinely reach zero. A model that doesn't distinguish these will conflate strategies with fundamentally different ceilings.

### 2. High sustainability with low agency is entirely possible — and valuable

The axes are not coupled in the direction I first assumed. A team can have high sustainability at low agency. Example: a team that depends entirely on PR review for safety has low sustainability (high vigilance cost, lax detection over time). A different team at the same agency level has clear testing recipes, session-based exploratory testing that discovers blind spots, systematic incorporation of those discoveries into the recipe, and deterministic tools enforcing coverage. These teams are at the same agency level but very different sustainability levels.

The rectangular grid is correct in this respect — the axes are independent, and teams can and should improve sustainability even before increasing agency.

What is *not* symmetric: high agency with low sustainability is the dangerous zone, but high sustainability with low agency is simply a well-run team that hasn't yet delegated. The dependency runs one way: advancing on agency safely *requires* sustainability to have advanced first.

### 3. "The path" implies a single correct route

Different teams reach high agency via different valid sequences. A well-typed functional language gives structural prevention properties that a Python team must build explicitly. "The path" singular may be wrong — there is a family of valid paths through the grid, shaped by language, domain, team size, and risk tolerance.

More importantly: the path metaphor implies moving toward higher agency is the goal. Some teams should stay at A2 or A3. The model should not communicate that maximizing agency is the objective.

### 4. Low agency + low sustainability is not safe

My original claim that the safe region is large at low agency was wrong. Low agency with low sustainability is often a dangerous combination — it just looks different than the high-agency version. The signal is long bug tails, slow development, and chronic "maintenance" that is mostly responding to foot-guns rather than to a genuinely changing world. Human review is a poor substitute for sustainability: high vigilance cost, declining detection rate over time as people get lax.

The danger zone isn't confined to the top-right of the grid. It runs through the whole grid wherever sustainability is low.

What does shift as you move right on the agency axis: the visibility of the problem changes. At low agency, you can blame Bob and tell yourself it will improve. That fiction is available. As you increase AI agency, you lose that option — you can no longer attribute failures to individual human carelessness. The systemic flaw becomes undeniable. External stakeholders raise their expectations; the development team can no longer rationalize the same failure rate. The vigilance cost required to meet those expectations increases. Additionally, more work flows through the system with AI agency, so the number of items requiring vigilance grows — just as it would if you increased staff size without improving sustainability.

### 5. Sustainability is a portfolio, not a continuous axis

"Bounded scopes that are entirely safe" describes the actual structure better than a continuous axis does. You have a portfolio of zero-risk zones (scopes where you've stacked enough guarantees), and an uncovered remainder where vigilance is required. Your position on the sustainability axis is really a description of how much of the mistake space your portfolio covers.

Progress isn't smooth. You make discrete investments — add a refactoring tool, add a type system, add a deterministic planning tool — and each one eliminates a class of mistakes. The portfolio grows in steps.

### 6. The model doesn't capture where assurance transfers to

A spectrum of assurance mechanisms exists:
- Human vigilance (weakest — fatigues, misses things in detail space, 100% vigilance burden)
- Non-deterministic AI vigilance (reduces but doesn't eliminate burden; requires a checker; inherently probabilistic)
- Deterministic code evaluation (reliable, doesn't fatigue; catches mistakes after the fact)
- Structural prevention via universe design (strongest — mistakes become impossible, not just detected)

Two teams at the same grid position might have very different durability: one relies on non-deterministic AI guardians (fragile long-term), the other on structural prevention (durable). They look identical on the grid but have very different futures. This dimension needs to be much more visible in the model.

### 7. The responsibility matrix is the underlying structure; the grid is a visualization artifact

The grid shows aggregate position. The matrix shows which specific responsibilities have been addressed and which haven't. A team could look "mid-sustainability" on the grid while having specific critical assurance gaps alongside irrelevant assurance strengths.

A model that doesn't address "which specific responsibilities lack assurance?" may cause teams to feel falsely secure about their overall position while leaving dangerous gaps uncovered.

### 8. You don't know where you are — the observability problem

The grid implies you can locate your position. But the dangerous property of low sustainability at high agency is that you feel safe until you're not. Vigilance toil builds up slowly; defects appear later; the relationship between choices and outcomes is delayed and indirect.

Teams consistently misplace themselves — usually too optimistically. The model needs leading indicators and signals, not just stable-state descriptions. This needs to be much more visible.

### 9. Temporal dynamics and the subway diagram opportunity

The rate at which you expand your zero-risk portfolio matters as much as your current position. A team adding one new scoped guarantee per week compounds to massive coverage. A team that builds sustainability in one big push then coasts will find their guarantees decaying — tools become stale, contexts drift, patterns are abandoned.

The model as a static grid misses this. What would work better: something that focuses on the specific vigilance toil a team is currently facing, helps them incrementally segment pieces out into zero-risk zones, and makes visible that achieving each piece of safety *unlocks* the next level of agency delegation. A subway diagram style — like the Agile Engineering Fluency map — might fit this better than a grid: stations are specific investments, and the lines show what each unlocks.

---

## Alternative Models

*(See `alternatives/` subdirectory for prototype elaborations of each.)*

### Alternative A: Three-Axis Model — Agency × Prevention × Recovery

Agency × Prevention × Recovery, where prevention and recovery are explicitly separated. The safe zone becomes a surface in 3D space. This resolves the "sustainability is not one thing" flaw but adds complexity.

### Alternative B: Safety Cone

The safe zone is a cone in the agency × sustainability plane: at low agency, any sustainability is fine; as agency increases, the minimum required sustainability increases. The cone makes the dependency visible without implying a single path. Challenge: still uses a single sustainability axis.

### Alternative C: Portfolio Model (preferred)

Track a portfolio of named zero-risk zones, each scoped to a class of mistakes. Sustainability is the aggregate coverage of the mistake space. Agency unlocks are tied to specific portfolio items. Progress is discrete and visible. The 2D grid can still be used as a summary, calculated from portfolio state.

What it makes visible: which specific mistake classes are covered vs. uncovered; what to invest in next; whether a team is actually advancing or just feeling like they are.

### Alternative D: Responsibility-Pair Matrix

Make the responsibility matrix the center. Each row has: the responsibility, who does the work (agency axis position), what provides assurance (assurance mechanism type and quality). Gaps are directly visible. More actionable than the grid; less visually compact.

### Alternative E: Transfer-Target Spectrum

For each responsibility, show separately where the work transferred to and where the assurance transferred to. The vigilance trap becomes structurally visible as the gap between those two placements. Strong conceptual clarity; hard to summarize compactly.

### Alternative F: Subway Diagram (worth elaborating)

Specific investments as stations. Lines show enabling relationships — achieving this station unlocks that one, which makes this agency delegation safe. The vigilance toil focus becomes the starting point: "where does it hurt?" finds your current station; the diagram shows what to tackle next.

Inspired by the Agile Engineering Fluency map. Challenges: implies a single path; requires careful ordering decisions.

---

## Brakes, Not Engine

A metaphor that applies across all alternatives: in driving, your speed is not limited by your engine — it's limited by your brakes. How easily can you get to safety (stopped)? Teams focus on AI capability (engine) when the real constraint is sustainability (brakes). You can only safely go as fast as your brakes allow.

This reframes the model: sustainability isn't a constraint on ambition. It's the thing that *enables* higher velocity safely.

---

## Opportunities for Clarity the Grid Misses

**Agency may not be primary** — sustainability comes first; agency is the reward. This inverts the existing model's framing and may be the most important structural change.

**The immune system framing** — software developers as the organization's immune system; vigilance toil as immune suppression. Not just a metaphor — it reframes the stakes.

**Human/AI complementarity needs a home** — which kinds of work are safe to transfer, and which assurance mechanisms fail in which domains, should be structural parts of the model, not notes in a brainstorm doc.

**Careless Engineering as a named practice** — the model should distinguish the goal (high sustainability) from the discipline that achieves it (Careless Engineering). The grid shows destination, not path.

**Prevention vs. recovery ceiling** — prevention can reach zero vigilance; recovery cannot. This is a fundamental ceiling difference that the model should make visible.

The following are real but belong in drill-down, not in the core view:
- The translation layer (abstract → detail → execute → abstract → verify)
- Leading vs. lagging indicators of sustainability
- The "check the checker" meta-evaluation problem

---

## Summary: What the 2D Grid Gets Right and Wrong

| Gets right | Gets wrong or misses |
|---|---|
| Two things are varying (agency, sustainability) | Sustainability isn't one thing (prevention ≠ recovery) |
| Dangerous combinations exist | The danger zone isn't confined to high-agency; low-sustainability is dangerous everywhere |
| Sustainability and agency should move together | The dependency is asymmetric: sustainability enables agency, not vice versa |
| Vigilance toil is the penalty | Where you fall off determines the character of the toil |
| — | Where assurance transfers to is invisible |
| — | Portfolio structure of sustainability is lost in aggregation |
| — | Temporal dynamics and decay are absent |
| — | Observability of position is unaddressed |
| — | Agency may not be the primary axis |
