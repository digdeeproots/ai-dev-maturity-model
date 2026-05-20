# Behavioral Matrix — Product Facets and Assurance Dimension

*Draft v5 — "worry surface" replaces "body at risk"; "rate event" replaces rate; split tables; "the worry" field; cross-references instead of stubs.*

Purpose: map all types of product work to their vigilance requirements. Organized by what facet is being improved, since improving one facet always risks degrading others.

---

## How to Read This Document

**The worry**: the gut-check developers feel. Each error class corresponds to a worry experienced developers recognize.

**Worry surface**: the scope of existing product a single instance of this error can affect. This is what we multiply by rate and assurance deficit to get vigilance toil. It is quantifiable -- something we can count or estimate for our specific product.

**Rate event**: the specific event that triggers this worry. Toil is paid every time this event occurs.

**Vigilance toil = rate events/period x (worry surface x assurance deficit)**

Assurance options either:
- **Reduce the worry surface** (scope-shrinking): fewer things at risk per event
- **Reduce toil per unit** (efficiency): cheaper to verify each unit of the worry surface

Both tables use a 0-5 scale where level 5 means zero vigilance remaining within scope.

**Tests are vigilance mechanisms, not work types.** Their quality (structure, coverage, duplication, environment coupling) determines their effective assurance level.

**Reversibility**: investments that make errors cheaper to correct. These don't prevent or detect errors but reduce the cost when one slips through.

**Product facets and work types**: work is organized by what facet is being improved. Improving one facet always risks degrading others. Error classes are many-to-many: the same error class (e.g., capability regression) appears in multiple work types.

---

## Product Facets

| Facet | Work type phrase | Business stake |
|-------|-----------------|----------------|
| **Capability** | Adding new behavior | Delivering what users need. The direct reason we exist -- but without the other facets, new capability erodes everything else. |
| **Adaptability** | Evolving the design | Staying viable as the business changes. Dismissed as "cleaning up" or "technical debt," but it is actually preserving option value. A rigid codebase cannot absorb pivots; an adaptable one costs 10x less to redirect. Without it, rewrites arrive on schedule. |
| **Explainability** | Making intent visible | Reducing the cost of every future decision. When code is clear, every subsequent change is faster and lower-risk. A multiplier on the productivity of every future developer and AI agent. |
| **Abstractability** | Building the shared vocabulary | Enabling businesspeople to reason about the system directly. When code speaks the language of the domain, experts can validate behavior and catch misalignments without a developer translation layer. |
| **Transparency** | Illuminating system behavior | Knowing what your system is doing. Every incident, investigation, and audit is faster when behavior is observable. Opacity is a tax on every investigation. |
| **Consistency** | Making behavior predictable | Setting and keeping promises to users. Consistent patterns let users build reliable mental models. Each surprise erodes trust and increases support burden. |
| **Security** | Hardening against threats | Protecting what users trust you with. Security failures are catastrophic and irreversible. |

---

## Domain: Product Work

### Work type: Adding new behavior

*Adding new behavior, fixing defects, implementing requirements.*

Business stake: the most visible work, but capability delivered on an adaptability-poor codebase degrades every other facet with each release.

Total vigilance toil = events/period x sum of (worry surface x assurance deficit per error class)

---

#### Error class: Capability regression

**The worry**: "Did I break something that was working? Who's going to find out in production before I do?"

**Worry surface**: number of callers (components, services, customer flows) that depend on the behavior that could break. Count the direct callsites plus any customers whose experience passes through them.

**Rate event**: every time shared code changes.

**Scope-shrinking options** (reduce the number of callers at risk):

| Option | Effect | Level |
|--------|--------|-------|
| Decoupled architecture (no shared state, pure interfaces) | Regression cannot propagate beyond the component's direct consumers | 4 |
| Functional / decoupled style (isolation is the easy default; coupling requires deliberate effort) | Errors are self-contained; cross-component propagation is structurally hard | 5 |

**Efficiency options** (reduce toil per caller):

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human code review | Human review | 1 | Whatever reviewer noticed |
| AI exploratory testing (generates edge-case tests after change) | Non-deterministic guardian | 2 | Probabilistic; bootstraps to level 3 |
| AI change-impact analysis (identifies untested behaviors, invariants, negative cases) | Non-deterministic guardian | 2 | Targets specific change surface |
| Unit tests (ad hoc) | Deterministic detection | 3 | Tested behaviors; effective level drops with coverage gaps |
| Unit tests (recipe-based, comprehensive coverage) | Deterministic detection | 3 | Recipe-defined coverage; predictable gaps remain |
| Property-based / mutation testing | Deterministic detection | 3 | Structural properties |
| Theorem provers | Prevention | 4 | Formally specified invariants only |

