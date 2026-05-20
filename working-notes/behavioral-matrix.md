# Behavioral Matrix — Work Types and Assurance Dimension

*Draft v2 — restructured by work type.*

Purpose: extend the existing responsibility matrix to show both work delegation (who performs this) and assurance delegation (what ensures correctness). Organized by what people are trying to do, with error classes as the second level.

---

## How to Read This Document

Each **work type** entry shows:
- What people are trying to accomplish
- The **error classes** that work can introduce — each is an independent vigilance problem
- For each error class: **body at risk** (what existing work a single error can corrupt), **rate** (how often this kind of error occurs relative to the work rate), **assurance options** (investments ordered by level), and **gap condition** (the combination of rate and body size that makes the unaddressed cost unsustainable)

**Total vigilance cost for a work type** = rate of this work × Σ(body at risk × assurance deficit per error class)

Error classes within a work type have independent costs that sum. Addressing one does not reduce the cost of another.

The work delegation column (who performs this at each stage) comes from responsibility_ownership.json. This document adds the assurance dimension.

Note: some existing responsibilities in the model are themselves assurance mechanisms (step_oversight, evaluation, drift, escalation). They appear in the Evaluation and Oversight domain, where the question is: what level does the mechanism operate at, and what investments move it higher?

---

## Domain: Code Work

### Work type: Evolving the design

*Restructuring code to change its structure without (intended) change in observable behavior. Includes extract method, rename, move module, change interface, restructure data flow.*

Total vigilance cost = frequency of design changes × (accidental behavior change cost + design regression cost + structural breakage cost)

#### Error class: Accidental behavior change

**Body at risk**: Every test and every downstream system depending on the behavior of the changed component. Narrow for leaf components; systemic for widely-used utilities.

**Rate**: One opportunity per structural change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review of diff | Human review | 1 | Whatever reviewer noticed |
| Test suite run after refactoring | Deterministic detection | 3 | Tested behaviors only |
| AST-based refactoring tools only | Guided correctness | 5 | All structural refactoring operations |

**Gap condition**: Expensive in any codebase where components have more than a few callers. Cost grows with codebase size and interconnection. In a large brownfield codebase at any sustained change rate, assurance level 0–1 produces unsustainable toil.

---

#### Error class: Design regression

**Body at risk**: Architectural coherence of the affected module and its dependents. Cascades if the changed abstraction sets a precedent.

**Rate**: Occurs with every structural change; varies by centrality of the changed abstraction.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review for design quality | Human review | 1 | Whatever reviewer noticed |
| AI design critique fork (adversarial) | Non-deterministic guardian | 2 | Probabilistic; finds common patterns |
| Architecture linters (dependency rules) | Deterministic detection | 3 | Configured structural rules |

No known level-4 mechanism for design quality in the general case. Human judgment remains essential here.

**Gap condition**: Less multiplicative than behavior change — regressions don't proliferate automatically but accumulate, each making future design work harder. Expensive when throughput is high and no design review exists.

---

#### Error class: Structural/type breakage

**Body at risk**: All typed consumers of the changed interface. Systemic for widely-used modules.

**Rate**: One opportunity per interface change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Linter rules | Deterministic detection | 3 | Configured rules only |
| Strict type system enforced pre-commit | Prevention | 4 | All type interactions in covered code |

**Gap condition**: Expensive at any scale where more than one system depends on the changed interface. Eliminated entirely within scope by level-4 investment.

---

### Work type: Adding new behavior

*Writing code that adds new functionality: new features, new services, new integrations. The existing codebase grows.*

Total vigilance cost = throughput × (logic error cost + testability reduction cost + design contamination cost)

Note: structural/type errors also apply here — same assurance options as above.

#### Error class: Logic errors

**Body at risk**: The new code paths and every existing behavior sharing state or control flow with them.

**Rate**: Every new code addition introduces potential logic errors; rate scales with throughput.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human code review | Human review | 1 | Whatever reviewer noticed |
| Unit tests (ad hoc) | Deterministic detection | 3 | Tested behaviors; no coverage guarantee |
| Unit tests (recipe-based) | Deterministic detection | 3 | Recipe-defined coverage; predictable gaps |
| Property-based tests / mutation testing | Deterministic detection | 3 | Structural properties |
| Theorem provers | Prevention | 4 | Formally specified invariants only |

