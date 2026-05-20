# Behavioral Matrix — Product Facets and Assurance Dimension

*Draft v4 — verb-phrase work types, business value per facet, Adaptability replaces Extensibility, Consistency reframed to user-facing behavioral expectations.*

Purpose: map all types of product work to their vigilance requirements. Organized by what facet is being improved, since improving one facet always risks degrading others.

---

## How to Read This Document

**Body at risk**: the scope of existing product that a single instance of an error can corrupt. This includes other code, tests, systems, and customers who depend on the broken behavior. Measured as: what must be examined, fixed, or protected in response to discovering one such error? This is the "existing body of work" in the toil formula. It is determined by the error class, not the vigilance mechanism.

Vigilance mechanism quality (coverage adequacy, test duplication, test structure) affects the **effective assurance level** provided by that mechanism, not the body at risk. Coverage gaps reduce the effective level of a test suite; they do not create a new error class with their own body at risk.

**Total vigilance cost for a work type** = rate x sum(body at risk x assurance deficit per error class)

Error classes within a work type have independent costs that sum. Addressing one does not reduce the cost of another.

**Tests are vigilance mechanisms, not work types.** They appear as assurance options within error class tables. Their quality (structure, coverage adequacy, duplication level, environment coupling) determines the effective assurance level they provide.

**Product facets and work types**: work is organized by what facet is being improved. Improving one facet always risks degrading any other facet in the code being touched, and degrading the same facet in other parts of the code. Error classes are many-to-many: the same error class (e.g., capability regression) appears in multiple work types because the same thing can go wrong regardless of what you were trying to improve.

**Reversibility**: many error classes have a cost that depends not just on whether an error occurs but on how hard it is to correct. Investments that make errors easier to undo reduce required vigilance even without preventing the error.

---

## Product Facets

| Facet | Work type phrase | Business stake |
|-------|-----------------|----------------|
| **Capability** | Adding new behavior | Delivering what users need. The direct reason we exist -- but without the other facets, new capability erodes everything else. |
| **Adaptability** | Evolving the design | Staying viable as the business changes. Dismissed as "cleaning up" or "technical debt," but it is actually preserving option value. A rigid codebase cannot absorb pivots; an adaptable one costs 10x less to redirect. Without it, rewrites arrive on schedule. |
| **Explainability** | Making intent visible | Reducing the cost of every future decision. When code is clear, every subsequent change is faster and lower-risk. Explainability is a multiplier on the productivity of every future developer and AI agent that touches this system. |
| **Abstractability** | Building the shared vocabulary | Enabling businesspeople to reason about the system directly. When code speaks the language of the domain, experts can participate, validate behavior, and catch misalignments without going through a developer translation layer. This is how the business stays connected to what is actually being built. |
| **Transparency** | Illuminating system behavior | Knowing what your system is doing. Every incident, performance investigation, and compliance audit is faster when behavior is observable. Opacity is a tax on every investigation and a barrier to trust. |
| **Consistency** | Making behavior predictable | Setting and keeping promises to users. Consistent patterns across the product surface and over time let users build reliable mental models. Each surprise erodes trust and increases support burden. |
| **Security** | Hardening against threats | Protecting what users trust you with. Security failures are catastrophic and irreversible in ways other failures are not. |

---

## Domain: Product Work

### Work type: Adding new behavior

*Adding new behavior, fixing defects, implementing requirements. The thing being improved: what the product does.*

Business stake: the most visible work, but capability delivered on an adaptability-poor codebase degrades every other facet with each release.

Total vigilance cost = throughput x (capability regression cost + adaptability reduction cost + consistency violation cost)

---

#### Error class: Capability regression in existing code

**Body at risk**: all code, tests, and systems that depend on the behavior accidentally broken, AND all customers who depend on that behavior. Narrow for leaf components used by few users; systemic for widely-used utilities or core functionality.

**Rate**: one opportunity per change to shared code.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human code review | Human review | 1 | Whatever reviewer noticed |
| AI exploratory testing (generates edge-case tests after change) | Non-deterministic guardian | 2 | Probabilistic; finds novel cases; bootstraps to level 3 |
| AI change-impact analysis (identifies untested behaviors, invariants, negative cases) | Non-deterministic guardian | 2 | Probabilistic; targets specific change surface |
| Unit tests (ad hoc) | Deterministic detection | 3 | Tested behaviors; effective level drops with coverage gaps |
| Unit tests (recipe-based, comprehensive coverage) | Deterministic detection | 3 | Recipe-defined coverage; predictable gaps remain |
| Property-based / mutation testing | Deterministic detection | 3 | Structural properties |
| Theorem provers | Prevention | 4 | Formally specified invariants only |