**Reversibility**: feature flags and canary deployments. When a regression rolls back in minutes, vigilance per change is lower.

**Gap condition**: expensive in any codebase where components have more than a few callers. Grows with caller count and customer base.

---

#### Error class: Adaptability reduction in touched code

**The worry**: "Is this code going to be a nightmare to change when requirements shift next quarter?"

**Worry surface**: lines of code in the module that will need to change for each future requirement, times the expected number of such requirements. Proxy: count the dependencies injected via mocks or the depth of coupling in the module.

**Rate event**: every time code is added without design consideration.

**Scope-shrinking options** (reduce coupling, shrink what future changes must touch):

| Option | Effect | Level |
|--------|--------|-------|
| Nullables pattern (eliminates mock-based coupling) | Dependencies become swappable; fewer things coupled | 3 |
| Hexagonal architecture (ports and adapters) | Infrastructure dependencies isolated at the boundary | 3 |
| Functional architecture (pure functions, explicit state separation) | Each function has zero hidden coupling; worry surface = function signature | 5 |
| Nullables template auto-generated alongside each new class | Correct structure is the starting point; coupling is harder to introduce than avoid | 5 |

**Efficiency options** (evaluate design quality faster):

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review for design quality | Human review | 1 | Whatever reviewer noticed |
| Test recipe workflow (injected at test-write time, scaffolds correct structure) | Guided correctness | 5 | Tests written using the recipe |

Key: AI defaults to mock-based coupling. It will not reach for Nullables or Hexagonal ports unless the orchestration layer injects these patterns on every invocation.

**Reversibility**: refactoring tools make design choices easy to undo, reducing vigilance per design decision.

**Gap condition**: cumulative; invisible until severe. Expensive when a large fraction of the codebase lacks clean test seams.

---

#### Error class: Consistency violation in touched code

**The worry**: "Is this consistent with how everything else works, or am I creating a surprise for the next person to read this?"

**Worry surface**: number of developers and AI agents who will need to understand this code over its lifetime. Proxy: module age x team size.

**Rate event**: every time code departs from established patterns in naming, structure, or API shape.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Architecture linters | Structural violations flagged before merge; consistent patterns enforced | 3 |
| Planning tool requiring pattern reference | No new pattern introduced without explicit acknowledgment of prior patterns | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Code review | Human review | 1 | Whatever reviewer noticed |
| Linters (style / structural rules) | Deterministic detection | 3 | Configured rules |

---

### Work type: Evolving the design

*Refactoring, restructuring, improving design, extracting abstractions.*

Business stake: every future pivot costs less when the design can absorb it. This is not cleanup -- it is preserving the team's ability to act on business decisions. A rigid design is slow-motion lock-in.

Total vigilance toil = events/period x sum of (worry surface x assurance deficit per error class)

---

#### Error class: Capability regression (accidental behavior change)

**The worry**: "Did my restructuring change what the code actually does, even slightly?"

See *Capability regression* in *Adding new behavior* for worry surface, rate event, scope-shrinking options, and efficiency options. Same entry.

**Reversibility**: AST refactoring tools make behavior-safe changes the easy path AND make each step easily reversible. Level 5 provides both zero vigilance and high reversibility -- a wrong structural choice can be undone as cheaply as it was made.

---

#### Error class: Adaptability regression in other areas (design regression)

**The worry**: "Did I choose the wrong abstraction and make future work harder for everyone?"

**Worry surface**: number of modules that use the affected abstraction. Each one now carries the cost of the wrong design choice.

**Rate event**: every time a structural change affects a shared abstraction.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Modular architecture with clean seams | Cascade of a wrong abstraction is limited to the module; neighbors are insulated | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review for design quality | Human review | 1 | Whatever reviewer noticed |
| AI design critique fork (adversarial, independent) | Non-deterministic guardian | 2 | Probabilistic; finds common pattern violations |
| Architecture linters (dependency rules) | Deterministic detection | 3 | Configured structural rules |

