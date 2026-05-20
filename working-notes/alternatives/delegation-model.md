# Alternative Model: Delegation Model (Portfolio and Structured variants)

*Prototype — incomplete by design. Two flavors of the same underlying model.*

---

## The Common Foundation

Both variants share the same core structure. The difference is who defines the regions and how comprehensive the taxonomy is.

### What a Delegation Region Is

A delegation region is a named scope of work that has both a work side and an assurance side:

- **Work side**: who performs this type of work (human → AI, the agency question)
- **Assurance side**: what mechanism ensures this work was done correctly (the sustainability question)

The vigilance trap is what you get when work is delegated without corresponding assurance delegation. The region exists; one side moved; the other didn't.

@ai: no, the vigilance trap is what you get when the assurance side is weak. It becomes more visible when more work is done - either via delegation or scale (increase in staff or increase in lines of code). This is partly because assurance has to maintain that all existing work is not corrupted by the new work. Thus, it is a function of the product of new work and existing body of past work. This suggests that one critical element to assessing the amount of vigilance toil required is the volume of already-completed work - it is not sufficient to look even at the amount of work that is currently being done. And that's why this isn't just a problem when delegating to AI. AI will increase the rate of new work, but it doesn't impact the amount that is already there. So a sudden increase in the rate of new work for a greenfield project has low maint / vigilance cost, as we are multiplying by near-zero. Reverse is true on a brownfield one. This is the only way in which AI actually increases vigilance toil, and why it hits disporportionately on brownfield products.

### The Assurance Spectrum

The same spectrum applies in both variants:

| Level | Mechanism | Vigilance residual | Ceiling |
|-------|-----------|-------------------|---------|
| 4 | Structural prevention — mistake is impossible by universe design | Zero | Absolute |
| 3 | Deterministic evaluation — code catches it reliably after the fact | Near-zero for known unknowns | Fairly low |
| 2 | Non-deterministic guardian — AI/probabilistic detection; inherently imperfect | Reduced, not eliminated | Probabilistic cap |
| 1 | Human review — human inspects and judges | Full; decays over time | Decays |
| 0 | None — mistake goes undetected until consequences arrive | Full + blind | None |

Note: Level 2 (non-deterministic) cannot reach zero vigilance burden. It reduces the burden and can bootstrap level 3/4 mechanisms, but is not a permanent endpoint. Recovery-based mechanisms (levels 1-3) all leave residual vigilance; prevention-based (level 4) does not.

@ai: the problem with level 3 is that it is also probabilistic - it can only check for the things that we think to look for. We can't prevent novel problems. It isn't, of itself, a learning solution. And it isn't a constraint that prevents defect insertion. It simply finds a portion of those defects that have been been injected, and then guarnatees that it will eliminate those that it finds (while doing nothing about htose that it fails to detect). In that sense, level 2 & 3 are very similar. This is why I would categorize things like theorem provers and type systems as level 4, not level 3. Even though they happen after the code has been written/changed, and are thus "after the fact", they are 100% within a scope - they completely prevent errors in that scope. As long as we prevent the worker (AI or human) from disabling the system (casting a type to any, etc), then they are prevented from ever injecting a visible error. I think that it is useful to distinguish the point of error visibility as "as soon as anyone other than the originator could see it". So if we have a theorem prover or type checker that runs immediately, before we even let another AI look at the output, and that workflow is driven by deterministic code, then we are in level 4 territory, not level 3. Adjust the spectrum accordingly, and pull this out as another example (for the general case - it is not model-style-specific).

### What a Gap Looks Like

A gap is any region where the work side is further along the delegation spectrum than the assurance side can support. Gaps produce vigilance toil in direct proportion to the volume of work flowing through the region times the total volume of the body of work that must be protected against disruption by the new work.

**Gaps exist even without AI.** Teams in chronic "maintenance mode" or "keeping the lights on" have gaps in their human-work delegation regions — usually code changes, architecture decisions, or test coverage. The foot-guns they fight daily are the symptom. The gap is the cause.

### Measuring a Region

For any delegation region, two measurements:

| Measurement | Question | Scale |
|-------------|----------|-------|
| Work delegation | Who performs this? | Human → AI (maps to agency levels) |
| Assurance level | What ensures correctness? | 0–4 (spectrum above) |

Safe delegation: work delegation level and assurance level are matched. Moving work delegation without moving assurance creates a gap.

---

## Variant 1: Portfolio (Open-World)

**The approach**: You define your own regions. Unbounded. You invent zones that match your specific codebase, domain, and team. You pick which ones to invest in based on where it hurts.

**What makes it a portfolio**: Like an investment portfolio, you choose your positions. Some investments are off-the-shelf (type systems, CI/CD); some you build yourself (migration framework, testing recipe tool, planning scaffolding). The portfolio is yours.

**Sample portfolio entry:**

| Field | Value |
|-------|-------|
| Zone name | Behavioral safety of refactorings |
| Mistake class covered | Refactorings that change behavior |
| Work delegation | AI executes refactoring steps (A3) |
| Assurance level | 4 — structural prevention (AST tools only; no edit-file access) |
| What it does NOT cover | Whether the refactoring was the right design choice |
| Agency unlock | Agent can execute refactoring without per-step human review |
| Decay risk | Low — mechanism is tooling, not discipline |

**A partial portfolio at A3:**