No general level-5 mechanism for logic correctness.

@ai: decoupling is a key level 5 mechanism. Cohesion is too.

**Reversibility**: feature flags and canary deployments make capability additions reversible. When a regression can be rolled back in minutes, the required vigilance per capability change is lower.

**Gap condition**: expensive in any codebase where components have more than a few callers. Cost grows with codebase size and customer count. At any sustained change rate in a large brownfield codebase, level 0-1 produces unsustainable toil.

---

#### Error class: Adaptability reduction in touched code

**Body at risk**: future change effort for the entire module x number of future changes needed. Poorly designed code accumulates; each addition weakens the overall ability to adapt the system.

**Rate**: cumulative; every code addition has an adaptability dimension.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human review for design quality | Human review | 1 | Whatever reviewer noticed |
| Nullables pattern enforcement | Deterministic detection | 3 | Dependency inversion compliance |
| Hexagonal architecture enforcement | Deterministic detection | 3 | Port/adapter compliance |
| Test recipe workflow (injected at test-write time, scaffolds correct structure before you write anything) | Guided correctness | 5 | Tests written using the recipe |
| Functional architecture style (pure functions, explicit state separation) | Guided correctness | 5 | Code written in functional style |
| Nullables template (formalized, auto-generated alongside each new class) | Guided correctness | 5 | Classes using the template |

Level-5 explanation: when the correct pattern is the default starting point -- a scaffold or template presented at the moment of creation -- careless implementors land in the correct structure without trying. For AI, injecting the pattern into context at invocation or giving them a "create new class" (etc) deterministic tool achieves the same effect.

Key: AI defaults to mock-based coupling and will not reach for Nullables, Simulators, or Hexagonal ports unless the orchestration layer injects these patterns on every invocation.

**Reversibility**: refactoring tools make design choices easy to undo. If an AI chose the wrong abstraction, the refactoring tool makes re-choosing cheap -- reducing the vigilance required per design decision.

**Gap condition**: cumulative; individually small but compounding. Expensive when a large fraction of the codebase lacks clean test seams. The cost becomes visible only after it is severe.

---

#### Error class: Consistency violation in touched code

**Body at risk**: cognitive load for all future developers and AI that read this code; user expectations based on established patterns.

**Rate**: per change to an API, naming convention, or established behavioral pattern.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Code review | Human review | 1 | Whatever reviewer noticed |
| Linters | Deterministic detection | 3 | Configured style/structural rules |
| Architecture linters | Deterministic detection | 3 | Configured structural rules |
| Planning tool requiring pattern reference | Prevention | 4 | All decisions via the tool |

---

### Work type: Evolving the design

*Refactoring, restructuring, improving design, extracting abstractions. The thing being improved: how easily the product can adapt to unknown future changes.*

Business stake: every future pivot, requirement change, or AI-assisted evolution costs less when the design can absorb it. This is not cleanup -- it is preserving the team's ability to act on business decisions. A rigid design is a slow-motion lock-in; an adaptable one is a strategic asset.

Total vigilance cost = frequency x (capability regression cost + adaptability regression cost + consistency violation cost + vigilance mechanism adaptability cost)

---

#### Error class: Capability regression (accidental behavior change)

**Body at risk**: every test, downstream system, and customer depending on the behavior of the changed component. Narrow for leaf components; systemic for widely-used utilities.

**Rate**: one opportunity per structural change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human review of diff | Human review | 1 | Whatever reviewer noticed |
| Test suite run after refactoring | Deterministic detection | 3 | Tested behaviors only |
| AST-based refactoring tools only | Guided correctness | 5 | All structural refactoring operations |

**Reversibility**: AST refactoring tools make behavior-safe changes the easy path AND make each step easily reversible. Level 5 provides both zero vigilance for execution correctness and high reversibility for design correctness -- if a structural choice turns out wrong, the tool makes un-doing it equally cheap.

**Gap condition**: expensive in any codebase where components have more than a few callers. In a large brownfield codebase at any sustained refactoring rate, level 0-1 produces unsustainable toil.

---

#### Error class: Adaptability regression in other areas (design regression)

**Body at risk**: architectural coherence of related modules. Cascades if the wrong abstraction sets a precedent.