No known level-4 mechanism for design quality in the general case. Human judgment remains essential.

**Reversibility**: the primary justification for AST refactoring tooling beyond behavioral safety. When any design choice can be undone in two commands, the vigilance required per design decision drops sharply. It is safe to be wrong.

---

#### Error class: Consistency violation (structural breakage)

**The worry**: "Did I update every single place that uses this interface, or did I miss some?"

*Distinction from capability regression: behavior change = the code does something different. Structural breakage = the interface or type contract changed and some consumers were not updated. Refactoring tools address both as long as dependents are within tool scope.*

**Worry surface**: number of direct consumers of the changed interface or type. Count the callsites or dependents in the codebase.

**Rate event**: every time an interface or type contract changes.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Narrow, well-defined interfaces (fewer consumers per interface) | Smaller dependency fan-out; fewer things break per change | 3 |
| Decoupled architecture | Components interact via narrow contracts; breakage cannot cascade | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review | Human review | 1 | Whatever reviewer noticed |
| Linter rules | Deterministic detection | 3 | Configured rules only |
| Language-server reference tracking (find all usages before editing, update all at once) | Prevention | 4 | All references within language server scope |
| Strict type system enforced pre-commit | Prevention | 4 | All type interactions in covered code |
| AST refactoring tools (rename/move with full dependency awareness) | Guided correctness | 5 | All dependents within tool scope |

---

#### Error class: Adaptability reduction in vigilance mechanisms (test duplication)

**The worry**: "When I change this code, am I going to have to fix 40 tests that all break together because they all mock the same thing?"

**Worry surface**: number of tests that share setup code or mock the same dependency. Count mock-heavy test files; count tests that fail in clusters.

**Rate event**: every time a test is written with mocks or duplicated setup.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Nullables pattern (eliminates mocks -- the largest source of duplication) | Dependencies become swappable without test rewrite; duplication source eliminated | 3 |
| Functional architecture (pure functions need no mocks) | Functions have no side effects to mock; worry surface approaches zero | 5 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review of test quality | Human review | 1 | Whatever reviewer noticed |
| Test recipe tool (prevents structural duplication in new tests) | Prevention | 4 | All tests through the tool |
| Test recipe workflow injected at write time | Guided correctness | 5 | Tests written with the workflow |

**Gap condition**: expensive at high test volume. Grows silently alongside the test suite.

---

### Work type: Making intent visible

*Renaming, clarifying, restructuring for readability, improving inline documentation.*

Business stake: every future developer and AI agent starts with reading. Explainability reduces the cost of every subsequent decision in this codebase.

---

#### Error class: Capability regression (renames that change behavior)

→ See *Capability regression* in *Adding new behavior*. Rare here but applies: renaming a function called via string reflection or with unusual dispatch semantics.

---

#### Error class: Consistency violation (partial rename)

**The worry**: "Did I update every callsite, or are some places still using the old name?"

**Worry surface**: number of callsites not yet updated to the new name. Directly countable.

**Rate event**: every rename or concept change applied to a shared symbol.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Narrow symbol scope (fewer uses = fewer places to update) | Smaller fan-out means fewer missed callsites | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human search-and-replace | Human review | 1 | Whatever human searched for |
| Language-server reference tracking | Prevention | 4 | All references within language server scope |
| Strict type system (catches callsite mismatches at compile time) | Prevention | 4 | All typed callsites |
| AST refactoring tool (rename-aware, finds all callsites) | Guided correctness | 5 | All callsites within tool scope |

---

### Work type: Building the shared vocabulary

*Extracting domain concepts into code, naming things after business concepts, aligning code structure to business structure.*

Business stake: when code speaks the language of the domain, experts can participate directly. Without this, every business conversation requires developer translation -- a bottleneck that scales poorly.

---

#### Error class: Capability regression

→ See *Capability regression* in *Adding new behavior*. Renaming and restructuring carry the same risk.

---

#### Error class: Domain model corruption

**The worry**: "Does this concept match what the businesspeople actually call it, or did I invent my own terminology and drift from the domain?"

**Worry surface**: number of domain concepts in the codebase that diverge from business vocabulary. Count the places where code names and business names differ.

