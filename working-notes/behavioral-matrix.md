# Behavioral Matrix — Product Facets and Assurance Dimension

*Draft v3 — reorganized around product facets.*

Purpose: map all types of product work to their vigilance requirements. Organized by what facet is being improved, since improving one facet always risks degrading others.

---

## How to Read This Document

**Body at risk**: the scope of existing product that a single instance of an error can corrupt. Measured as: what must be examined, fixed, or protected in response to discovering one such error? This is the "existing body of work" in the toil formula. It is determined by the error class, not the vigilance mechanism.

Vigilance mechanism quality (coverage adequacy, test duplication, test structure) affects the **effective assurance level** provided by that mechanism, not the body at risk. Coverage gaps reduce the effective level of a test suite; they do not create a new error class with their own body at risk.

**Total vigilance cost for a work type** = rate × Σ(body at risk × assurance deficit per error class)

Error classes within a work type have independent costs that sum. Addressing one does not reduce the cost of another.

**Tests are vigilance mechanisms, not work types.** They appear as assurance options within error class tables. Their quality (structure, coverage adequacy, duplication level, environment coupling) determines the effective assurance level they provide.

**Product facets**: the properties of the product that work can improve or degrade. Improving one facet always risks degrading others in the code being touched, and degrading the same facet in other parts of the code. Error classes are many-to-many: the same error class (e.g., capability regression) appears in multiple work types because the same thing can go wrong regardless of what you were trying to improve.

**Reversibility**: many error classes have a cost that depends not just on whether an error occurs but on how hard it is to correct. Investments that make errors easier to undo reduce required vigilance even without preventing the error. These appear as a subsection within relevant error classes.

---

## Domain: Product Work

The product has seven facets. Work that improves one facet must be vigilant about degrading any other facet in the code it touches, and about degrading the same facet in other parts of the code.

**Facets:**
- **Capability**: does the product do what it is supposed to do? (correctness, functionality)
- **Extensibility**: can it be changed and extended without unintended side effects? (design quality, testability, reversibility)
- **Explainability**: can humans understand what it does and why? (code clarity, naming, readability)
- **Abstractability**: can it be reasoned about at higher levels? (abstraction quality, conceptual integrity)
- **Transparency**: is its behavior visible and auditable? (observability, logging, traceability)
- **Consistency**: does it behave consistently and predictably? (API alignment, pattern adherence, structural integrity)
- **Security**: is it safe from malicious use and data breaches?

---

### Work type: Improving capability

*Adding new behavior, fixing defects, implementing requirements. The thing being improved: what the product does.*

Total vigilance cost = throughput × (capability regression cost + extensibility reduction cost + consistency violation cost)

---

#### Error class: Capability regression in existing code

**Body at risk**: all code, tests, and systems that depend on the behavior that was accidentally broken. Narrow for leaf components; systemic for widely-used utilities.

@ai: body at risk is also the set of all customers. They might be depending on the behavior that was accidentally broken.

**Rate**: one opportunity per change to shared code.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human code review | Human review | 1 | Whatever reviewer noticed |
| Unit tests (ad hoc) | Deterministic detection | 3 | Tested behaviors; effective level drops with coverage gaps |
| Unit tests (recipe-based, comprehensive coverage) | Deterministic detection | 3 | Recipe-defined coverage; predictable gaps remain |
| AI exploratory testing (generates edge-case tests after change) | Non-deterministic guardian | 2 | Probabilistic; finds novel cases; bootstraps to level 3 |
| AI change-impact analysis (identifies untested behaviors, invariants, negative cases) | Non-deterministic guardian | 2 | Probabilistic; targets specific change surface |
| Property-based / mutation testing | Deterministic detection | 3 | Structural properties |
| Theorem provers | Prevention | 4 | Formally specified invariants only |

No general level-5 mechanism for logic correctness.

