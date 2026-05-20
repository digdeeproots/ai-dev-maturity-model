# Alternative Model: Responsibility-Pair Matrix

*Prototype — incomplete by design. Elaborates the core concept and what it makes visible.*

---

## Core Concept

Every responsibility in software development has two sides:
- **Work**: who performs it (the agency question)
- **Assurance**: what mechanism ensures it was done correctly (the sustainability question)

Most teams track the first and ignore the second. The vigilance trap is what you get when work is delegated but assurance is not.

The responsibility-pair matrix makes both sides visible for every responsibility simultaneously. It is more detailed than a 2D grid and less aggregated. The goal is not a summary position but a gap map: which responsibilities have their assurance side addressed, and which don't?

---

## The Assurance Spectrum

Assurance mechanisms, ordered by durability and vigilance cost:

| Level | Name | Description | Vigilance residual |
|-------|------|-------------|-------------------|
| 4 | Structural prevention | Mistake is impossible within the universe design | Zero |
| 3 | Deterministic evaluation | Deterministic code catches the mistake after the fact | Near-zero |
| 2 | Non-deterministic guardian | AI or probabilistic process detects the mistake; inherently imperfect | Reduced, not eliminated |
| 1 | Human review | Human inspects output and judges correctness | Full — and decays over time |
| 0 | None | No assurance mechanism; mistake goes undetected until consequences arrive | Full + blind |

---

## Sample Matrix (Partial — A3 team)

Responsibilities drawn from the existing model. Work column shows agency level; Assurance column shows mechanism level and name.

| Responsibility | Work performer | Agency | Assurance mechanism | Level | Gap? |
|---------------|---------------|--------|---------------------|-------|------|
| Code changes | AI | A3 | AST refactoring tools (structural) + type system (deterministic) | 4/3 | Partial — new code not covered |
| Unit test creation | AI | A3 | Test recipe tool injects Nullables + patterns into context | 4 | No |
| Migration execution | AI | A3 | Migration framework ensures archive + bidirectional map | 4 | No |
| Migration mapping | AI | A3 | Human review of mapping definition | 1 | **Yes — review only** |
| Architecture decisions | Human | A3 | None | 0 | **Yes — no mechanism** |
| Success criteria | Human | A3 | Stakeholder review (intermittent) | 1 | **Yes — intermittent only** |
| Drift detection | AI (partial) | A3 | Flow dashboard; human monitors | 2/1 | **Yes — partially addressed** |
| Escalation decisions | AI | A3 | Hard-coded triggers (deterministic) | 3 | No |

**Visible from this matrix:**
- Migration mapping and architecture are the highest-risk gaps — work is delegated but assurance is weak or absent
- Test creation and escalation are well-covered
- Drift detection is partially addressed; worth investing further

---

## What This Model Makes Visible

- **Which responsibilities have assurance gaps** — directly, without aggregation
- **The character of each assurance mechanism** — not just "covered/uncovered" but what kind of coverage and what its ceiling is
- **Where the vigilance cost is actually coming from** — the rows with level 0 or 1 assurance are the vigilance budget consumers
- **Whether it's safe to increase agency** — if a responsibility's work is moving right but its assurance level isn't rising, the gap is widening
- **The durability profile** — level 1 assurance decays over time; the matrix makes this visible per-responsibility

---

## What a Transition View Might Look Like

For each responsibility, track the gap over time as agency increases:

| Responsibility | A2 work | A2 assurance | A3 work | A3 assurance | Trend |
|---------------|---------|--------------|---------|--------------|-------|
| Code changes | Human | None (0) | AI | AST tools (4) | Improved |
| Architecture | Human | None (0) | Human | None (0) | Flat |
| Migration mapping | Human | None (0) | AI | Human review (1) | **Worsened** |

Migration mapping got worse: work transferred from human to AI, but assurance only moved to human review — which is weaker than the human doing the work themselves.

---

## Opportunities

- **Directly diagnostic.** A team can fill in the matrix and immediately see where to invest.
- **Captures the "where does assurance transfer to" dimension** that the 2D grid misses.
- **Makes "assurance level" visible per-responsibility** rather than aggregated away.
- **Connects to the existing responsibility matrix** in the model — it's an extension, not a replacement.
- **Makes regression visible** — a responsibility can get worse when agency increases without assurance improvement.

## Challenges

- **Unwieldy at full scale.** 21 responsibilities × 2 sides × multiple agency levels = a lot of cells. Hard to hold in working memory or show compactly.
- **Assurance level assignment is judgment-dependent.** What counts as level 3 vs. level 2? Requires calibration.
- **Doesn't capture interactions.** A gap in architecture assurance may make code-change assurance less effective. The matrix treats rows as independent.
- **Hard to navigate for action.** "Fix the gaps" is the obvious read, but which gap to fix first requires external prioritization logic.