**Rate event**: every time a new abstraction is introduced without domain validation.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Domain model documentation (glossary, entity definitions) | Provides a reference; reduces unnoticed drift | 2 |
| Domain review embedded in planning workflow | All new abstractions checked against domain model before implementation | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Domain expert review of new abstractions | Human review | 1 | What expert noticed |
| Planning tool requiring domain concept mapping | Prevention | 4 | All new concepts via the tool |

**Gap condition**: invisible until businesspeople can no longer reason about the product without translation.

---

### Work type: Illuminating system behavior

*Adding logging, instrumentation, tracing, observability.*

Business stake: every incident is cheaper when you can see what happened. Opacity is a tax on every investigation.

---

#### Error class: Capability regression

→ See *Capability regression* in *Adding new behavior*. Logging and instrumentation code can introduce bugs or performance degradation.

---

#### Error class: Security violation (logs expose sensitive data)

**The worry**: "Am I accidentally logging a password, session token, or credit card number in plain text?"

**Worry surface**: number of customers whose sensitive data appears in accessible log streams. Directly countable from data classification.

**Rate event**: every time observability code touches a sensitive data path.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Structured logging with field-level classification | Sensitive fields are classified at write time; unclassified fields cannot be logged | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Code review for data classification | Human review | 1 | Whatever reviewer noticed |
| Automated PII detection in log output | Deterministic detection | 3 | Detected PII patterns |

---

### Work type: Making behavior predictable

*Establishing and honoring consistent behavioral patterns across the product surface and over time.*

Business stake: consistent behavior lets users build reliable mental models. Each surprise erodes trust and increases support burden. Consistency is a promise; breaking it is expensive even when the reason is legitimate.

---

#### Error class: Behavioral inconsistency

**The worry**: "Does this behave the same way as the similar feature over there, or will users be confused when the pattern breaks?"

**Worry surface**: number of user journeys that follow the pattern that was broken or violated. Count the user-facing touchpoints affected.

**Rate event**: every time a user-facing behavior or interaction pattern changes.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Design system (documented patterns, not yet enforced) | Reduces unnoticed divergence; not guaranteed | 2 |
| Design system with enforcement gates | Pattern violations blocked before shipping | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Code/UX review for consistency | Human review | 1 | Whatever reviewer noticed |
| Automated behavioral consistency checks | Deterministic detection | 3 | Measurable consistency properties |

**Gap condition**: expensive as the user base grows and patterns become entrenched.

---

#### Error class: Structural breakage

→ See *Structural breakage* in *Evolving the design*. Same entry: interface change without updating all consumers.

---

### Work type: Hardening against threats

*Adding authentication, authorization, input sanitization, access controls.*

Business stake: security failures are catastrophic and irreversible. One successful attack can exceed years of security investment.

---

#### Error class: Capability regression

→ See *Capability regression* in *Adding new behavior*. Security controls that are too restrictive break features.

---

#### Error class: Security regression (new security code introduces vulnerability)

**The worry**: "Did my auth change open a hole I am not seeing? Could someone now access something they shouldn't?"

**Worry surface**: number of customers and data objects accessible through the vulnerability. Directly countable from access control scope.

**Rate event**: every time security controls are modified.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Least-privilege design (narrow scope of each control) | Vulnerability scope bounded by control's narrow authority | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Security code review | Human review | 1 | Whatever reviewer noticed |
| Automated security scanning (SAST) | Deterministic detection | 3 | Known vulnerability patterns |
| Formal security models (threat modeling + verification) | Prevention | 4 | Modeled threat classes |

---

## Domain: System Design

### Work type: Making architectural decisions

*Choosing system structure: module boundaries, data flow, service boundaries, technology choices.*

Business stake: architectural decisions constrain all future decisions. The wrong architecture makes every future capability addition expensive or impossible.

---

#### Error class: Decision inconsistency

**The worry**: "Does this architectural decision contradict something we decided six months ago?"

**Worry surface**: number of code areas that make implicit assumptions about the architectural decision being violated. Count ADR references or structural assumptions in code.

**Rate event**: every architectural decision made without consulting prior decisions.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Modular architecture (clean seams, limited dependencies) | Inconsistent decisions stay contained; cannot cascade | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Tribal knowledge | Human review | 1 | Whatever team remembers |
| Architecture Decision Records (ADRs) | Non-deterministic guardian | 2 | Written; requires active reference |
| ADR review in planning workflow | Deterministic detection | 3 | All decisions in planning scope |
| Planning tool requiring ADR reference | Prevention | 4 | All decisions via the tool |