No general level-5 mechanism. Ceiling is level 4 for formally-specified properties, level 3 for test-covered behaviors.

**Gap condition**: Expensive when throughput is high or new behavior interacts with a large existing body. Recipe-based tests move the gap to predictable known-class misses.

---

#### Error class: Testability reduction

**Body at risk**: Future test effort for the entire module. Untestable code accumulates; each addition weakens the overall test suite.

**Rate**: Continuous; every code addition has a testability dimension.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review for testability | Human review | 1 | Whatever reviewer noticed |
| Hexagonal architecture enforcement | Deterministic detection | 3 | Dependency direction rules |
| Testability workflow gate | Prevention | 4 | All code through the gate |

Key: AI defaults to mock-based coupling and will not reach for Nullables, Simulators, or Hexagonal ports unless the orchestration layer injects these patterns into context on every invocation.

**Gap condition**: Cumulative; individually small but compounding. Expensive when a large fraction of the codebase lacks clean test seams. The cost becomes visible only after it is severe.

---

#### Error class: Design contamination

**Body at risk**: Architectural coherence of the affected module and its dependents.

Same as design regression under evolving the design. Same assurance options apply.

---

### Work type: Writing tests

*Creating unit and integration tests that verify behavior. The test suite is itself part of the existing product body.*

Total vigilance cost = test volume × (wrong structure cost + coverage gap cost + environment coupling cost)

#### Error class: Wrong test structure

**Body at risk**: Utility of the test suite over time. Poorly structured tests don't verify what they appear to, require excessive maintenance, and obscure failures.

**Rate**: Every test written. Cumulative.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review of tests | Human review | 1 | Whatever reviewer noticed |
| Test recipe documentation | Human review | 1 | Written; discipline-based; decays |
| Recipe compliance tool | Prevention | 4 | All structural compliance rules |

Key: AI writes mocks where Nullables apply, misses business-level assertions, leaves snapshot output as raw JSON. These defaults produce test suites that grow in line count but decay in assurance quality. The recipe compliance tool gates all test output against structural rules before commit — AI cannot produce structurally non-compliant tests if the workflow blocks them.

**Gap condition**: Expensive when AI writes tests at high volume. Without the recipe tool, the test suite degrades in utility even as it appears to grow.

---

#### Error class: Coverage gaps

**Body at risk**: All untested behaviors in the existing codebase. Each gap is a silent assurance hole that grows as the product grows.

**Rate**: Cumulative; each test either addresses a gap or doesn't.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Coverage scanners (line/branch) | Non-deterministic guardian | 2 | Statistical; misses behavior coverage |
| Session-based exploratory testing | Non-deterministic guardian | 2 | Human-driven; finds novel classes |
| Coverage guardian (AI scans + abstracts gaps) | Non-deterministic guardian | 2 | Broader than line coverage; unpredictable |
| Coverage recipes (encodes known blind spots) | Deterministic detection | 3 | Recipe-enumerated categories |

No level-4 mechanism in the general case. Level 2 discovery bootstraps to level 3 over time.

**Gap condition**: Expensive when the codebase is large and coverage is thin. Gap cost grows with codebase size even at constant throughput — each test added addresses a shrinking fraction of the total gap.

---

#### Error class: Environment coupling (integration tests)

**Body at risk**: Test reliability across all environments. Coupled tests produce false failures (alarm fatigue) or false passes (missed defects).

**Rate**: Each integration test written. Cumulative.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Contract testing tool | Deterministic detection | 3 | Specified contracts only |
| In-process infrastructure (Simulators, Testcontainers) | Prevention | 4 | Environment coupling within scope |

AI defaults to external dependencies; will not reach for in-process infrastructure without explicit orchestration guidance.

**Gap condition**: Expensive as the integration test suite grows. Flaky tests burn vigilance on false alarms and erode trust in all tests.

---

## Domain: System Design

### Work type: Making architectural decisions

