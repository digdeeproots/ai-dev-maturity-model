# Behavioral Matrix — Responsibilities with Assurance Dimension

*Draft v1 for review. Maps all 21 responsibilities to their assurance dimension.*

Purpose: extend the existing responsibility matrix to show both work delegation (who performs this) and assurance delegation (what ensures correctness). This is the structured delegation map variant applied to the full responsibility set.

---

## How to Read This Document

Each responsibility entry shows:
- **Mistake classes**: the specific types of errors this work can introduce
- **Assurance options**: investments that provide assurance, ordered by level (0–5)
- **Gap trigger**: the agency transition where missing assurance becomes expensive

The work delegation column (who performs this at each stage) comes from responsibility_ownership.json. This document adds the assurance column.

Some existing responsibilities are themselves assurance mechanisms (step_oversight, evaluation, drift, escalation). For these, the relevant question is: what level of assurance does the mechanism provide, and what investments move it to higher levels?

Some responsibilities need to split: `code` covers three distinct mistake classes with different optimal mechanisms.

---

## Domain: Code Changes

### Code — Refactoring Safety
*Split from: `code`*

**Mistake class**: Behavioral change during a refactoring — the code is restructured but its behavior changes unintentionally.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review of diff | Human review | 1 | Whatever reviewer noticed |
| Test suite run after refactoring | Deterministic detection | 3 | Tested behaviors only |
| AST-based refactoring tools only (no edit-file) | Guided correctness | 5 | All structural refactoring operations |

Level 5 is achievable here. AST tools make behavioral safety the easy path; hand-editing during refactoring is made deliberately harder.

**Gap trigger**: A2.2. When AI writes code with human review, manually-caught behavioral changes are high cost. At A3+, human review is no longer continuous — level 3 minimum, level 5 preferred.

---

### Code — Type/Structural Correctness
*Split from: `code`*

**Mistake class**: Type errors, structural violations, API contract breaches.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Linter rules | Deterministic detection | 3 | Configured rules only |
| Strict type system enforced pre-commit | Prevention | 4 | All type interactions in covered code |

**Gap trigger**: A1.2. The moment AI writes code a human must review, type errors require vigilance unless a type system catches them first. Strict TS config + CI enforcement = level 4 investment.

---

### Code — Logic Correctness
*Split from: `code`*

**Mistake class**: Logic errors — code with correct types that does the wrong thing.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human code review | Human review | 1 | Whatever reviewer noticed |
| Unit tests (ad hoc) | Deterministic detection | 3 | Tested behaviors; no coverage guarantee |
| Unit tests (recipe-based) | Deterministic detection | 3 | Recipe-defined coverage; predictable gaps |
| Property-based tests / mutation testing | Deterministic detection | 3 | Coverage of structural properties |
| Theorem provers (formal methods) | Prevention | 4 | Formally specified invariants only |

Logic correctness has no general level-5 mechanism. The ceiling is level 4 for formally-specified properties, level 3 for test-covered behaviors.

**Gap trigger**: A2.2. Once AI writes code without step-by-step oversight, logic correctness requires test coverage at minimum. At A3+, recipe-based test structure ensures coverage is not ad hoc.

---

## Domain: Testing

### Unit Tests — Structure Compliance
*Split from: `unit_tests`*

**Mistake class**: Tests written in the wrong structure — using mocks where Nullables apply, missing business-level assertions, no snapshot formatting, wrong test boundary.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review of tests | Human review | 1 | Whatever reviewer noticed |
| Test recipe documentation | Human review | 1 | Written; discipline-based; decays |
| Recipe compliance tool (deterministic check) | Prevention | 4 | All structural compliance rules |

The recipe compliance tool: deterministic code verifies structure before tests are committed. AI cannot produce structurally non-compliant tests if the workflow gate blocks them.

**Gap trigger**: A2.3. When AI writes tests autonomously, structure compliance requires either continuous human review (level 1, unsustainable) or a recipe compliance tool (level 4).