**Reversibility**: small architectural experiments (prove it before committing the full codebase) reduce the cost of a wrong decision.

---

#### Error class: Architectural drift

**The worry**: "Is the code still following the architecture, or is it slowly becoming something else while nobody notices?"

**Worry surface**: number of violations of the intended architecture currently in the codebase. Directly countable with linting tools.

**Rate event**: every code change made without checking architectural intent.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Modular architecture (strong boundaries between layers) | Drift in one module cannot cross into others | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Ad hoc review | Human review | 1 | Occasional; decays fast |
| AI drift guardian (scans + abstracts anomalies) | Non-deterministic guardian | 2 | Broader than rules; unpredictable |
| Architecture linters | Deterministic detection | 3 | Configured rule set |
| Drift to ADR pipeline | Bootstrapped to 3 | Systematic improvement |

---

## Domain: Planning

### Work type: Planning and scoping work

---

#### Error class: Ungrounded goals

**The worry**: "Are we building the right thing, or did we just assume we know what users want without asking them?"

**Worry surface**: story points committed to goals not grounded in evidence. Directly countable in the backlog.

**Rate event**: every planning cycle where goals are assumed rather than validated.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Short iteration cycles | Less work committed before grounding event; smaller unvalidated backlog | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Planning discipline | Human review | 1 | Individual; decays |
| Planning tool requiring grounding source | Prevention | 4 | All goals made via the tool |

**Reversibility**: small batch sizes reduce the work done before a wrong goal is discovered.

---

#### Error class: Decomposition gaps

**The worry**: "Did we think through all the tricky parts, or are there hidden surprises waiting to surface mid-sprint?"

**Worry surface**: number of unidentified variation points in a decomposed item. Proxy: count the explicitly named unknowns; gaps are the ones not listed.

**Rate event**: every decomposition performed without structured analysis.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Explicit unknown-surfacing practice | Forces unknowns to be named; reduces hidden surprise count | 2 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human judgment | Human review | 1 | Individual skill; decays |
| Planning tool with required fields (variation points, unknowns, dependencies) | Prevention | 4 | All decompositions via the tool |

---

#### Error class: Missing or wrong success criteria

**The worry**: "How will we know if this is actually done and correct? What are we going to check it against?"

**Worry surface**: number of outputs that will be evaluated against incomplete or wrong criteria. Count work items without explicitly defined criteria.

**Rate event**: every work item started without explicitly defined success criteria.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Stakeholder review of criteria before work starts | Wrong criteria caught before any work is done against them | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Planning discipline | Human review | 1 | -- |
| Planning tool requiring criteria fields | Prevention | 4 | All work with criteria via the tool |

---

#### Error class: Priority errors

**The worry**: "Are we working on what matters most right now, or are we optimizing for the wrong thing?"

**Worry surface**: value units of work done on wrong-priority items. Proxy: story points on items ranked below alternatives that were skipped.

**Rate event**: every task selection made without explicit priority criteria.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Small batch sizes | Less work done before a wrong priority is discovered and corrected | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human judgment | Human review | 1 | Situation-dependent |
| Explicit scoring criteria | Deterministic detection | 3 | Scored dimensions only |
| Deterministic queue (rule-based) | Prevention | 4 | All tasks through the queue |

---

### Work type: Grounding in reality

---

#### Error class: Reality disconnect

**The worry**: "Is what we built actually solving the problem users have, or have we drifted from their real needs?"

**Worry surface**: number of users experiencing the diverged behavior. Grows with time since last grounding event x throughput.

**Rate event**: every development cycle without grounding in user feedback.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Short iteration cycles | Less drift accumulates before each grounding event | 3 |
| Feature flags | Diverged behavior can be rolled back instantly without a new deployment | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Regular demos / user review | Human review | 1 | What participants noticed |
| Metrics / telemetry | Deterministic detection | 3 | Measured behaviors only |
| A/B testing infrastructure | Deterministic detection | 3 | Tested variants |
| Outcome-based planning with measurement gates | Prevention | 4 | All work with defined outcome gates |

---

## Domain: Evaluation and Oversight

*These responsibilities are themselves assurance mechanisms. The question is what level they operate at.*

---

### Work type: Evaluating outputs

#### Error class: Bad output accepted

**The worry**: "Is this output correct, or are we about to deploy something wrong into the product?"