*Choosing how the system is structured: module boundaries, data flow, service boundaries, technology choices.*

Total vigilance cost = decision frequency × impact-per-decision × (inconsistency cost + drift accumulation rate)

#### Error class: Decision inconsistency

**Body at risk**: Architectural coherence of the system as a whole. Each inconsistent decision makes the next one harder to get right.

**Rate**: Low per decision; high long-term impact. Decisions compound.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Tribal knowledge | Human review | 1 | Whatever team remembers |
| Architecture Decision Records (ADRs) | Non-deterministic guardian | 2 | Written; requires active reference |
| ADR review in planning workflow | Deterministic detection | 3 | All decisions in planning scope |
| Planning tool requiring ADR reference | Prevention | 4 | All decisions via the tool |

**Gap condition**: Expensive as system complexity and team size grow. Tribal knowledge degrades as teams change; ADRs decay without a review process.

---

#### Error class: Architectural drift

**Body at risk**: The entire codebase diverges from architectural intent over time.

**Rate**: Continuous; drift accumulates with every change that is not checked against intent.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Ad hoc review | Human review | 1 | Occasional; decays fast |
| AI drift guardian (scans + abstracts) | Non-deterministic guardian | 2 | Broader than rules; unpredictable |
| Architecture linters | Deterministic detection | 3 | Configured rule set |
| Drift → ADR pipeline | Bootstrapped to 3 | Systematic improvement |

**Gap condition**: Expensive in any codebase with sustained throughput. Drift accumulates multiplicatively — each instance makes future drift more likely and harder to detect.

---

## Domain: Planning

### Work type: Planning and scoping work

*Defining goals, decomposing into tasks, setting success criteria, and prioritizing.*

Total vigilance cost = planning frequency × (ungrounded goals cost + decomposition gaps cost + missing criteria cost + priority error cost)

#### Error class: Ungrounded goals

**Body at risk**: All work done on unvalidated goals. Wasted effort scales with work rate × goal size.

**Rate**: Per planning cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Planning discipline | Human review | 1 | Individual; decays |
| Planning tool requiring grounding source | Prevention | 4 | All goals made via the tool |

**Gap condition**: Expensive when planning cycles are frequent and goals are large. AI-generated goals look plausible but are not grounded in evidence.

---

#### Error class: Decomposition gaps

**Body at risk**: All work that flows from a poorly decomposed item. Hidden unknowns surface as surprises.

**Rate**: Per decomposition cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human judgment | Human review | 1 | Individual skill; decays |
| Planning tool with required fields (variation points, unknowns, dependencies) | Prevention | 4 | All decompositions via the tool |

**Gap condition**: Expensive when decomposition complexity is high. Structural gaps produce systemic downstream surprises.

---

#### Error class: Missing or wrong success criteria

**Body at risk**: All evaluation done against wrong criteria. A criteria error corrupts every downstream evaluation that uses it.

**Rate**: Per planning cycle; systemic in impact.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Planning discipline | Human review | 1 | — |
| Stakeholder review of criteria before work starts | Deterministic detection | 3 | Reviewed criteria |
| Planning tool requiring criteria fields | Prevention | 4 | All work with criteria via the tool |

**Gap condition**: Systemic — even at low planning frequency, criteria errors are high-cost because every evaluation inherits the error.

---

#### Error class: Priority errors

**Body at risk**: Opportunity cost of all work done on wrong-priority items.

**Rate**: Per selection cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human judgment | Human review | 1 | Situation-dependent |
| Explicit scoring criteria | Deterministic detection | 3 | Scored dimensions only |
| Deterministic queue (rule-based) | Prevention | 4 | All tasks through the queue |

**Gap condition**: Expensive when the backlog is large and throughput is high. Wrong priorities consume capacity that cannot be recovered.

---

### Work type: Grounding in reality

*Connecting the product to actual user needs and outcomes. Validating that what was built achieves its intended effect.*

#### Error class: Reality disconnect

**Body at risk**: Accumulated work that diverges from user needs. Grows with throughput × time without grounding.