| Zone | Work | Assurance | Gap? |
|------|------|-----------|------|
| Behavioral safety of refactorings | AI | Structural (4) | No |
| Test structure | AI | Structural (4) — recipe tool | No |
| Migration data safety | AI | Structural (4) — framework | No |
| Migration semantic correctness | AI | Human review (1) | **Yes** |
| Architecture decisions | Human | None (0) | **Yes — even at human agency** |
| Code changes (new code) | AI | Deterministic (3) — type system + tests | Partial |

**Visible from a portfolio view:**
- Which mistake classes have been addressed and which haven't
- Whether a team is actually advancing or just feeling like they are
- Where to invest next based on where the remaining gaps are highest-risk
- Decay risk per zone (discipline-based zones need maintenance)

**What it makes visible about the maintenance trap:**
Teams without AI can audit their portfolio too. A team in maintenance mode typically has a portfolio of zero or one: maybe CI/CD (level 3) but nothing else. Every other region is at level 0 or level 1. The foot-guns they fight are the uncovered regions producing defects. The investment path is the same as for AI delegation — just with fewer available mechanisms at level 4.

**Opportunities:**
- Maximally flexible — teams in unusual domains can create zones that don't exist in any taxonomy
- Directly actionable: "add X to your portfolio" rather than "improve your sustainability score"
- Honest about progress: binary per zone, not a dial
- Compositional: zones stack; coverage grows incrementally

**Challenges:**
- No comprehensive view — you don't know what you don't know. A team may feel good about their portfolio while missing entire mistake classes.
- Hard to compare across teams — different portfolios, different taxonomies
- Doesn't guarantee coverage — you might invest in the wrong zones while leaving critical ones empty

---

## Variant 2: Structured Delegation Map (Closed-World)

**The approach**: All regions are identified up front, using a shared taxonomy derived from the responsibility matrix. Each region gets the same measurement applied. Drill-down for each region lists specific options for improving work delegation or assurance level.

**What makes it structured**: The regions are exhaustive and consistent. You can't miss a region because it's already in the map. The trade-off is that you're using our taxonomy rather than yours.

**The region taxonomy (from responsibility matrix + assurance expansion):**

Each existing responsibility splits into its work side and assurance side. Missing pairs are added. Sample:

| Region | Work side | Assurance side |
|--------|-----------|----------------|
| Code changes: refactoring | Who refactors? | What prevents behavior change? |
| Code changes: new code | Who writes new code? | What ensures correctness? |
| Test creation: structure | Who structures tests? | What ensures recipe compliance? |
| Test creation: coverage | Who identifies what to test? | What detects blind spots? |
| Architecture: decisions | Who makes decisions? | What ensures consistency over time? |
| Architecture: drift | Who detects drift? | What prevents drift from compounding? |
| Migration: execution | Who executes? | What prevents data loss? |
| Migration: mapping | Who defines the mapping? | What ensures semantic correctness? |
| ... | ... | ... |

**A structured map view:**

| Region | Work level | Work performer | Assurance level | Assurance mechanism | Gap? |
|--------|-----------|---------------|-----------------|---------------------|------|
| Refactoring | A3 | AI | 4 | AST tools | No |
| New code | A3 | AI | 3 | Type system + tests | Partial |
| Test structure | A3 | AI | 4 | Recipe tool | No |
| Test coverage | A2 | Human-guided AI | 1 | Human review | **Yes** |
| Architecture decisions | A1 | Human + AI review | 0 | None | **Yes** |
| Architecture drift | A3 | AI monitor | 2 | Non-det guardian | Partial |
| Migration execution | A3 | AI | 4 | Migration framework | No |
| Migration mapping | A3 | AI | 1 | Human review | **Yes** |

**Drill-down for a gap region (Test coverage):**

Options to improve work delegation:
- Provide AI with pattern library of common blind spots per domain
- Run two independent AI coverage assessments with different prompts; take union
- Have AI generate coverage hypothesis then have human confirm/extend

Options to improve assurance level (currently 1 → target 3 or 4):
- Session-based exploratory testing on a cadence; findings become deterministic test recipes
- Non-deterministic guardian scans for coverage patterns; flags regions without business-concept tests
- Deterministic coverage tool verifies recipe compliance (structure only, not semantics)

**What it makes visible about the maintenance trap:**
The structured map applies to human-only teams. A team in maintenance mode gets the same map filled in with mostly low work-delegation levels (A1-A2) and mostly low assurance levels (0-1). The map shows exactly which regions are producing their foot-guns. Investments in the human universe (testing discipline, type systems, code review recipes, architectural decision records) show up as assurance level improvements even before any AI agency is added.

**Opportunities:**
- Comprehensive — no gaps hidden by incomplete self-assessment
- Consistent measurement across teams — enables comparison and benchmarking
- Drill-down actionability — each gap has a menu of specific options
- Makes the maintenance trap structurally visible — not just "we have tech debt" but "these specific regions have assurance level 0"

**Challenges:**
- Taxonomy requires maintenance — what are all the regions? Who decides? Boundaries are fuzzy.
- May feel prescriptive — teams in unusual domains may not see their specific situation in the taxonomy
- Large surface area — 20+ regions × 2 sides = a lot to fill in
- Assurance level placement requires shared calibration

---

## Relationship Between Variants

The structured map and the portfolio are the same model at different levels of openness:

- The structured map gives you the canonical taxonomy of regions; the portfolio lets you define your own
- Both use the same assurance spectrum for measurement
- Both identify gaps the same way (work delegation ahead of assurance level)
- A team can use the structured map to find their gaps and build a portfolio of investments to close them

In practice: use the structured map to find what you don't know; use the portfolio to track what you're investing in.