**Worry surface**: number of downstream consumers of the bad output -- the systems, users, and decisions that inherit it.

**Rate event**: every output evaluation without structured criteria.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Modular output consumers (outputs feed narrow, independent systems) | A bad output affects fewer downstream systems | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human review | Human review | 1 | Whatever human noticed |
| LLM-as-judge (single run) | Non-deterministic guardian | 2 | Probabilistic; may share AI biases |
| LLM-as-judge (multi-run, adversarial) | Non-deterministic guardian | 2-3 | Improves with adversarial variation |
| Automated eval against defined criteria | Deterministic detection | 3 | Criteria-covered behaviors |
| Criteria coverage tool | Prevention | 4 | All criteria through the tool |

---

### Work type: Monitoring system health

#### Error class: Drift not detected

**The worry**: "Is the system slowly getting worse in ways nobody is noticing until it's a crisis?"

**Worry surface**: accumulated drift x time-to-detection. Proxy: cycles without active monitoring.

**Rate event**: every development cycle without active health monitoring.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Short feedback loops | Less drift accumulates before each detection cycle | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human situational awareness | Human review | 1 | What team notices |
| AI drift guardian | Non-deterministic guardian | 2 | Broader; probabilistic |
| Metrics + alerts | Deterministic detection | 3 | Measured metrics only |
| Drift to deterministic check pipeline | Bootstrapped to 3 | Systematic improvement |

---

### Work type: Overseeing development steps and cycles

#### Error class: Bad step or cycle accepted

**The worry**: "Did that step actually work correctly, or did something silently go wrong that everything else is now building on?"

**Worry surface**: all work built on top of the bad step. Grows with each subsequent step.

**Rate event**: every step executed without verification gates.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Small steps with fast feedback | Less work built on top of a bad step before it is caught | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human reads every step | Human review | 1 | Decays with throughput |
| Automated health check at boundary | Deterministic detection | 3 | What health check covers |
| Deterministic pass/fail gate per step | Prevention | 4 | All work through the gate |

---

### Work type: Making escalation decisions

#### Error class: Work continues past safe boundary

**The worry**: "Did the AI keep going past the point where I should have been consulted? How much did it do that I didn't intend?"

**Worry surface**: number of actions taken past the safe boundary. Count autonomous decisions made after the boundary was crossed.

**Rate event**: every autonomous decision point without explicit halt conditions.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Narrow task scope (AI given small, bounded tasks) | Fewer autonomous decisions per invocation; smaller maximum overshoot | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Human checks in | Human review | 1 | Depends on attention |
| Agent detects uncertainty and flags | Non-deterministic guardian | 2 | Misses confident-but-wrong |
| Deterministic halt conditions (circuit breakers) | Prevention | 4 | All conditions in the rule set |

**Gap condition**: even one uncaught event can be high-cost. Probabilistic detection alone is insufficient.

---

## Domain: Operations

### Work type: Deploying and operating infrastructure

#### Error class: Deployment failure

**The worry**: "Did the deployment break something in production? How many users are affected right now?"

**Worry surface**: number of customers affected during the failure window.

**Rate event**: every deployment without automated verification.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Canary deployments / blue-green | Failure affects a small cohort before full rollout | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Manual deployment with review | Human review | 1 | Whatever human checked |
| CI/CD pipeline | Deterministic detection | 3 | What pipeline checks |
| Idempotent declarative deployments | Prevention | 4 | All deployments through the system |

**Reversibility**: automated rollback makes failures cheap to recover from.

---

#### Error class: Configuration drift

**The worry**: "Is the environment still what we think it is, or has it drifted from what we last configured?"

**Worry surface**: number of environment differences from the desired state. Directly countable with IaC diff.

**Rate event**: every environment change made outside declarative management.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Immutable infrastructure | Environments cannot drift; they are replaced, not modified | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Manual audits | Human review | 1 | Occasional |
| Infrastructure as Code | Deterministic detection | 3 | Declared infrastructure |

---

## Domain: Process Governance

### Work type: Designing and enforcing process

#### Error class: Process not followed

**The worry**: "Did the AI (or developer) skip steps that are there for a reason, and now we're in a state we didn't intend?"

**Worry surface**: number of work products that bypassed process controls in a period. Countable from audit logs.