**Rate**: occurs with every structural change; cost varies by centrality of the changed abstraction.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human review for design quality | Human review | 1 | Whatever reviewer noticed |
| AI design critique fork (adversarial, independent) | Non-deterministic guardian | 2 | Probabilistic; finds common pattern violations |
| Architecture linters (dependency rules) | Deterministic detection | 3 | Configured structural rules |

No known level-4 mechanism for design quality in the general case. Human judgment remains essential here.

**Reversibility**: this is the primary justification for AST refactoring tooling beyond behavioral safety. When any design choice can be undone in two commands, the vigilance required per design decision is much lower. A good refactoring tool makes it safe to be wrong about design, which reduces the vigilance cost of every design decision.

**Gap condition**: less multiplicative than behavior change -- regressions accumulate rather than propagate automatically. Expensive when throughput is high and no design review process exists.

---

#### Error class: Consistency violation (structural breakage)

*Distinction from capability regression: behavior change = the code does something different. Structural breakage = the code's interface or type contract changed and dependents were not updated. Both can happen during refactoring. Refactoring tools address both, as long as all dependents are within the tool's scope.*

**Body at risk**: all consumers of the changed interface or structure. Systemic for widely-used types or interfaces.

**Rate**: one opportunity per interface or type change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human review | Human review | 1 | Whatever reviewer noticed |
| Linter rules | Deterministic detection | 3 | Configured rules only |
| Strict type system enforced pre-commit | Prevention | 4 | All type interactions in covered code |
| AST refactoring tools (rename/move with full dependency awareness) | Guided correctness | 5 | All dependents within tool scope |

@ai: add language-server based reference tracking. Even without AST refactoring tools, it can be used to get level 4 for edits.

**Gap condition**: expensive at any scale where more than one system depends on the changed interface.

---

#### Error class: Adaptability reduction in vigilance mechanisms (test duplication)

**Body at risk**: future change effort whenever associated code is modified. Each test that duplicates code setup, uses mocks (which mirror the production interface), or fails alongside sibling tests adds to this body. When code changes, all these tests must change too.

@ai: add to the template for every error class: "the worry". This should speak to a developer; it is the thing we worry about. Each error class should correspond 1:1 to a worry we all feel - at least, with experience. This should help readers "get" what we're talking about at each one. In this case, for example, most of what you have in "body at risk" is the worry.

@ai: after doing the above, get body at risk to be something quantifiable. Something we can easily count to see if it is large for our product. That will be key to identifying which vigilance categories are most important to us. Same with rate. Rate should be an event. This worry happens, and we need to pay the toil cost, every time the event happens. Yes, that's the way to think about it: rate is the even that makes us pay the toil cost. body at risk (which might need a rename) is the total amount of stuff we have to worry about - the scope of the vigilance required. And the mechanisms are either ways to reduce the body at risk, or to make it easier to verify / protect it (reduced or eliminated toil cost per body at risk). Use that to also split the options table. Identify options that reduce the size of the worry surface, and other options that let us worry more efficiently. (and that gives the better name - body at risk becomes worry surface)

**Rate**: cumulative; each test written with duplication adds to the body.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human review of test quality | Human review | 1 | Whatever reviewer noticed |
| Nullables pattern (eliminates mocks -- the largest source of test duplication) | Deterministic detection | 3 | Tests using Nullables |
| Test recipe tool (prevents structural duplication in new tests) | Prevention | 4 | All tests through the tool |
| Test recipe workflow injected at write time | Guided correctness | 5 | Tests written with the workflow |

Test duplication is a larger adaptability cost than coverage gaps: failing-together tests and mock-heavy setups make every future code change expensive in test maintenance.

**Gap condition**: expensive at high test volume. Grows silently alongside the test suite.

---

### Work type: Making intent visible

*Renaming, clarifying, restructuring for readability, improving inline documentation. The thing being improved: human and AI comprehension of the code.*

Business stake: every future developer, every AI agent, and every code review starts with reading. Explainability reduces the cost of every subsequent decision made in this codebase. Unclear code is a tax paid on every future change.

Total vigilance cost = frequency x (capability regression cost + consistency violation cost)

---

#### Error class: Capability regression (renames that change behavior)

Rare but real: renaming a function called via string reflection, or a symbol with unusual semantics. Same assurance options as capability regression under adding new behavior. AST refactoring tools with rename awareness eliminate this class within tool scope (level 5).

@ai: if a node, like this, is the same as somewhere else, then just reference the one over there. Don't duplicate it with a stub link.