**Reversibility**: feature flags and canary deployments make capability additions reversible. When a regression can be rolled back in minutes, the required vigilance per capability change is lower — you can deploy-and-observe rather than fully prevent.

**Gap condition**: expensive in any codebase where components have more than a few callers. Cost grows with codebase size. At any sustained change rate in a large brownfield codebase, assurance level 0–1 produces unsustainable toil.

---

#### Error class: Extensibility reduction in touched code

**Body at risk**: future change effort for the entire module × number of future changes needed. Untestable or poorly designed code accumulates; each addition weakens the overall ability to change the system.

**Rate**: cumulative; every code addition has an extensibility dimension.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review for design quality | Human review | 1 | Whatever reviewer noticed |
| Nullables pattern enforcement | Deterministic detection | 3 | Dependency inversion compliance |
| Hexagonal architecture enforcement | Deterministic detection | 3 | Port/adapter compliance |
| Test recipe workflow (injected at test-write time, scaffolds correct structure before you write anything) | Guided correctness | 5 | Tests written using the recipe |
| Functional architecture style (pure functions, explicit state separation) | Guided correctness | 5 | Code written in functional style |
| Nullables template (formalized, auto-generated alongside each new class) | Guided correctness | 5 | Classes using the template |

Level-5 explanation: when the correct pattern is the default starting point — a scaffold, a template, a recipe presented at the moment of creation — careless implementors land in the correct structure without trying. For humans, this requires tooling that generates the scaffold. For AI, injecting the pattern into context at invocation achieves the same effect.

Key: AI defaults to mock-based coupling and will not reach for Nullables, Simulators, or Hexagonal ports unless the orchestration layer injects these patterns on every invocation.

**Reversibility**: refactoring tools make design choices easy to undo. If an AI chose the wrong abstraction, the refactoring tool makes re-choosing cheap — reducing the vigilance required per design decision.

**Gap condition**: cumulative; individually small but compounding. Expensive when a large fraction of the codebase lacks clean test seams. The cost becomes visible only after it is severe.

---

#### Error class: Consistency violation in touched code

**Body at risk**: cognitive load for all future developers and AI that reads this code; adherence to established patterns across the codebase.

**Rate**: per change to an API, naming convention, or established pattern.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Code style review | Human review | 1 | Whatever reviewer noticed |
| Linters | Deterministic detection | 3 | Configured style/structural rules |
| Architecture linters | Deterministic detection | 3 | Configured structural rules |
| Planning tool requiring pattern reference | Prevention | 4 | All decisions via the tool |

**Gap condition**: less directly costly than capability regression but cumulative. Expensive as codebase size grows.

---

### Work type: Improving extensibility

*Refactoring, restructuring, improving design, extracting abstractions. The thing being improved: how easily the product can change.*

Total vigilance cost = frequency × (capability regression cost + extensibility regression cost + consistency violation cost + vigilance mechanism extensibility cost)

---

#### Error class: Capability regression (accidental behavior change)

**Body at risk**: every test and downstream system depending on the behavior of the changed component. Narrow for leaf components; systemic for widely-used utilities.

**Rate**: one opportunity per structural change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review of diff | Human review | 1 | Whatever reviewer noticed |
| Test suite run after refactoring | Deterministic detection | 3 | Tested behaviors only |
| AST-based refactoring tools only | Guided correctness | 5 | All structural refactoring operations |

**Reversibility**: AST refactoring tools make behavior-safe changes the easy path AND make each step easily reversible. If a structural change turns out to be wrong, the tool makes un-doing it equally cheap. Level 5 provides both zero vigilance for execution correctness and high reversibility for design correctness.

**Gap condition**: expensive in any codebase where components have more than a few callers. In a large brownfield codebase at any sustained refactoring rate, level 0–1 produces unsustainable toil.

---

#### Error class: Extensibility regression in other areas (design regression)

**Body at risk**: architectural coherence of related modules. Cascades if the wrong abstraction sets a precedent.

