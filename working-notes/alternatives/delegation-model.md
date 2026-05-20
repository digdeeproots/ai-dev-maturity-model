# Alternative Model: Delegation Model (Portfolio and Structured variants)

*Prototype — incomplete by design. Two flavors of the same underlying model.*

---

## The Common Foundation

Both variants share the same core structure. The difference is who defines the regions and how comprehensive the taxonomy is.

### What a Delegation Region Is

A delegation region is a named scope of work that has both a work side and an assurance side:

- **Work side**: who performs this type of work (human → AI, the agency question)
- **Assurance side**: what mechanism ensures this work was done correctly (the sustainability question)

### What the Vigilance Trap Actually Is

The vigilance trap is what you get when the assurance side is weak. It becomes more visible as more work flows through the system — either because work is delegated to AI (faster rate) or because team or codebase scale increases (more staff, more lines of code).

The key relationship: **vigilance toil ∝ new work × existing body of work.** Assurance has to protect existing work from corruption by new work. This is multiplicative, not additive.

Consequences:

- **Greenfield project:** existing body is near-zero. Even a high rate of new work produces near-zero vigilance toil. The danger zone is low even with weak assurance.
- **Brownfield codebase:** existing body is large. Even a moderate rate of new work produces high vigilance toil. Weak assurance is catastrophic.
- **AI increases the rate of new work.** It does not change the size of the existing body. This is the only mechanism by which AI actually increases vigilance toil — and it explains why AI hits brownfield products disproportionately hard. The existing body amplifies everything.

The trap therefore has two triggers, not one: delegating work without improving assurance (the obvious one), and increasing throughput in a large codebase without improving assurance first (the one that catches teams by surprise).

### The Assurance Spectrum

The key criterion for placing a mechanism on the spectrum: **at what point does an error become visible to anyone other than the originator?**

- Level 4: never propagates past the originator — it is impossible to produce visible output with that class of error
- Level 3: propagates past the originator, then is deterministically caught for known error classes
- Level 2: propagates past the originator, then is probabilistically detected
- Levels 0–1: propagates until someone notices, or never

| Level | Mechanism | When error becomes visible | Vigilance residual | Ceiling |
|-------|-----------|---------------------------|-------------------|---------|
| 4 | Prevention — mistake cannot propagate past originator within scope | Never (to others) | Zero within scope | Absolute within scope |
| 3 | Deterministic detection — catches known error classes reliably after injection | At the check | Near-zero for known classes; zero for novel ones | Fixed to known classes |
| 2 | Non-deterministic guardian — probabilistic detection after injection | Probabilistically at detection | Reduced; cannot be eliminated | Probabilistic cap |
| 1 | Human review — human inspects and judges | At review (if reviewer catches it) | Full; decays as attention lapses | Decays |
| 0 | None | At consequences | Full + blind | None |

**Why type systems and theorem provers are level 4, not level 3:** Even though they run after code is written, a type checker that runs immediately — before any other agent or human sees the output, enforced by deterministic workflow code — prevents the error from ever propagating. As long as the worker cannot bypass the system (casting to `any`, disabling the check), they cannot produce visible output with a type error. The error class is completely prevented within scope. The distinction is propagation, not timing.

**Why levels 2 and 3 are more similar than they appear:** Both are probabilistic in coverage. Level 3 is deterministic about what it covers — for errors it checks for, it always catches them. But it cannot check for errors no one has thought to look for. Novel problems are blind spots for both levels 2 and 3. Level 3's advantage over level 2 is precision and reliability for known classes, not breadth.

**The scope qualifier on level 4:** Every level-4 mechanism has a scope. A type system prevents type errors within the type system's scope, not logic errors. AST refactoring tools prevent behavior changes within refactoring operations, not design mistakes. Level-4 guarantees are always scoped; they cannot be universal. The goal is to accumulate scoped guarantees until the remaining uncovered area is small and well-understood.

**Note on the recovery vs. prevention ceiling:** Prevention (level 4) can reach zero vigilance within its scope. Detection mechanisms (levels 2–3) cannot — they require vigilance over whatever they miss. This is a fundamental ceiling difference between prevention-based and detection-based assurance strategies.

### What a Gap Looks Like

A gap is any region where the work side is further along the delegation spectrum than the assurance side can support. Given the multiplicative relationship above:

**Gap cost = weakness of assurance × rate of new work × size of existing body**

Teams in chronic "maintenance mode" have high existing body, moderate new work rate, and low assurance across most regions. That product is large. The maintenance burden is not technical debt in the abstract — it is the gap cost, accumulating.

### Measuring a Region

For any delegation region:

| Measurement | Question | Scale |
|-------------|----------|-------|
| Work delegation | Who performs this? | Human → AI (maps to agency levels) |
| Assurance level | What ensures correctness? | 0–4 (spectrum above) |

Safe delegation: work delegation level and assurance level are matched. Moving work delegation without moving assurance widens the gap.

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
| Assurance level | 4 — prevention (AST tools only; no edit-file access; enforced by workflow) |
| What it does NOT cover | Whether the refactoring was the right design choice |
| Agency unlock | Agent can execute refactoring without per-step human review |
| Decay risk | Low — mechanism is tooling and workflow enforcement, not discipline |

**A partial portfolio at A3:**

| Zone | Work | Assurance | Gap? |
|------|------|-----------|------|
| Behavioral safety of refactorings | AI | Prevention (4) — AST tools | No |
| Test structure | AI | Prevention (4) — recipe tool in workflow | No |
| Migration data safety | AI | Prevention (4) — migration framework | No |
| Type safety of new code | AI | Prevention (4) — strict TS enforced before commit | No |
| Migration semantic correctness | AI | Human review (1) | **Yes** |
| Architecture decisions | Human | None (0) | **Yes — even at human agency** |
| Test coverage selection | AI | Non-det guardian (2) — coverage scanner | Partial |