---

#### Error class: Consistency violation (partial rename -- some callsites updated, others not)

**Body at risk**: all callsites still using the old name. Systemic for widely-used symbols.

**Rate**: one opportunity per rename or concept change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human search-and-replace | Human review | 1 | Whatever human searched for |
| Strict type system (catches callsite mismatches at compile time) | Prevention | 4 | All typed callsites |
| AST refactoring tool (rename-aware, finds all callsites) | Guided correctness | 5 | All callsites within tool scope |

---

### Work type: Building the shared vocabulary

*Extracting domain concepts into code, naming things after business concepts, creating ubiquitous language, aligning code structure to business structure.*

Business stake: when code speaks the language of the business domain, domain experts can participate in product decisions, validate behavior, and catch misalignments without translation. This is how the business stays connected to what is being built. Without it, every business conversation has to go through a developer -- a bottleneck that scales poorly and introduces errors.

Total vigilance cost = frequency x (capability regression cost + domain model drift cost)

---

#### Error class: Capability regression

Same as under adding new behavior. Renaming and restructuring to match domain concepts carries risk of behavior change. AST tools address this at level 5 within tool scope.

---

#### Error class: Domain model corruption

**Body at risk**: the ability of domain experts to reason about and validate the system. When code concepts drift from domain concepts, misalignments accumulate silently.

**Rate**: cumulative; each abstraction that diverges from the domain adds to the drift.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Domain expert review of new abstractions | Human review | 1 | What expert noticed |
| Domain model documentation (glossary, entity definitions) | Non-deterministic guardian | 2 | Written; requires active reference |
| Domain review embedded in planning workflow | Deterministic detection | 3 | All abstractions introduced through planning |
| Planning tool requiring domain concept mapping | Prevention | 4 | All new concepts via the tool |

**Gap condition**: expensive as system complexity grows. Domain model drift is invisible until businesspeople can no longer reason about the product without developer translation.

---

### Work type: Illuminating system behavior

*Adding logging, instrumentation, tracing, observability.*

Business stake: every incident is cheaper when you can see what the system did. Opacity is a tax on every investigation, performance conversation, and compliance audit. Teams that cannot observe their system make decisions based on guesswork.

Total vigilance cost = frequency x (capability regression cost + security violation cost)

---

#### Error class: Capability regression

Same as under adding new behavior. Logging code can introduce bugs or performance degradation.

---

#### Error class: Security violation (logs expose sensitive data)

**Body at risk**: all customers whose sensitive data is exposed per instance.

**Rate**: per observability addition touching sensitive data.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Code review for data classification | Human review | 1 | Whatever reviewer noticed |
| Automated PII detection in log output | Deterministic detection | 3 | Detected PII patterns |
| Structured logging with field-level classification enforcement | Prevention | 4 | All fields through the logger |

---

### Work type: Making behavior predictable

*Establishing and honoring consistent behavioral patterns across the product surface and over time. Users build expectations from what they have experienced; this work is about setting those expectations correctly and meeting them.*

Business stake: consistent behavior lets users build reliable mental models and trust the product. Each surprise -- a pattern that works differently in one place than another, a behavior that changed without warning -- erodes that trust and generates support burden. Consistency is a promise to users; breaking it is expensive even when the underlying reason is legitimate.

Total vigilance cost = frequency x (behavioral inconsistency cost + structural breakage cost)

---

#### Error class: Behavioral inconsistency

**Body at risk**: user trust and mental model integrity across all users who have internalized the broken pattern. Systemic when the pattern is surface-wide.

**Rate**: per change to any established user-facing pattern or API contract.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Code/UX review for consistency | Human review | 1 | Whatever reviewer noticed |
| Design system (patterns documented, not enforced) | Non-deterministic guardian | 2 | Documented patterns; requires adoption |
| Automated behavioral consistency checks | Deterministic detection | 3 | Measurable consistency properties |
| Design system with enforcement gates | Prevention | 4 | All interactions through the system |

**Gap condition**: expensive as the user base grows and patterns become entrenched. Late-discovered inconsistency requires migrating established user mental models.

---

#### Error class: Structural breakage

Same as under evolving the design. Structural breakage is a code-level consistency violation: changing an interface without updating all its consumers.

---

### Work type: Hardening against threats

*Adding authentication, authorization, input sanitization, access controls.*

Business stake: security failures are catastrophic and irreversible in ways other failures are not. A single breach can end a product. The cost is not proportional -- one successful attack can exceed years of security investment.