---

### Unit Tests — Coverage Adequacy
*Split from: `unit_tests`*

**Mistake class**: Wrong things tested, insufficient coverage, blind spots in test suite.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Coverage scanners (line/branch) | Non-deterministic guardian | 2 | Statistical; misses behavior coverage |
| Session-based exploratory testing | Non-deterministic guardian | 2 | Human-driven; finds novel classes |
| Coverage guardian (AI scans for gaps + abstracts) | Non-deterministic guardian | 2 | Broader than line coverage; unpredictable |
| Test coverage recipes (encodes known blind spots) | Deterministic detection | 3 | Recipe-enumerated blind spot categories |

There is no known level-4 mechanism for coverage adequacy in the general case. The ceiling is level 3 for known categories.

**Gap trigger**: A2.3. Once AI writes tests without guidance, coverage adequacy requires at minimum a scanner. The more valuable investment: session exploratory testing that bootstraps to level 3.

---

### Integration/System Tests
*Responsibility: `integration_tests`*

**Mistake classes**:
- Wrong system boundary tested (same as unit test structure)
- Missing interaction coverage (same as unit test coverage)
- Environment coupling (test depends on external state, producing flaky or false results)

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Contract testing tool | Deterministic detection | 3 | Specified contracts only |
| In-process infrastructure (Testcontainers, Simulators) | Prevention | 4 | Environment coupling within scope |

**Gap trigger**: A2.2. When AI writes integration tests, environment coupling without Simulators or in-process infra produces fragile tests. Patterns (Nullables, Hexagonal ports) must be injected into AI context — AI will not reach for them on its own.

---

## Domain: Architecture

### Architecture — Decision Consistency
*Split from: `architecture`*

**Mistake class**: Architectural decisions made without awareness of prior decisions; inconsistency accumulates.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Tribal knowledge | Human review | 1 | Whatever team remembers |
| Architecture Decision Records (ADRs) | Non-deterministic guardian | 2 | Written; requires review to apply |
| ADR review in planning workflow | Deterministic detection | 3 | All decisions in planning scope |
| Deterministic planning tool requiring ADR reference | Prevention | 4 | All decisions made via the tool |

**Gap trigger**: A2.1. When AI assists with architecture, inconsistency with prior decisions is a common failure. ADRs are minimum; planning tool enforcement is level 4.

---

### Architecture — Drift Detection
*Split from: `architecture`*

**Mistake class**: Code drifts from architectural intent over time; drift compounds silently.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Ad hoc review | Human review | 1 | Occasional; decays fast |
| AI drift guardian (regular scan + abstraction) | Non-deterministic guardian | 2 | Broader than rules; unpredictable gaps |
| Architecture linters (ArchUnit, Dependency Cruiser) | Deterministic detection | 3 | Configured rule set |
| Drift → ADR pipeline (guardian bootstraps to rules) | Bootstrapped to 3 | Systematic improvement |

**Gap trigger**: A3+. Autonomous AI work introduces drift; continuous review is impossible. Drift guardian minimum; architecture linters preferred.

---

### Design for Testability
*Responsibility: `testability`*

**Mistake class**: Code ships that is difficult to test cleanly — tight coupling, hidden dependencies, mixed concerns.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human code review for testability | Human review | 1 | Whatever reviewer noticed |
| Hexagonal architecture enforcement | Deterministic detection | 3 | Dependency direction rules |
| AST analysis of dependency graph | Deterministic detection | 3 | All dependencies |
| Design-for-testability workflow gate | Prevention | 4 | All code through the gate |

The Nullables pattern, Simulators, ports and adapters: once injected into AI context, AI uses them well. The investment is deterministic orchestration that deposits the pattern and references it in every test-writing invocation.

**Gap trigger**: A2.2. When AI writes code and tests together, testability requires active guidance — AI defaults to mocks and will not reach for Nullables or ports on its own.