**Rate**: occurs with every structural change; cost varies by centrality of the changed abstraction.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review for design quality | Human review | 1 | Whatever reviewer noticed |
| AI design critique fork (adversarial, independent) | Non-deterministic guardian | 2 | Probabilistic; finds common pattern violations |
| Architecture linters (dependency rules) | Deterministic detection | 3 | Configured structural rules |

No known level-4 mechanism for design quality in the general case. Human judgment remains essential here.

**Reversibility**: this is the primary justification for AST refactoring tooling beyond behavioral safety. When any design choice can be undone in two commands, the vigilance required per design decision is much lower — wrong abstractions are cheap mistakes rather than expensive ones. A good refactoring tool makes it safe to be wrong about design, which dramatically reduces the vigilance cost of every design decision.

**Gap condition**: less multiplicative than behavior change — regressions accumulate rather than propagate automatically. Expensive when throughput is high and no design review process exists.

---

#### Error class: Consistency violation (structural breakage)

*Distinction from capability regression: behavior change = the code does something different. Structural breakage = the code's interface or type contract changed and dependents were not updated. Behavior can change without structural breakage (logic error); structure can break without behavior change (rename without full propagation). Refactoring tools address both, as long as all dependents are within the tool's scope.*

**Body at risk**: all consumers of the changed interface or structure. Systemic for widely-used types or interfaces.

**Rate**: one opportunity per interface or type change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Linter rules | Deterministic detection | 3 | Configured rules only |
| Strict type system enforced pre-commit | Prevention | 4 | All type interactions in covered code |
| AST refactoring tools (rename/move with full dependency awareness) | Guided correctness | 5 | All dependents within tool scope |

**Gap condition**: expensive at any scale where more than one system depends on the changed interface. Eliminated within scope by type system (level 4) or AST tooling (level 5).

---

#### Error class: Extensibility reduction in vigilance mechanisms (test duplication)

**Body at risk**: future change effort whenever associated code is modified. Each test that duplicates code setup, uses mocks (which mirror the production interface), or fails alongside sibling tests adds to this body. When code changes, all these tests must change too.

**Rate**: cumulative; each test written with duplication adds to the body.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human review of test quality | Human review | 1 | Whatever reviewer noticed |
| Nullables pattern (eliminates mocks — the largest source of test duplication) | Deterministic detection | 3 | Tests using Nullables |
| Test recipe tool (prevents structural duplication in new tests) | Prevention | 4 | All tests through the tool |
| Test recipe workflow injected at write time | Guided correctness | 5 | Tests written with the workflow |

Test duplication is a larger extensibility cost than coverage gaps: failing-together tests and mock-heavy setups make every future code change expensive in test maintenance cost.

**Gap condition**: expensive at high test volume. Grows silently alongside the test suite.

---

### Work type: Improving explainability

*Renaming, clarifying, restructuring for readability, writing inline documentation. The thing being improved: human and AI comprehension of the code.*

Total vigilance cost = frequency × (capability regression cost + consistency violation cost)

---

#### Error class: Capability regression (renames that change behavior)

Rare but real: renaming a function called via string reflection, or a symbol with unusual semantics. Same assurance options as capability regression under improving capability. AST refactoring tools with rename awareness eliminate this class within tool scope (level 5).

---

#### Error class: Consistency violation (partial rename — some callsites updated, others not)

**Body at risk**: all callsites still using the old name. Systemic for widely-used symbols.

**Rate**: one opportunity per rename or concept change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human search-and-replace | Human review | 1 | Whatever human searched for |
| Strict type system (catches callsite mismatches at compile time) | Prevention | 4 | All typed callsites |
| AST refactoring tool (rename-aware, finds all callsites) | Guided correctness | 5 | All callsites within tool scope |

**Gap condition**: expensive when the renamed symbol is widely used. Eliminated within scope by type system or AST tooling.

---

### Work type: Improving transparency

*Adding logging, instrumentation, tracing, observability.*

Total vigilance cost = frequency × (capability regression cost + security violation cost)