Total vigilance cost = frequency x (capability regression cost + security regression cost)

---

#### Error class: Capability regression

Same as under adding new behavior. Security controls that are too restrictive break features.

---

#### Error class: Security regression (new security code introduces vulnerability)

**Body at risk**: all customers and data accessible through the vulnerability.

**Rate**: per security addition or change.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Security code review | Human review | 1 | Whatever reviewer noticed |
| Automated security scanning (SAST) | Deterministic detection | 3 | Known vulnerability patterns |
| Formal security models (threat modeling + verification) | Prevention | 4 | Modeled threat classes |

---

## Domain: System Design

### Work type: Making architectural decisions

*Choosing how the system is structured: module boundaries, data flow, service boundaries, technology choices.*

Business stake: architectural decisions have disproportionate long-term impact. The wrong architecture makes every future capability addition expensive or impossible. Architecture is the decision that constrains all future decisions.

Total vigilance cost = decision frequency x impact-per-decision x (inconsistency cost + drift cost)

---

#### Error class: Decision inconsistency

**Body at risk**: architectural coherence of the system as a whole.

**Rate**: low per decision; high long-term impact. Decisions compound.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Tribal knowledge | Human review | 1 | Whatever team remembers |
| Architecture Decision Records (ADRs) | Non-deterministic guardian | 2 | Written; requires active reference |
| ADR review in planning workflow | Deterministic detection | 3 | All decisions in planning scope |
| Planning tool requiring ADR reference | Prevention | 4 | All decisions via the tool |

**Reversibility**: modular architecture with clean seams makes decisions easier to reverse. Small architectural experiments reduce vigilance per decision.

---

#### Error class: Architectural drift

**Body at risk**: the entire codebase as it diverges from architectural intent.

**Rate**: continuous; drift accumulates with every change not checked against intent.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Ad hoc review | Human review | 1 | Occasional; decays fast |
| AI drift guardian (scans + abstracts) | Non-deterministic guardian | 2 | Broader than rules; unpredictable |
| Architecture linters | Deterministic detection | 3 | Configured rule set |
| Drift -> ADR pipeline | Bootstrapped to 3 | Systematic improvement |

**Gap condition**: expensive in any codebase with sustained throughput.

---

## Domain: Planning

### Work type: Planning and scoping work

*Defining goals, decomposing into tasks, setting success criteria, and prioritizing.*

Total vigilance cost = planning frequency x (ungrounded goals cost + decomposition gaps cost + missing criteria cost + priority error cost)

---

#### Error class: Ungrounded goals

**Body at risk**: all work done on unvalidated goals. Scales with work rate x goal size.

**Rate**: per planning cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Planning discipline | Human review | 1 | Individual; decays |
| Planning tool requiring grounding source | Prevention | 4 | All goals made via the tool |

**Reversibility**: short iterations make goal errors cheap. Small batch sizes limit work done before a wrong goal is discovered.

---

#### Error class: Decomposition gaps

**Body at risk**: all work that flows from a poorly decomposed item. Hidden unknowns surface as surprises downstream.

**Rate**: per decomposition cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human judgment | Human review | 1 | Individual skill; decays |
| Planning tool with required fields (variation points, unknowns, dependencies) | Prevention | 4 | All decompositions via the tool |

---

#### Error class: Missing or wrong success criteria

**Body at risk**: all evaluation done against wrong criteria. One criteria error corrupts every downstream evaluation.

**Rate**: per planning cycle; systemic in impact.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Planning discipline | Human review | 1 | -- |
| Stakeholder review before work starts | Deterministic detection | 3 | Reviewed criteria |
| Planning tool requiring criteria fields | Prevention | 4 | All work with criteria via the tool |

---

#### Error class: Priority errors

**Body at risk**: opportunity cost of all work done on wrong-priority items.

**Rate**: per selection cycle.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Human judgment | Human review | 1 | Situation-dependent |
| Explicit scoring criteria | Deterministic detection | 3 | Scored dimensions only |
| Deterministic queue (rule-based) | Prevention | 4 | All tasks through the queue |

**Reversibility**: small batch sizes. Smaller work units mean a wrong priority is discovered and corrected sooner.

---

### Work type: Grounding in reality

*Connecting the product to actual user needs and outcomes.*

#### Error class: Reality disconnect

**Body at risk**: accumulated work that diverges from user needs. Grows with throughput x time without grounding.