**Rate event**: every workflow execution without enforcement gates.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Modular process (each step is independent and gated) | A bypassed step cannot silently affect subsequent steps | 3 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Process documentation + peer review | Human review | 1 | Discipline-based; decays |
| CI/CD gates | Deterministic detection | 3 | What CI checks cover |
| Deterministic workflow orchestration | Prevention | 4 | All work through the workflow |

---

### Work type: Defining and enforcing boundaries

#### Error class: AI acts outside delegated scope

**The worry**: "Did the AI touch something it wasn't supposed to? What did it change that I didn't ask for?"

**Worry surface**: files or systems touched beyond authorized scope. Directly countable from access logs or git diff.

**Rate event**: every autonomous action in an insufficiently bounded system.

**Scope-shrinking options**:

| Option | Effect | Level |
|--------|--------|-------|
| Narrow task scope (AI given minimal file/system access per task) | Possible overshoot surface is small by construction | 4 |
| Tooling restrictions (file-type, read-only access) | AI cannot act outside scope regardless of intent | 4 |

**Efficiency options**:

| Option | Type | Level | Scope |
|--------|------|-------|-------|
| Written boundary documentation | Human review | 1 | Requires AI to read and follow |
| Workflow enforcement of boundary | Prevention | 4 | All work through the workflow |

**Gap condition**: no level 2-3 intermediate exists -- either the tools enforce it or they don't.

---

## Open Question for Arlo

@human: **Coverage gaps and worry surface.** I removed "coverage gaps" as a standalone error class. My reasoning: a coverage gap reduces the effective assurance level of the efficiency mechanism (tests), but does not create its own worry surface. The worry surface belongs to whatever error the gap fails to catch -- and the affected customers. Coverage quality appears as an effective-level qualifier in the efficiency options tables (e.g., "recipe-based tests with comprehensive coverage: effective level 3; ad hoc tests: effective level 2"). Does this framing work, or is there a worry surface for gaps I am not seeing?

---

## Summary: Total Vigilance Cost Profile

| Work type | Error class | Worry surface (what to count) | Min viable | Target |
|-----------|------------|-------------------------------|------------|--------|
| Adding new behavior | Capability regression | Callers + customers affected | Level 3 (recipe tests) | Level 3 + decoupling |
| Adding new behavior | Adaptability reduction | Module coupling depth | Level 3 (Nullables/hex) | Level 5 (functional/template) |
| Evolving the design | Capability regression | Callers + customers | Level 3 (tests) | Level 5 (AST tools) |
| Evolving the design | Adaptability regression | Modules using abstraction | Level 2 (critique) + reversibility | Level 3 (linters) + reversibility |
| Evolving the design | Test duplication | Mock-heavy tests | Level 3 (Nullables) | Level 5 (recipe workflow) |
| Making intent visible | Partial rename | Callsites not updated | Level 4 (type system) | Level 5 (AST tools) |
| Building shared vocabulary | Domain model corruption | Diverged domain concepts | Level 2 (domain docs) | Level 4 (planning tool) |
| Making behavior predictable | Behavioral inconsistency | User journeys affected | Level 2 (design system) | Level 4 (enforced design system) |
| Architectural decisions | Decision inconsistency | Code areas with violated assumptions | Level 2 (ADRs) | Level 4 (planning tool) |
| Architectural decisions | Drift | Violations in codebase | Level 2 (guardian) | Level 3 (linters) |
| Planning | Ungrounded goals | Unvalidated story points | Level 4 (planning tool) | Level 4 |
| Planning | Missing criteria | Work items without criteria | Level 3 (stakeholder review) | Level 4 |
| Grounding | Reality disconnect | Users experiencing diverged behavior | Level 3 (metrics) | Level 4 (outcome gates) |
| Evaluating outputs | Bad output accepted | Downstream consumers | Level 2 (LLM judge) | Level 3 (eval framework) |
| Oversight | Bad step accepted | Work built on bad step | Level 3 (health check) | Level 4 (gate) |
| Escalation | Work past boundary | Actions past boundary | Level 4 (circuit breakers) | Level 4 |
| Deploying | Configuration drift | Environment differences | Level 3 (IaC) | Level 4 (immutable) |
| Process | Process bypassed | Bypasses per period | Level 3 (CI gates) | Level 4 (workflow code) |
| Boundaries | AI outside scope | Files/systems touched out of scope | Level 4 (tooling) | Level 4 |