Capability regression: same as above. Security violation:

#### Error class: Security violation (logs expose sensitive data)

**Body at risk**: all users whose sensitive data is exposed per instance.

**Rate**: per observability addition touching sensitive data.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Code review for data classification | Human review | 1 | Whatever reviewer noticed |
| Automated PII detection in log output | Deterministic detection | 3 | Detected PII patterns |
| Structured logging with field-level classification enforcement | Prevention | 4 | All fields through the logger |

---

### Work type: Improving consistency

*Standardizing patterns, aligning APIs, enforcing conventions.*

Total vigilance cost = frequency × (capability regression cost + extensibility reduction cost)

Capability regression: same as above. Extensibility reduction: over-standardizing removes useful variation; level 1 only in general case. Same assurance options as extensibility reduction above.

---

### Work type: Improving security

*Adding authentication, authorization, input sanitization, access controls.*

Total vigilance cost = frequency × (capability regression cost + security regression cost)

Capability regression: same as above.

#### Error class: Security regression (new security code introduces vulnerability)

**Body at risk**: all users and data accessible through the vulnerability.

**Rate**: per security addition or change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Security code review | Human review | 1 | Whatever reviewer noticed |
| Automated security scanning (SAST) | Deterministic detection | 3 | Known vulnerability patterns |
| Formal security models (threat modeling + verification) | Prevention | 4 | Modeled threat classes |

---

## Domain: System Design

### Work type: Making architectural decisions

*Choosing how the system is structured: module boundaries, data flow, service boundaries, technology choices.*

Total vigilance cost = decision frequency × impact-per-decision × (inconsistency cost + drift cost)

#### Error class: Decision inconsistency

**Body at risk**: architectural coherence of the system as a whole.

**Rate**: low per decision; high long-term impact. Decisions compound.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Tribal knowledge | Human review | 1 | Whatever team remembers |
| Architecture Decision Records (ADRs) | Non-deterministic guardian | 2 | Written; requires active reference |
| ADR review in planning workflow | Deterministic detection | 3 | All decisions in planning scope |
| Planning tool requiring ADR reference | Prevention | 4 | All decisions via the tool |

**Reversibility**: modular architecture with clean seams makes architectural decisions easier to reverse. Small architectural experiments (prove it before committing the full codebase) reduce vigilance per decision.

**Gap condition**: expensive as system complexity and team size grow.

---

#### Error class: Architectural drift

**Body at risk**: the entire codebase as it diverges from architectural intent.

**Rate**: continuous; drift accumulates with every change not checked against intent.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Ad hoc review | Human review | 1 | Occasional; decays fast |
| AI drift guardian (scans + abstracts) | Non-deterministic guardian | 2 | Broader than rules; unpredictable |
| Architecture linters | Deterministic detection | 3 | Configured rule set |
| Drift → ADR pipeline | Bootstrapped to 3 | Systematic improvement |

**Gap condition**: expensive in any codebase with sustained throughput.

---

## Domain: Planning

### Work type: Planning and scoping work

*Defining goals, decomposing into tasks, setting success criteria, and prioritizing.*

Total vigilance cost = planning frequency × (ungrounded goals cost + decomposition gaps cost + missing criteria cost + priority error cost)

#### Error class: Ungrounded goals

**Body at risk**: all work done on unvalidated goals. Scales with work rate × goal size.

**Rate**: per planning cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Planning discipline | Human review | 1 | Individual; decays |
| Planning tool requiring grounding source | Prevention | 4 | All goals made via the tool |

**Reversibility**: short iterations make goal errors cheap to correct. Small batch sizes limit work done before a wrong goal is discovered.

**Gap condition**: expensive when planning cycles are frequent and goals are large.

---

#### Error class: Decomposition gaps

**Body at risk**: all work that flows from a poorly decomposed item. Hidden unknowns surface as surprises downstream.