---

## Domain: Planning and Direction

### Goal Definition
*Responsibility: `goals`*

**Mistake class**: Goals are unmeasurable, ungrounded, or disconnected from reality.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Planning discipline | Human review | 1 | Depends on individual; decays |
| Planning tool requiring grounding source | Prevention | 4 | All goals made via the tool |

**Gap trigger**: A2.1. When AI helps define goals, ungrounded AI-generated goals look plausible but aren't. Planning tool enforcement prevents this class.

---

### Work Decomposition
*Responsibility: `decomposition`*

**Mistake class**: Work decomposed incompletely, inconsistently, or in a way that hides unknowns.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human judgment | Human review | 1 | Individual skill; decays |
| Planning tool with required fields (variation points, unknowns, dependencies) | Prevention | 4 | All decompositions via the tool |

**Gap trigger**: A2.1. Same pattern as goal definition.

---

### Task Prioritization and Selection
*Responsibilities: `prioritization`, `selection`*

**Mistake class**: Working on the wrong things in the wrong order.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human judgment | Human review | 1 | Situation-dependent |
| Explicit scoring criteria | Deterministic detection | 3 | Scored dimensions only |
| Deterministic queue (FIFO or rule-based) | Prevention | 4 | All tasks through the queue |

**Gap trigger**: A3.1. When the system selects tasks, selection logic must be explicit or it defaults to implicit AI judgment.

---

### Success Criteria Definition
*Responsibility: `criteria`*

**Mistake class**: Criteria are missing, unmeasurable, or disconnected from intent.

Note: `criteria` is itself an assurance mechanism for `evaluation` and `code`. What assures that criteria are good?

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Planning discipline | Human review | 1 | — |
| Stakeholder review of criteria before work starts | Deterministic detection | 3 | Reviewed criteria |
| Planning tool requiring criteria fields | Prevention | 4 | All work with criteria via the tool |

**Gap trigger**: A2.1. AI-generated criteria look complete but often omit edge cases.

---

### Grounding / Reality Check
*Responsibility: `grounding`*

**Mistake class**: System drifts from user needs; AI outputs are plausible but wrong.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Regular demos / user review | Human review | 1 | What demo participants noticed |
| Metrics / telemetry | Deterministic detection | 3 | Measured behaviors; blind to unmeasured |
| A/B testing infrastructure | Deterministic detection | 3 | Tested variants; blind to unmeasured |
| Outcome-based planning with measurement gates | Prevention | 4 | All work with defined outcome gates |

**Gap trigger**: A3+. Autonomous AI work that doesn't get user validation produces drift that accumulates silently.

---

### Product Direction / Vision
*Responsibility: `direction`*

**Mistake class**: Direction is uncommunicated, unstated, or assumed.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Written vision document | Human review | 1→2 | Written; requires review to apply |
| Vision reviewed at each planning cycle | Deterministic detection | 3 | All planning cycles that include review |

Direction remains human-held through A4+. The assurance question is mainly whether direction is written and legible to AI systems.

**Gap trigger**: A3. When AI selects and sequences tasks, unwritten direction becomes a gap.

---

## Domain: Process and Oversight

### Process Design
*Responsibility: `process_design`*

**Mistake class**: Process is not followed; rules aren't enforced; exceptions accumulate.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Process documentation + peer review | Human review | 1 | Discipline-based; decays |
| CI/CD gates enforcing process rules | Deterministic detection | 3 | What CI checks cover |
| Deterministic workflow orchestration (process IS the code) | Prevention | 4 | All work through the workflow |

**Gap trigger**: A2.1. Once AI is in the loop, undocumented process rules are invisible to AI.

---

### Step-Level Oversight
*Responsibility: `step_oversight`*

Note: this IS an assurance mechanism. The question is what level of assurance the oversight provides.