**Rate**: continuous; drift accumulates between grounding events.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| No mechanism | -- | 0 | -- |
| Regular demos / user review | Human review | 1 | What participants noticed |
| Metrics / telemetry | Deterministic detection | 3 | Measured behaviors only |
| A/B testing infrastructure | Deterministic detection | 3 | Tested variants |
| Outcome-based planning with measurement gates | Prevention | 4 | All work with defined outcome gates |

**Reversibility**: feature flags and modular deployment make it cheap to roll back or pivot when reality disconnect is discovered.

---

## Domain: Evaluation and Oversight

*These responsibilities are themselves assurance mechanisms. The question is what level they operate at.*

### Work type: Evaluating outputs

#### Error class: Bad output accepted

**Body at risk**: whatever the bad output corrupts downstream, including customers affected.

**Rate**: per output produced; scales with throughput.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review | Human review | 1 | Whatever human noticed |
| LLM-as-judge (single run) | Non-deterministic guardian | 2 | Probabilistic; may share AI biases |
| LLM-as-judge (multi-run, adversarial) | Non-deterministic guardian | 2->3 | Improves with adversarial variation |
| Automated eval against defined criteria | Deterministic detection | 3 | Criteria-covered behaviors |
| Criteria coverage tool | Prevention | 4 | All criteria through the tool |

---

### Work type: Monitoring system health

#### Error class: Drift not detected

**Body at risk**: accumulated drift x time-to-detection.

**Rate**: continuous.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human situational awareness | Human review | 1 | What team notices |
| AI drift guardian | Non-deterministic guardian | 2 | Broader; probabilistic |
| Metrics + alerts | Deterministic detection | 3 | Measured metrics only |
| Drift -> deterministic check pipeline | Bootstrapped to 3 | Systematic improvement |

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

**Body at risk**: affected customers and systems during the failure period.

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
| No mechanism | -- | 0 | -- |
| Manual audits | Human review | 1 | Occasional |
| Infrastructure as Code | Deterministic detection | 3 | Declared infrastructure |
| Immutable infrastructure | Prevention | 4 | All infrastructure through IaC system |

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

**Body at risk**: everything the AI touches outside its authorized scope, including customer impact.

**Rate**: per autonomous action in an insufficiently bounded system.

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Written boundary documentation | Human review | 1 | Requires AI to read and follow |
| Tooling restrictions (file-type, read-only access) | Prevention | 4 | All operations the tools allow |
| Workflow enforcement of boundary | Prevention | 4 | All work through the workflow |

**Gap condition**: no level 2-3 intermediate exists -- either the tools enforce it or they don't.

---

## Open Question for Arlo

@human: **Coverage gaps and body at risk.** I removed "coverage gaps" as a standalone error class. My reasoning: a coverage gap is a reduced effective assurance level, not an error with its own body at risk. The body at risk belongs to whatever error the gap fails to catch -- which now includes customers. Coverage quality appears as an effective-level qualifier on assurance options (e.g., "recipe-based tests with comprehensive coverage: effective level 3; ad hoc tests with thin coverage: effective level 2"). Does this framing work, or is there a body-at-risk concept for gaps I am not seeing?

---

## Summary: Total Vigilance Cost Profile

| Work type | Most costly error class | Why costly | Minimum viable | Target |
|-----------|------------------------|-----------|----------------|--------|
| Adding new behavior | Capability regression | Systemic scope; customers affected; scales with throughput | Level 3 (recipe tests) | Level 3 |
| Adding new behavior | Adaptability reduction | Cumulative; invisible until severe | Level 3 (Nullables/hex arch) | Level 5 (template/recipe workflow) |
| Evolving the design | Capability regression (behavior change) | Systemic; customers affected; continuous rate | Level 3 (tests) | Level 5 (AST tools) |
| Evolving the design | Adaptability regression (design) | Accumulates; compounds | Level 2 (critique fork) + reversibility | Level 3 (linters) + reversibility |
| Evolving the design | Test duplication | Scales with test volume | Level 3 (Nullables) | Level 5 (recipe workflow) |
| Making intent visible | Consistency violation (partial rename) | Systemic when symbol is wide | Level 4 (type system) | Level 5 (AST tools) |
| Building the shared vocabulary | Domain model corruption | Invisible until businesspeople lose contact | Level 2 (domain docs) | Level 4 (planning tool) |
| Making behavior predictable | Behavioral inconsistency | Erodes user trust; compounds | Level 2 (design system) | Level 4 (enforced design system) |
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