**Rate**: per decomposition cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human judgment | Human review | 1 | Individual skill; decays |
| Planning tool with required fields (variation points, unknowns, dependencies) | Prevention | 4 | All decompositions via the tool |

**Gap condition**: expensive when decomposition complexity is high.

---

#### Error class: Missing or wrong success criteria

**Body at risk**: all evaluation done against wrong criteria. One criteria error corrupts every downstream evaluation that uses it.

**Rate**: per planning cycle; systemic in impact.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Planning discipline | Human review | 1 | — |
| Stakeholder review before work starts | Deterministic detection | 3 | Reviewed criteria |
| Planning tool requiring criteria fields | Prevention | 4 | All work with criteria via the tool |

**Gap condition**: systemic — even at low planning frequency, criteria errors are high-cost.

---

#### Error class: Priority errors

**Body at risk**: opportunity cost of all work done on wrong-priority items.

**Rate**: per selection cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Human judgment | Human review | 1 | Situation-dependent |
| Explicit scoring criteria | Deterministic detection | 3 | Scored dimensions only |
| Deterministic queue (rule-based) | Prevention | 4 | All tasks through the queue |

**Reversibility**: small batch sizes. Smaller work units mean a wrong priority is discovered and corrected sooner.

---

### Work type: Grounding in reality

*Connecting the product to actual user needs and outcomes.*

#### Error class: Reality disconnect

**Body at risk**: accumulated work that diverges from user needs. Grows with throughput × time without grounding.

**Rate**: continuous; drift accumulates between grounding events.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Regular demos / user review | Human review | 1 | What participants noticed |
| Metrics / telemetry | Deterministic detection | 3 | Measured behaviors only |
| A/B testing infrastructure | Deterministic detection | 3 | Tested variants |
| Outcome-based planning with measurement gates | Prevention | 4 | All work with defined outcome gates |

**Reversibility**: feature flags, A/B infrastructure, and modular deployment make it cheap to roll back or pivot when reality disconnect is discovered.

**Gap condition**: expensive when autonomous work rate is high and grounding events are infrequent.

---

## Domain: Evaluation and Oversight

*These responsibilities are themselves assurance mechanisms. The question is what level they operate at.*

### Work type: Evaluating outputs

#### Error class: Bad output accepted

**Body at risk**: whatever the bad output corrupts downstream.

**Rate**: per output produced; scales with throughput.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review | Human review | 1 | Whatever human noticed |
| LLM-as-judge (single run) | Non-deterministic guardian | 2 | Probabilistic; may share AI biases |
| LLM-as-judge (multi-run, adversarial) | Non-deterministic guardian | 2→3 | Improves with adversarial variation |
| Automated eval against defined criteria | Deterministic detection | 3 | Criteria-covered behaviors |
| Criteria coverage tool | Prevention | 4 | All criteria through the tool |

**Gap condition**: expensive at high throughput. Human review cannot scale with AI output rate.

---

### Work type: Monitoring system health

#### Error class: Drift not detected

**Body at risk**: accumulated drift × time-to-detection.

**Rate**: continuous.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human situational awareness | Human review | 1 | What team notices |
| AI drift guardian | Non-deterministic guardian | 2 | Broader; probabilistic |
| Metrics + alerts | Deterministic detection | 3 | Measured metrics only |
| Drift → deterministic check pipeline | Bootstrapped to 3 | Systematic improvement |

---

### Work type: Overseeing development steps and cycles

#### Error class: Bad step or cycle accepted

**Body at risk**: everything built on top of the bad step. Error propagates forward in time.

**Rate**: per step or cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human reads every step | Human review | 1 | Decays with throughput |
| Automated health check at boundary | Deterministic detection | 3 | What health check covers |
| Deterministic pass/fail gate per step | Prevention | 4 | All work through the gate |

---

### Work type: Making escalation decisions

#### Error class: Work continues past safe boundary

**Body at risk**: all work done past the point where intervention was needed.