**Mistake class**: Bad step committed or bad output accepted at the step level.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human reads every step | Human review | 1 | Whatever human noticed; decays with throughput |
| Automated checks per step (tests pass, types clean) | Deterministic detection | 3 | What automated checks cover |
| Deterministic pass/fail gate per step | Prevention | 4 | All work that must pass the gate |

**Gap trigger**: A2.2. When AI executes multi-step work, humans cannot review every step. Level 3 minimum; level 4 preferred.

---

### Cycle-Level Oversight
*Responsibility: `cycle_oversight`*

**Mistake class**: A bad iteration cycle completes without detection before the next cycle starts.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review at cycle boundary | Human review | 1 | What human noticed in demo/review |
| Automated cycle summary + anomaly detection | Non-deterministic guardian | 2 | Probabilistic; may miss quiet problems |
| Deterministic health check at cycle boundary | Deterministic detection | 3 | What health check covers |

**Gap trigger**: A3. When the system sequences tasks, explicit cycle-boundary checks must be present.

---

### Flow-Level Oversight
*Responsibility: `flow_oversight`*

**Mistake class**: Development rhythm degrades; strategic drift; process health erodes.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human situational awareness | Human review | 1 | What team notices |
| Guardian agent monitoring trends + alerting | Non-deterministic guardian | 2 | Broader than metrics; probabilistic |
| Metrics dashboards + alerts | Deterministic detection | 3 | Measured metrics only |

**Gap trigger**: A3+. When the loop runs semi-autonomously, flow health requires active monitoring.

---

### Boundary Definition
*Responsibility: `boundaries`*

**Mistake class**: AI acts outside its delegated scope.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Written boundary documentation | Human review | 1 | Requires AI to read and follow |
| Tooling restrictions (read-only access, file-type restrictions) | Prevention | 4 | All operations the tools allow |
| Workflow enforcement of boundary | Prevention | 4 | All work through the workflow |

**Gap trigger**: A2.1. Once AI acts autonomously, tooling-enforced boundaries are qualitatively safer than documentation-only.

---

## Domain: Evaluation and Detection

### Output Evaluation
*Responsibility: `evaluation`*

Note: this IS an assurance mechanism. The question is what level it operates at.

**Mistake class**: Bad output accepted — wrong output, misaligned with criteria.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review of output | Human review | 1 | Whatever human noticed |
| LLM-as-judge (single run) | Non-deterministic guardian | 2 | Probabilistic; may share AI's biases |
| LLM-as-judge (multi-run, adversarial prompts) | Non-deterministic guardian | 2→3 | Improves with adversarial variation |
| Automated eval against defined criteria | Deterministic detection | 3 | Criteria-covered behaviors |
| Criteria coverage tool (enforces criteria completeness) | Prevention | 4 | All criteria that must pass the tool |

**Gap trigger**: A2.2. When AI produces outputs for human review, unstructured review is level 1. Eval framework minimum; LLM-judge for novel class discovery.

---

### Drift and Health Detection
*Responsibility: `drift`*

Note: this IS an assurance mechanism. The question is what level it operates at.

**Mistake class**: System drift goes undetected; health degrades silently.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human situational awareness | Human review | 1 | What team notices |
| AI drift guardian (scans + abstracts anomalies) | Non-deterministic guardian | 2 | Broader; probabilistic |
| Metrics + alerts | Deterministic detection | 3 | Measured metrics only |
| Drift → deterministic check pipeline | Bootstrapped to 3 | Systematic improvement |

**Gap trigger**: A3+.

---

### Continue/Stop/Escalate Decision
*Responsibility: `escalation`*

Note: this IS an assurance mechanism. The question is what level it operates at.

**Mistake class**: Work continues past a point where human intervention is needed.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human checks in | Human review | 1 | Depends on attention |
| Agent detects uncertainty and flags | Non-deterministic guardian | 2 | Probabilistic; misses confident-but-wrong |
| Deterministic halt conditions (circuit breakers) | Prevention | 4 | All conditions in circuit breaker rules |