**What it makes visible:**
- Which mistake classes have been addressed and which haven't
- Whether a team is advancing or just feeling like they are
- Where to invest next based on remaining gap × throughput × codebase size
- Decay risk per zone (discipline-based zones drift; tooling-enforced zones hold)

**What it makes visible about the maintenance trap:**
A team in maintenance mode auditing their portfolio typically finds: CI/CD (level 3 at best) and human review everywhere else. Most regions at level 0–1. Given a large existing body, the gap cost is enormous. The foot-guns are not bad luck — they are the mathematical product of weak assurance × large codebase × ongoing new work. The investment path (moving regions from level 1 to level 4) is the same whether or not AI is involved.

**Opportunities:**
- Maximally flexible — unusual domains can create zones not in any taxonomy
- Directly actionable: "add X to your portfolio" rather than "improve your sustainability score"
- Honest about progress: binary per zone, not a continuous dial
- Compositional: zones stack; coverage grows incrementally

**Challenges:**
- No comprehensive view — you don't know what you don't know; critical regions may be entirely missing
- Hard to compare across teams — different taxonomies, different regions
- Doesn't guarantee coverage — you might invest in the wrong zones while leaving critical ones empty

---

## Variant 2: Structured Delegation Map (Closed-World)

**The approach**: All regions are identified up front, using a shared taxonomy derived from the responsibility matrix. Each region gets the same measurement applied. Drill-down for each region lists specific options for improving work delegation or assurance level.

**What makes it structured**: The regions are exhaustive and consistent. You cannot miss a region because it is already in the map. The trade-off is that you are using a shared taxonomy rather than inventing your own.

**The region taxonomy (from responsibility matrix + assurance expansion):**

Each existing responsibility splits into its work side and assurance side. Missing pairs are added.

| Region | Work side | Assurance side |
|--------|-----------|----------------|
| Code changes: refactoring | Who refactors? | What prevents behavior change? |
| Code changes: new code | Who writes? | What ensures type/structural correctness? |
| Code changes: logic correctness | Who writes? | What detects logic errors? |
| Test creation: structure | Who structures tests? | What ensures recipe compliance? |
| Test creation: coverage | Who identifies what to test? | What detects blind spots? |
| Architecture: decisions | Who decides? | What ensures consistency over time? |
| Architecture: drift | Who detects drift? | What prevents compounding? |
| Migration: execution | Who executes? | What prevents data loss? |
| Migration: mapping | Who defines the mapping? | What ensures semantic correctness? |
| Planning: structure | Who plans? | What ensures all required elements addressed? |
| Planning: grounding | Who validates? | What ensures grounding in evidence? |
| ... | ... | ... |

**A structured map view (sample at A3):**

| Region | Work | Assurance | Gap? |
|--------|------|-----------|------|
| Refactoring | A3 AI | Prevention (4) — AST tools | No |
| New code: type safety | A3 AI | Prevention (4) — strict TS in workflow | No |
| New code: logic correctness | A3 AI | Detection (3) — tests | Partial (novel classes blind) |
| Test structure | A3 AI | Prevention (4) — recipe tool | No |
| Test coverage | A2 human-guided AI | Non-det (2) — scanner | **Gap — partial** |
| Architecture decisions | A1 human | None (0) | **Gap** |
| Architecture drift | A3 AI monitor | Non-det (2) — guardian | Partial |
| Migration execution | A3 AI | Prevention (4) — framework | No |
| Migration mapping | A3 AI | Human review (1) | **Gap** |
| Planning structure | A2 AI | Detection (3) — planning tool checks fields | No |
| Planning grounding | A2 AI | Human review (1) | **Gap** |

**Drill-down for a gap region (Test coverage):**

Current state: A2 work delegation, level-2 assurance (non-deterministic scanner).

Options to improve work delegation to A3:
- Provide AI with domain-specific blind-spot library; run two independent coverage assessments with different prompts; take union
- Have AI generate coverage hypothesis; human confirms/extends; AI implements

Options to improve assurance level (2 → 3 or 4):
- Session-based exploratory testing on cadence; findings become deterministic recipe additions (bootstraps from level 2 to level 3)
- Deterministic tool verifies recipe structural compliance before output is shared (reaches level 4 for recipe compliance scope)

**What it makes visible about the maintenance trap:**
The structured map applies to human-only teams directly. A team in maintenance mode fills in mostly A1–A2 work with mostly level 0–1 assurance. The map shows exactly which regions are generating their foot-guns. Given a large brownfield codebase, the gap cost (weak assurance × high existing body × ongoing new work) explains the chronic maintenance burden structurally. The investment path — moving assurance levels up — is identical to the AI delegation investment path. The levers available in the human universe are fewer, but the structure is the same.

**Opportunities:**
- Comprehensive — no gaps hidden by incomplete self-assessment
- Consistent measurement across teams — enables comparison
- Drill-down actionability — each gap has a menu of specific options
- Makes the maintenance trap structurally visible and quantifiable
- Applies to human-only teams, mixed teams, and AI-heavy teams identically

**Challenges:**
- Taxonomy requires maintenance and agreement on boundaries
- May feel prescriptive; unusual domains may not fit cleanly
- Large surface area at full scale
- Assurance level placement requires calibration

---

## Relationship Between Variants

Use the structured map to discover what you are missing. Use the portfolio to track what you are investing in. The structured map is the taxonomy; the portfolio is your current position within it.

Both use the same assurance spectrum and gap measurement. Both show the maintenance trap using the same mechanism. The difference is open vs. closed world — invention vs. exhaustiveness.