**Rate**: per autonomous decision point.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human checks in | Human review | 1 | Depends on attention |
| Agent detects uncertainty and flags | Non-deterministic guardian | 2 | Misses confident-but-wrong |
| Deterministic halt conditions (circuit breakers) | Prevention | 4 | All conditions in the rule set |

**Gap condition**: even one uncaught event can be high-cost. Probabilistic detection alone is insufficient as the only mechanism.

---

## Domain: Operations

### Work type: Deploying and operating infrastructure

#### Error class: Deployment failure

**Body at risk**: affected service and users during the failure period.

**Rate**: per deployment.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Manual deployment with review | Human review | 1 | Whatever human checked |
| CI/CD pipeline | Deterministic detection | 3 | What pipeline checks |
| Idempotent declarative deployments | Prevention | 4 | All deployments through the system |

**Reversibility**: blue-green deployments and automated rollback make failures cheap to recover from.

---

#### Error class: Configuration drift

**Body at risk**: reliability and reproducibility of all environments.

**Rate**: continuous; environments drift without active prevention.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | — | 0 | — |
| Manual audits | Human review | 1 | Occasional |
| Infrastructure as Code | Deterministic detection | 3 | Declared infrastructure |
| Immutable infrastructure | Prevention | 4 | All infrastructure through IaC system |

**Gap condition**: expensive as scale and deployment frequency grow.

---

## Domain: Process Governance

### Work type: Designing and enforcing process

#### Error class: Process not followed

**Body at risk**: every work product that bypasses process controls.

**Rate**: continuous; process discipline decays without enforcement.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Process documentation + peer review | Human review | 1 | Discipline-based; decays |
| CI/CD gates | Deterministic detection | 3 | What CI checks cover |
| Deterministic workflow orchestration | Prevention | 4 | All work through the workflow |

---

### Work type: Defining and enforcing boundaries

#### Error class: AI acts outside delegated scope

**Body at risk**: everything the AI touches outside its authorized scope.

**Rate**: per autonomous action in an insufficiently bounded system.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Written boundary documentation | Human review | 1 | Requires AI to read and follow |
| Tooling restrictions (file-type, read-only access) | Prevention | 4 | All operations the tools allow |
| Workflow enforcement of boundary | Prevention | 4 | All work through the workflow |

**Gap condition**: no level 2–3 intermediate exists here — either the tools enforce it or they don't.

---

## Open Question for Arlo

@human: **Coverage gaps and body at risk.** I removed "coverage gaps" as a standalone error class. My reasoning: a coverage gap is a reduced effective assurance level, not an error with its own body at risk. The body at risk belongs to whatever error the gap fails to catch. Coverage quality now appears as an effective-level qualifier on assurance options (e.g., "recipe-based tests with comprehensive coverage: effective level 3; ad hoc tests with thin coverage: effective level 2"). Does this framing work, or is there a body-at-risk concept for gaps that I'm not seeing?

---

## Summary: Total Vigilance Cost Profile

| Work type | Most costly error class | Why costly | Minimum viable | Target |
|-----------|------------------------|-----------|----------------|--------|
| Improving capability | Capability regression | Systemic scope; scales with throughput | Level 3 (recipe tests) | Level 3 |
| Improving capability | Extensibility reduction | Cumulative; invisible until severe | Level 3 (Nullables/hex arch) | Level 5 (template/recipe workflow) |
| Improving extensibility | Capability regression (behavior change) | Systemic scope; continuous rate | Level 3 (tests) | Level 5 (AST tools) |
| Improving extensibility | Extensibility regression (design) | Accumulates; compounds | Level 2 (critique fork) + reversibility | Level 3 (linters) + reversibility |
| Improving extensibility | Test duplication | Scales with test volume | Level 3 (Nullables) | Level 5 (recipe workflow) |
| Improving explainability | Consistency violation (partial rename) | Systemic when symbol is wide | Level 4 (type system) | Level 5 (AST tools) |
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