**Gap trigger**: A3. Autonomous task sequences need explicit halt conditions.

---

## Domain: Infrastructure

### Infrastructure
*Responsibility: `infrastructure`*

**Mistake classes**: Deployment failures; configuration drift; environment inconsistency.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Manual deployment with review | Human review | 1 | Whatever human checked |
| CI/CD pipeline | Deterministic detection | 3 | What pipeline checks |
| Infrastructure as Code (IaC) | Deterministic detection | 3 | Declared infrastructure |
| Idempotent declarative deployments | Prevention | 4 | All deployments through declarative system |

**Gap trigger**: A2.1. Once AI touches infrastructure config, reproducibility requires IaC at minimum.

---

## Summary: Gap Patterns by Domain

| Domain | First expensive gap | Minimum viable assurance | Target assurance |
|--------|--------------------|--------------------------|--------------------|
| Code — refactoring | A2.2 | Level 3 (tests) | Level 5 (AST tools) |
| Code — type safety | A1.2 | Level 4 (strict type system) | Level 4 |
| Code — logic | A2.2 | Level 3 (tests, recipe) | Level 3 |
| Test structure | A2.3 | Level 4 (recipe tool) | Level 4 |
| Test coverage | A2.3 | Level 2 (scanner) | Level 3 (recipe bootstrap) |
| Integration tests | A2.2 | Level 3 (contract testing) | Level 4 (Simulators) |
| Architecture decisions | A2.1 | Level 2 (ADRs) | Level 4 (planning tool) |
| Architecture drift | A3 | Level 2 (guardian) | Level 3 (linters) |
| Testability | A2.2 | Level 1 (review) | Level 4 (workflow gate) |
| Goal quality | A2.1 | Level 4 (planning tool) | Level 4 |
| Decomposition quality | A2.1 | Level 4 (planning tool) | Level 4 |
| Prioritization/selection | A3.1 | Level 3 (scoring) | Level 4 (queue rules) |
| Criteria quality | A2.1 | Level 3 (stakeholder review) | Level 4 (planning tool) |
| Grounding | A3 | Level 3 (metrics) | Level 4 (measurement gates) |
| Direction | A3 | Level 3 (cycle review) | Level 3 |
| Process design | A2.1 | Level 3 (CI gates) | Level 4 (workflow code) |
| Step oversight | A2.2 | Level 3 (automated checks) | Level 4 (gates) |
| Cycle oversight | A3 | Level 3 (health check) | Level 3 |
| Flow oversight | A3 | Level 3 (metrics + alerts) | Level 3 |
| Boundaries | A2.1 | Level 4 (tooling restrictions) | Level 4 |
| Output evaluation | A2.2 | Level 2 (LLM judge) | Level 3 (eval framework) |
| Drift detection | A3 | Level 2 (guardian) | Level 3 |
| Escalation | A3 | Level 4 (circuit breakers) | Level 4 |
| Infrastructure | A2.1 | Level 3 (IaC + CI/CD) | Level 4 (declarative) |

---

## Observations for Discussion

**Items that need to split**: The existing `code` responsibility bundles three distinct mistake classes with different mechanisms. `architecture` bundles decision consistency and drift. `unit_tests` bundles structure compliance and coverage adequacy.

**Items that are already assurance mechanisms**: `step_oversight`, `cycle_oversight`, `flow_oversight`, `evaluation`, `drift`, `escalation` are all assurance mechanisms. Each has its own level and investment path. The framework applies recursively: what assures the oversight?

**Missing items in the current list**: No explicit entry for refactoring safety (bundled under `code`), architecture drift (partially in `architecture`), or configuration drift (partially in `infrastructure`).

**The bypass question**: Several assurance mechanisms at level 4–5 require that AI cannot bypass them. Tooling-enforced restrictions (file-type access, workflow gates, AST-only tools) are qualitatively different from documentation or discipline. The model should distinguish enforced vs. advisory assurance.