**Rate**: Continuous; drift accumulates between grounding events.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Regular demos / user review | Human review | 1 | What participants noticed |
| Metrics / telemetry | Deterministic detection | 3 | Measured behaviors only |
| A/B testing infrastructure | Deterministic detection | 3 | Tested variants |
| Outcome-based planning with measurement gates | Prevention | 4 | All work with defined outcome gates |

**Gap condition**: Expensive when autonomous work rate is high and grounding events are infrequent. Drift compounds; recovery cost grows with time-since-last-grounding.

---

## Domain: Evaluation and Oversight

*These responsibilities are themselves assurance mechanisms. The question is what level they operate at and what investments move them higher.*

### Work type: Evaluating outputs

*Determining whether a specific output meets its success criteria.*

#### Error class: Bad output accepted

**Body at risk**: Whatever the bad output corrupts downstream. Propagation depends on what the output feeds.

**Rate**: Per output produced; scales with throughput.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review of output | Human review | 1 | Whatever human noticed |
| LLM-as-judge (single run) | Non-deterministic guardian | 2 | Probabilistic; may share AI biases |
| LLM-as-judge (multi-run, adversarial) | Non-deterministic guardian | 2→3 | Improves with adversarial variation |
| Automated eval against defined criteria | Deterministic detection | 3 | Criteria-covered behaviors |
| Criteria coverage tool | Prevention | 4 | All criteria through the tool |

**Gap condition**: Expensive at high throughput. Human review cannot scale with AI output rate.

---

### Work type: Monitoring system health

*Detecting drift, degradation, and anomalies before they cause visible failure.*

#### Error class: Drift not detected

**Body at risk**: Accumulated drift × time-to-detection. Longer undetected drift means more work to reverse.

**Rate**: Continuous; drift accumulates without active detection.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human situational awareness | Human review | 1 | What team notices |
| AI drift guardian (scans + abstracts anomalies) | Non-deterministic guardian | 2 | Broader; probabilistic |
| Metrics + alerts | Deterministic detection | 3 | Measured metrics only |
| Drift → deterministic check pipeline | Bootstrapped to 3 | Systematic improvement |

**Gap condition**: Expensive when the system operates with long feedback loops. In autonomous systems, drift can accumulate for many cycles before becoming visible.

---

### Work type: Overseeing development steps and cycles

*Reviewing individual steps, iteration cycles, and overall flow for correctness and health.*

#### Error class: Bad step or cycle accepted

**Body at risk**: Everything built on top of the bad step. Error propagates forward in time.

**Rate**: Per step or cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human reads every step | Human review | 1 | Whatever human noticed; decays with throughput |
| Automated health check at step/cycle boundary | Deterministic detection | 3 | What health check covers |
| Deterministic pass/fail gate per step | Prevention | 4 | All work through the gate |

**Gap condition**: Expensive when step volume exceeds human review capacity. At high throughput, deterministic gates are the only sustainable path.

---

### Work type: Making escalation decisions

*Deciding whether work should continue, stop, or involve a human.*

#### Error class: Work continues past safe boundary

**Body at risk**: All work done past the point where intervention was needed.

**Rate**: Per autonomous decision point.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human checks in | Human review | 1 | Depends on attention |
| Agent detects uncertainty and flags | Non-deterministic guardian | 2 | Probabilistic; misses confident-but-wrong |
| Deterministic halt conditions (circuit breakers) | Prevention | 4 | All conditions in the rule set |

**Gap condition**: Even one uncaught escalation event can produce large damage. Probabilistic detection alone is insufficient — deterministic halt conditions are required as the primary mechanism.

---

## Domain: Operations

### Work type: Deploying and operating infrastructure

*Shipping code to production and maintaining the operational environment.*

Total vigilance cost = deployment frequency × (failure cost + drift cost)

#### Error class: Deployment failure

**Body at risk**: Affected service and users during the failure period.

**Rate**: Per deployment.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Manual deployment with review | Human review | 1 | Whatever human checked |
| CI/CD pipeline | Deterministic detection | 3 | What pipeline checks |
| Idempotent declarative deployments | Prevention | 4 | All deployments through the system |

---

#### Error class: Configuration drift

**Body at risk**: Reliability and reproducibility of all environments.

**Rate**: Continuous; environments drift without active prevention.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Manual audits | Human review | 1 | Occasional |
| Infrastructure as Code | Deterministic detection | 3 | Declared infrastructure |
| Immutable infrastructure | Prevention | 4 | All infrastructure through IaC system |

**Gap condition**: Expensive as scale and deployment frequency grow. Configuration drift in large environments is a classic maintenance trap independent of AI agency.

---

## Domain: Process Governance

### Work type: Designing and enforcing process

*Defining how development work flows: commit policies, review processes, workflow rules.*

#### Error class: Process not followed

**Body at risk**: Every work product that bypasses process controls.

**Rate**: Continuous; process discipline decays without enforcement.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Process documentation + peer review | Human review | 1 | Discipline-based; decays |
| CI/CD gates enforcing process rules | Deterministic detection | 3 | What CI checks cover |
| Deterministic workflow orchestration (process IS the code) | Prevention | 4 | All work through the workflow |

**Gap condition**: Expensive as team size and throughput increase. Process enforcement cannot rely on discipline at scale.

---

### Work type: Defining and enforcing boundaries

*Deciding what the AI is authorized to do and ensuring it stays within that scope.*

#### Error class: AI acts outside delegated scope

**Body at risk**: Everything the AI touches outside its authorized scope.

**Rate**: Per autonomous action in an insufficiently bounded system.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Written boundary documentation | Human review | 1 | Requires AI to read and follow |
| Tooling restrictions (file-type, read-only access) | Prevention | 4 | All operations the tools allow |
| Workflow enforcement of boundary | Prevention | 4 | All work through the workflow |

**Gap condition**: Expensive at any level of autonomous agency. Documentation-only boundaries are level 1; tooling enforcement is level 4. There is no level 2–3 in between — either the tools enforce it or they don't.

---

## Summary: Total Vigilance Cost Profile

For each work type, total vigilance cost = rate × Σ(body at risk × assurance deficit per error class).

The table below shows the error classes with highest potential cost per instance and the minimum viable assurance level to avoid unsustainable toil in a brownfield codebase:

| Work type | Highest-cost error class | Why costly | Minimum viable | Target |
|-----------|-------------------------|-----------|----------------|--------|
| Evolving the design | Accidental behavior change | Systemic scope; continuous rate | Level 3 (tests) | Level 5 (AST tools) |
| Adding new behavior | Logic errors | Scales with throughput | Level 3 (recipe tests) | Level 3 |
| Adding new behavior | Testability reduction | Cumulative; invisible until severe | Level 3 (hex arch) | Level 4 (gate) |
| Writing tests | Wrong structure | Degrades suite utility at volume | Level 4 (recipe tool) | Level 4 |
| Writing tests | Coverage gaps | Body grows with codebase | Level 2 (scanner) | Level 3 (recipe bootstrap) |
| Architectural decisions | Decision inconsistency | Systemic; compounds over time | Level 2 (ADRs) | Level 4 (planning tool) |
| Architectural decisions | Drift | Continuous accumulation | Level 2 (guardian) | Level 3 (linters) |
| Planning | Ungrounded goals | Multiplies all downstream work | Level 4 (planning tool) | Level 4 |
| Planning | Missing criteria | Systemic; corrupts all evaluation | Level 3 (stakeholder review) | Level 4 |
| Grounding | Reality disconnect | Grows with autonomous throughput | Level 3 (metrics) | Level 4 (outcome gates) |
| Evaluating outputs | Bad output accepted | Scales with AI throughput | Level 2 (LLM judge) | Level 3 (eval framework) |
| Oversight | Bad step accepted | Forward propagation | Level 3 (health check) | Level 4 (gate) |
| Escalation | Wrong continue/stop | Even one failure is high-cost | Level 4 (circuit breakers) | Level 4 |
| Deploying | Configuration drift | Classic maintenance trap | Level 3 (IaC) | Level 4 (immutable) |
| Process | Process not followed | Decays with scale | Level 3 (CI gates) | Level 4 (workflow code) |
| Boundaries | AI outside scope | Unpredictable at any agency level | Level 4 (tooling) | Level 4 |
