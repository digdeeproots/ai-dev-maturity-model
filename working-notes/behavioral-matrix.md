# Behavioral Matrix — Product Facets and Safety Dimension

*Draft v6 — "safety" replaces "assurance"; careless safety ladder; reversibility folded into scope-shrinking; agency delegation path per work type.*

Purpose: map all types of product work to their vigilance requirements and the safety investments that make careless work safe.

---

## How to Read This Document

**The worry**: the gut-check developers feel. Each error class corresponds to a worry experienced developers recognize.

**Worry surface**: the scope of existing product a single instance of this error can affect. Quantifiable -- something we can count for our specific product.

**Rate event**: the specific event that triggers this worry. Toil is paid every time this event occurs.

**Vigilance toil = rate events/period x (worry surface x safety gap)**

Safety options either reduce the worry surface (fewer things at risk per event) or close the safety gap (cheaper to protect each unit). Both are on the careless safety ladder.

**Tests are safety mechanisms, not work types.** Their quality (structure, coverage, duplication, environment coupling) determines their effective safety level.

**Product facets and work types**: work is organized by what facet is being improved. Improving one facet always risks degrading others. Error classes are many-to-many.

---

## The Careless Safety Ladder

How careless can an implementor be and still achieve safety? Higher levels mean more carelessness is tolerated.

| Level | Name | What it means |
|-------|------|---------------|
| 5 | **Carefree** | The system makes the right action easy and mistakes structurally hard. Careless implementors thrive. |
| 4 | **Prevention** | Mistakes cannot propagate past the originator. Careless is fine within well-defined scopes. |
| 3 | **Deterministic** | Known error classes are reliably caught. Careless is fine for covered classes, but boundaries are fuzzy and require care. |
| 2 | **Probabilistic** | Errors are sometimes caught. Careless is sometimes fine. |
| 1 | **Vigilance** | Errors are caught only when someone is paying attention. Careless is never fine. |
| 0 | **Hope** | No mechanism exists. Errors propagate undetected. |

---

## Product Facets

| Facet | Work type phrase | Business stake |
|-------|-----------------|----------------|
| **Capability** | Adding new behavior | Delivering what users need. The direct reason we exist -- but without the other facets, new capability erodes everything else. |
| **Adaptability** | Evolving the design | Staying viable as the business changes. Dismissed as "cleaning up" or "technical debt," but actually preserving option value. A rigid codebase cannot absorb pivots; an adaptable one costs 10x less to redirect. |
| **Explainability** | Making intent visible | Reducing the cost of every future decision. A multiplier on the productivity of every future developer and AI agent. |
| **Abstractability** | Building the shared vocabulary | Enabling businesspeople to reason about the system directly. When code speaks the language of the domain, experts can validate behavior without a developer translation layer. |
| **Transparency** | Illuminating system behavior | Knowing what your system is doing. Every incident, investigation, and audit is faster when behavior is observable. |
| **Consistency** | Making behavior predictable | Setting and keeping promises to users. Each surprise erodes trust and increases support burden. |
| **Security** | Hardening against threats | Protecting what users trust you with. Security failures are catastrophic and irreversible. |

---

## Domain: Product Work

*Work that directly improves the product: the seven facets plus architectural decisions, which are adaptability and consistency work at the system level.*

### Work type: Adding new behavior

*Adding new behavior, fixing defects, implementing requirements.*

Business stake: the most visible work, but capability delivered on an adaptability-poor codebase degrades every other facet with each release.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests; human executes and reviews every line | No minimum |
| A2: AI executes, human reviews | AI writes complete modules; human reviews outcomes | Capability regression: Deterministic |
| A3: AI operates in scope | AI implements features autonomously within task boundaries | Capability regression: Prevention or Carefree scope-shrinking; adaptability: Deterministic |
| A4: Human in the loop | AI implements and self-tests; human anchors scope | All major classes: Prevention; escalation: circuit breakers |

---

#### Error class: Capability regression

**The worry**: "Did I break something that was working? Who's going to find out in production before I do?"

**Worry surface**: number of callers (components, services, customer flows) that depend on the behavior that could break.

**Rate event**: every time shared code changes.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Feature flags / canary deployments | Regression rolls back within minutes; affected customers limited to canary cohort | Prevention |
| Decoupled architecture (no shared state, pure interfaces) | Regression cannot propagate beyond the component's direct consumers | Prevention |
| Functional / decoupled style (isolation is the easy default) | Errors are self-contained; cross-component propagation is structurally hard | Carefree |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human code review | Vigilance | Whatever reviewer noticed |
| AI exploratory testing (edge-case tests after change) | Probabilistic | Bootstraps to Deterministic |
| AI change-impact analysis (untested behaviors, invariants, negative cases) | Probabilistic | Targets specific change surface |
| Unit tests (ad hoc) | Deterministic | Tested behaviors; effective level drops with coverage gaps |
| Unit tests (recipe-based, comprehensive coverage) | Deterministic | Recipe-defined coverage; predictable gaps remain |
| Property-based / mutation testing | Deterministic | Structural properties |
| Theorem provers | Prevention | Formally specified invariants only |

**Gap condition**: expensive in any codebase where components have more than a few callers. Grows with caller count and customer base.

---

#### Error class: Adaptability reduction in touched code

**The worry**: "Is this code going to be a nightmare to change when requirements shift next quarter?"

**Worry surface**: coupling depth of the module -- count mock dependencies or layers of coupling. Proxy for future change effort.

**Rate event**: every time code is added without design consideration.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Nullables pattern | Dependencies become swappable; coupling count drops | Deterministic |
| Hexagonal architecture (ports and adapters) | Infrastructure dependencies isolated at the boundary | Deterministic |
| Functional architecture (pure functions, explicit state) | Each function has zero hidden coupling; worry surface = function signature | Carefree |
| Nullables template auto-generated alongside each new class | Correct structure is the starting point; coupling harder to introduce than avoid | Carefree |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human review for design quality | Vigilance | Whatever reviewer noticed |
| Test recipe workflow (injected at write time, scaffolds correct structure) | Carefree | Tests written using the recipe |

Key: AI defaults to mock-based coupling. It will not reach for Nullables or Hexagonal ports unless the orchestration layer injects these patterns on every invocation.

**Gap condition**: cumulative; invisible until severe. Expensive when a large fraction of the codebase lacks clean test seams.

---

#### Error class: Consistency violation in touched code

**The worry**: "Is this consistent with how everything else works, or am I creating a surprise for the next person?"

**Worry surface**: number of developers and AI agents who will need to understand this code over its lifetime.

**Rate event**: every time code departs from established patterns.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Architecture linters | Structural violations flagged before merge | Deterministic |
| Planning tool requiring pattern reference | No new pattern introduced without acknowledging prior patterns | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Code review | Vigilance | Whatever reviewer noticed |
| Linters (style / structural rules) | Deterministic | Configured rules |

---

### Work type: Evolving the design

*Refactoring, restructuring, improving design, extracting abstractions.*

Business stake: every future pivot costs less when the design can absorb it. This is not cleanup -- it is preserving the team's ability to act on business decisions.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests refactoring; human executes each step | No minimum |
| A2: AI executes, human reviews | AI executes refactoring sequences; human validates outcomes | Capability regression: Deterministic |
| A3: AI operates in scope | AI plans and executes multi-step design improvements | Capability regression: Carefree (AST tools); design regression: Deterministic |
| A4: Human in the loop | AI continuously improves design within architectural principles | All structural classes: Carefree (AST tools) |

Note: this work type can reach A3 ahead of others because AST tools provide Carefree-level safety for the primary error class.

---

#### Error class: Capability regression (accidental behavior change)

**The worry**: "Did my restructuring change what the code actually does, even slightly?"

→ See *Capability regression* in *Adding new behavior* for worry surface, rate event, and full options.

Additional scope-shrinking specific to this work type:

| Option | Effect | Safety level |
|--------|--------|-------------|
| AST-based refactoring tools only (no edit-file) | Behavioral safety guaranteed by tool; wrong structural choices undone as cheaply as made | Carefree |

---

#### Error class: Adaptability regression in other areas (design regression)

**The worry**: "Did I choose the wrong abstraction and make future work harder for everyone?"

**Worry surface**: number of modules using the affected abstraction.

**Rate event**: every time a structural change affects a shared abstraction.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Modular architecture with clean seams | Wrong abstraction stays contained; does not cascade to neighbors | Deterministic |
| AST refactoring tooling (reversible structural changes) | Wrong abstractions undone in two commands; design decisions are low-stakes | Carefree |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human review for design quality | Vigilance | Whatever reviewer noticed |
| AI design critique fork (adversarial, independent) | Probabilistic | Finds common pattern violations |
| Architecture linters (dependency rules) | Deterministic | Configured structural rules |

No known Prevention-level mechanism for design quality in the general case.

---

#### Error class: Consistency violation (structural breakage)

**The worry**: "Did I update every single place that uses this interface, or did I miss some?"

*Distinction from capability regression: behavior change = code does something different. Structural breakage = interface changed and some consumers were not updated. Refactoring tools address both within tool scope.*

**Worry surface**: number of direct consumers of the changed interface or type.

**Rate event**: every time an interface or type contract changes.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Narrow, well-defined interfaces | Fewer consumers per interface; smaller fan-out | Deterministic |
| Decoupled architecture | Components interact via narrow contracts; breakage cannot cascade | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human review | Vigilance | Whatever reviewer noticed |
| Linter rules | Deterministic | Configured rules only |
| Language-server reference tracking (find all usages before editing) | Prevention | All references within language server scope |
| Strict type system enforced pre-commit | Prevention | All type interactions in covered code |
| AST refactoring tools (rename/move with full dependency awareness) | Carefree | All dependents within tool scope |

---

#### Error class: Adaptability reduction in vigilance mechanisms (test duplication)

**The worry**: "When I change this code, am I going to have to fix 40 tests that all break together?"

**Worry surface**: number of tests sharing setup code or mocking the same dependency.

**Rate event**: every time a test is written with mocks or duplicated setup.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Nullables pattern (eliminates mocks -- the largest duplication source) | Dependencies swappable without test rewrite; duplication source eliminated | Deterministic |
| Functional architecture (pure functions need no mocks) | Functions have no side effects to mock; worry surface approaches zero | Carefree |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human review of test quality | Vigilance | Whatever reviewer noticed |
| Test recipe tool (prevents structural duplication in new tests) | Prevention | All tests through the tool |
| Test recipe workflow injected at write time | Carefree | Tests written with the workflow |

**Gap condition**: expensive at high test volume. Grows silently alongside the test suite.

---

### Work type: Making intent visible

*Renaming, clarifying, restructuring for readability, improving inline documentation.*

Business stake: every future developer and AI agent starts with reading. Explainability reduces the cost of every subsequent decision.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests renames; human executes | No minimum |
| A2: AI executes, human reviews | AI executes renames and clarifications; human reviews | Partial rename: Prevention (type system) |
| A3: AI operates in scope | AI improves code clarity autonomously | Partial rename: Carefree (AST tools) |

---

#### Error class: Capability regression (renames that change behavior)

→ See *Capability regression* in *Adding new behavior*. Rare here but applies for symbols called via reflection.

---

#### Error class: Consistency violation (partial rename)

**The worry**: "Did I update every callsite, or are some places still using the old name?"

**Worry surface**: number of callsites not updated. Directly countable.

**Rate event**: every rename applied to a shared symbol.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Narrow symbol scope | Fewer uses = fewer places to update | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human search-and-replace | Vigilance | Whatever human searched for |
| Language-server reference tracking | Prevention | All references within language server scope |
| Strict type system (catches callsite mismatches) | Prevention | All typed callsites |
| AST refactoring tool (rename-aware) | Carefree | All callsites within tool scope |

---

### Work type: Building the shared vocabulary

*Extracting domain concepts into code, naming things after business concepts, aligning code structure to business structure.*

Business stake: when code speaks the language of the domain, experts can validate behavior without translation. Without this, every business conversation requires a developer as translator.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests domain-aligned names; human validates with experts | No minimum |
| A2: AI executes, human reviews | AI proposes domain model changes; human validates with domain experts | Domain model corruption: Probabilistic (domain docs) |
| A3: AI operates in scope | AI aligns vocabulary to domain autonomously | Domain model corruption: Deterministic (planning tool review) |

---

#### Error class: Capability regression

→ See *Capability regression* in *Adding new behavior*. Renaming and restructuring carry the same risk.

---

#### Error class: Domain model corruption

**The worry**: "Does this concept match what the businesspeople actually call it, or did I invent terminology that drifts from the domain?"

**Worry surface**: number of domain concepts in the codebase that diverge from business vocabulary.

**Rate event**: every time a new abstraction is introduced without domain validation.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Domain model documentation (glossary, entity definitions) | Provides reference; reduces unnoticed drift | Probabilistic |
| Domain review embedded in planning workflow | All new abstractions checked before implementation | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Domain expert review of new abstractions | Vigilance | What expert noticed |
| Planning tool requiring domain concept mapping | Prevention | All new concepts via the tool |

**Gap condition**: invisible until businesspeople can no longer reason about the product without translation.

---

### Work type: Illuminating system behavior

*Adding logging, instrumentation, tracing, observability.*

Business stake: every incident is cheaper when you can see what happened. Opacity is a tax on every investigation.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests logging; human adds it | No minimum |
| A2: AI executes, human reviews | AI adds observability through a module; human reviews | Security violation: Prevention (structured logging) |
| A3: AI operates in scope | AI instruments autonomously | Security violation: Prevention required |

---

#### Error class: Capability regression

→ See *Capability regression* in *Adding new behavior*. Logging code can introduce bugs or performance degradation.

---

#### Error class: Security violation (logs expose sensitive data)

**The worry**: "Am I accidentally logging a password, session token, or credit card number?"

**Worry surface**: number of customers whose sensitive data appears in accessible log streams.

**Rate event**: every time observability code touches a sensitive data path.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Structured logging with field-level classification enforcement | Sensitive fields classified at write time; unclassified fields cannot be logged | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Code review for data classification | Vigilance | Whatever reviewer noticed |
| Automated PII detection in log output | Deterministic | Detected PII patterns |

---

### Work type: Making behavior predictable

*Establishing and honoring consistent behavioral patterns across the product surface and over time.*

Business stake: consistent behavior lets users build reliable mental models. Each surprise erodes trust. Consistency is a promise; breaking it is expensive even when the reason is legitimate.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI flags inconsistencies; human corrects | No minimum |
| A2: AI executes, human reviews | AI applies consistency corrections; human reviews | Behavioral inconsistency: Deterministic |
| A3: AI operates in scope | AI maintains consistency autonomously | Behavioral inconsistency: Prevention (enforced design system) |

---

#### Error class: Behavioral inconsistency

**The worry**: "Does this behave the same way as the similar feature over there, or will users be confused when the pattern breaks?"

**Worry surface**: number of user journeys following the pattern that was violated.

**Rate event**: every time a user-facing behavior or interaction pattern changes.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Design system (documented patterns) | Reduces unnoticed divergence; not enforced | Probabilistic |
| Design system with enforcement gates | Pattern violations blocked before shipping | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Code/UX review for consistency | Vigilance | Whatever reviewer noticed |
| Automated behavioral consistency checks | Deterministic | Measurable consistency properties |

**Gap condition**: expensive as user base grows and patterns become entrenched.

---

#### Error class: Structural breakage

→ See *Structural breakage* in *Evolving the design*. Same entry: interface change without updating all consumers.

---

### Work type: Hardening against threats

*Adding authentication, authorization, input sanitization, access controls.*

Business stake: security failures are catastrophic and irreversible. One successful attack can exceed years of security investment.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests security improvements; human implements | No minimum |
| A2: AI executes, human reviews | AI implements controls; human reviews | Security regression: Deterministic (SAST) |
| A3: AI operates in scope | AI hardens within scope | Security regression: Prevention (formal models) -- A2 is the practical ceiling for most teams without formal methods |

---

#### Error class: Capability regression

→ See *Capability regression* in *Adding new behavior*. Security controls that are too restrictive break features.

---

#### Error class: Security regression (new security code introduces vulnerability)

**The worry**: "Did my auth change open a hole I am not seeing?"

**Worry surface**: number of customers and data objects accessible through the vulnerability.

**Rate event**: every time security controls are modified.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Least-privilege design (narrow scope per control) | Vulnerability scope bounded by control's narrow authority | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Security code review | Vigilance | Whatever reviewer noticed |
| Automated security scanning (SAST) | Deterministic | Known vulnerability patterns |
| Formal security models (threat modeling + verification) | Prevention | Modeled threat classes |

---

### Work type: Making architectural decisions

*Shaping the overall structure of the system: module boundaries, data flow, service boundaries, technology choices. Architectural decisions are adaptability and consistency work at the highest level of granularity -- they determine how easily every other facet can improve over time.*

Business stake: architectural decisions constrain all future decisions. The wrong architecture makes every future capability addition expensive or impossible.

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests options; human decides | No minimum |
| A2: AI proposes, human decides | AI researches and proposes; human approves | Decision inconsistency: Probabilistic (ADRs) |
| A3: AI makes tactical decisions | AI makes decisions within established principles | Decision inconsistency: Prevention (planning tool); without this, A2 is the safe ceiling |
| A4: Human in the loop | AI decides; human anchors principles | All classes: Prevention; drift: Deterministic |

---

#### Error class: Decision inconsistency

**The worry**: "Does this architectural decision contradict something we decided six months ago?"

**Worry surface**: number of code areas that make assumptions about the decision being violated.

**Rate event**: every architectural decision made without consulting prior decisions.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Modular architecture (clean seams, limited dependencies) | Inconsistent decisions stay contained; cannot cascade | Deterministic |
| Architectural experiments (prove before committing full codebase) | Wrong experiments affect only experimental scope; main codebase unaffected | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Tribal knowledge | Vigilance | Whatever team remembers |
| Architecture Decision Records (ADRs) | Probabilistic | Written; requires active reference |
| ADR review in planning workflow | Deterministic | All decisions in planning scope |
| Planning tool requiring ADR reference | Prevention | All decisions via the tool |

---

#### Error class: Architectural drift

**The worry**: "Is the code still following the architecture, or is it slowly becoming something else while nobody notices?"

**Worry surface**: number of violations of intended architecture currently in the codebase. Countable with linting tools.

**Rate event**: every code change made without checking architectural intent.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Modular architecture (strong boundaries between layers) | Drift in one module cannot cross into others | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Ad hoc review | Vigilance | Occasional; decays fast |
| AI drift guardian (scans + abstracts anomalies) | Probabilistic | Broader than rules; unpredictable |
| Architecture linters | Deterministic | Configured rule set |
| Drift to ADR pipeline | Bootstrapped to Deterministic | Systematic improvement |

---

## Domain: Planning

### Work type: Planning and scoping work

*Defining goals, decomposing into tasks, setting success criteria, and prioritizing.*

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI assists goal definition; human validates every goal | No minimum |
| A2: AI structures, human validates | AI structures plans and decomposition; human validates | Ungrounded goals: Prevention (planning tool) |
| A3: AI plans in scope | AI plans autonomously within established criteria | All planning classes: Prevention |

---

#### Error class: Ungrounded goals

**The worry**: "Are we building the right thing, or did we just assume we know what users want?"

**Worry surface**: story points committed to goals not grounded in evidence.

**Rate event**: every planning cycle where goals are assumed rather than validated.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Short iteration cycles | Less work committed before grounding event; smaller unvalidated backlog | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Planning discipline | Vigilance | Individual; decays |
| Planning tool requiring grounding source | Prevention | All goals made via the tool |

---

#### Error class: Decomposition gaps

**The worry**: "Did we think through all the tricky parts, or are there hidden surprises mid-sprint?"

**Worry surface**: number of unidentified variation points. Proxy: count named unknowns; gaps are the unnamed ones.

**Rate event**: every decomposition without structured analysis.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Explicit unknown-surfacing practice | Forces unknowns to be named; reduces hidden surprise count | Probabilistic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human judgment | Vigilance | Individual skill; decays |
| Planning tool with required fields (variation points, unknowns, dependencies) | Prevention | All decompositions via the tool |

---

#### Error class: Missing or wrong success criteria

**The worry**: "How will we know if this is actually done and correct?"

**Worry surface**: number of work items without explicitly defined success criteria.

**Rate event**: every work item started without explicitly defined criteria.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Stakeholder review of criteria before work starts | Wrong criteria caught before any work is done against them | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Planning discipline | Vigilance | -- |
| Planning tool requiring criteria fields | Prevention | All work with criteria via the tool |

---

#### Error class: Priority errors

**The worry**: "Are we working on what matters most right now?"

**Worry surface**: value units of work done on wrong-priority items.

**Rate event**: every task selection without explicit priority criteria.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Small batch sizes | Less work done on wrong priority before correction | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human judgment | Vigilance | Situation-dependent |
| Explicit scoring criteria | Deterministic | Scored dimensions only |
| Deterministic queue (rule-based) | Prevention | All tasks through the queue |

---

### Work type: Grounding in reality

*Connecting the product to actual user needs and outcomes.*

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI suggests grounding approaches; human validates | No minimum |
| A2: AI analyzes, human validates | AI analyzes metrics and user data; human validates conclusions | Reality disconnect: Deterministic (metrics) |
| A3: AI grounds autonomously | AI adjusts product direction based on evidence | Reality disconnect: Prevention (outcome gates) |

---

#### Error class: Reality disconnect

**The worry**: "Is what we built actually solving the problem users have?"

**Worry surface**: number of users experiencing the diverged behavior. Grows with throughput x time without grounding.

**Rate event**: every development cycle without grounding in user feedback.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Short iteration cycles | Less drift accumulates before grounding event | Deterministic |
| Feature flags and modular deployment | Diverged behavior rolled back or pivoted quickly | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Regular demos / user review | Vigilance | What participants noticed |
| Metrics / telemetry | Deterministic | Measured behaviors only |
| A/B testing infrastructure | Deterministic | Tested variants |
| Outcome-based planning with measurement gates | Prevention | All work with defined outcome gates |

---

## Domain: Operations

*All the work required to keep the product running: provisioning and managing systems infrastructure, deploying new versions, operating the product in production, and maintaining the environments that support it. Unlike the product facets (which improve properties of the product code) or Work on the system (which builds the development and safety apparatus), Operations keeps everything alive and available.*

### Work type: Deploying and operating infrastructure

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1 | Human runs deployment with AI assistance | No minimum |
| A2 | AI orchestrates deployment; human approves | Deployment failure: Deterministic (CI/CD) |
| A3 | AI deploys autonomously | Deployment failure: Prevention; configuration drift: Prevention |

---

#### Error class: Deployment failure

**The worry**: "Did the deployment break something in production? How many users are affected?"

**Worry surface**: number of customers affected during the failure window.

**Rate event**: every deployment without automated verification.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Canary deployments / blue-green + automated rollback | Failure affects small cohort; rollback restores good state within minutes | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Manual deployment with review | Vigilance | Whatever human checked |
| CI/CD pipeline | Deterministic | What pipeline checks |
| Idempotent declarative deployments | Prevention | All deployments through the system |

---

#### Error class: Configuration drift

**The worry**: "Is the environment still what we think it is?"

**Worry surface**: number of environment differences from desired state. Countable with IaC diff.

**Rate event**: every environment change made outside declarative management.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Immutable infrastructure | Environments cannot drift; they are replaced, not modified | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Manual audits | Vigilance | Occasional |
| Infrastructure as Code | Deterministic | Declared infrastructure |

---



## Domain: Work on the system

*Most other domains are work inside the product -- adding features, evolving design, improving quality. This domain is work on the infrastructure that makes all other work possible. The work product is the execution and safety systems themselves: orchestration, CI/CD, deployment, evaluation frameworks, monitoring, oversight mechanisms, process enforcement, and boundary controls.*

*Building these systems well makes careless work inside the product safe. Building them poorly creates hidden gaps that the other domains' safety investments cannot compensate for.*

### Work type: Building evaluation systems

*Designing criteria, evaluation frameworks, automated checks, and review processes that determine whether outputs meet quality standards.*

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1: AI assists | AI assists humans designing criteria and eval mechanisms | No minimum |
| A2: AI proposes, human validates | AI proposes evaluation criteria and mechanisms; human validates | Coverage gap: Probabilistic minimum |
| A3: AI designs in scope | AI designs and updates eval systems within quality principles | Coverage gap: Deterministic |
| A4: AI maintains autonomously | AI evolves criteria and mechanisms based on observed outcomes | Coverage gap: Prevention |

---

#### Error class: Evaluation coverage gap

**The worry**: "Does our evaluation system actually catch the problems we care about, or does it have blind spots we haven't noticed?"

**Worry surface**: all outputs produced while a gap exists, weighted by defect rate in the uncovered class. Proxy: output volume x estimated miss rate.

**Rate event**: every defect in an uncovered class that occurs while the system lacks coverage for it.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Modular output consumers | A bad output affects fewer downstream systems | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human review | Vigilance | Whatever human noticed |
| LLM-as-judge (single run) | Probabilistic | May share AI biases |
| LLM-as-judge (multi-run, adversarial) | Probabilistic to Deterministic | Improves with adversarial variation |
| Automated eval against defined criteria | Deterministic | Criteria-covered behaviors |
| Criteria coverage tool | Prevention | All criteria through the tool |

---

### Work type: Building monitoring systems

*Designing metrics, dashboards, alerts, and health checks that keep the development system's health visible.*

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1 | Human designs monitoring approach; AI assists | No minimum |
| A2 | AI proposes monitoring systems; human validates coverage | Blind spots: Probabilistic minimum |
| A3 | AI designs and maintains monitoring within principles | Blind spots: Deterministic |
| A4 | AI autonomously evolves monitoring based on observed patterns | Blind spots: Prevention |

---

#### Error class: Monitoring blind spot

**The worry**: "Is there a health dimension we are not measuring that could fail silently for weeks before we notice?"

**Worry surface**: time-to-detection x rate of problems in the unmonitored dimension. Proxy: number of health dimensions with no active metric.

**Rate event**: every health problem that occurs in an unmonitored dimension.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Short feedback loops | Less drift accumulates before detection | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human situational awareness | Vigilance | What team notices |
| AI drift guardian | Probabilistic | Broader; unpredictable |
| Metrics + alerts | Deterministic | Measured metrics only |
| Drift to deterministic check pipeline | Bootstrapped to Deterministic | Systematic improvement |

---

### Work type: Designing oversight mechanisms

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1 | Human designs all gates; AI assists with specification | No minimum |
| A2 | AI proposes gate designs; human validates coverage and thresholds | Mechanism gap: Deterministic |
| A3 | AI designs oversight systems within defined risk tolerance | Mechanism gap: Prevention |
| A4 | AI autonomously tightens or loosens gates based on observed outcomes | All mechanism classes: Prevention |

---

#### Error class: Oversight mechanism gap

**The worry**: "Does our gate actually stop the bad cases, or does it let them through while we think we are protected?"

**Worry surface**: all bad work that passes through the gap x downstream impact. Count uncovered step types.

**Rate event**: every bad step or cycle that passes through an insufficiently specified gate.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Small steps with fast feedback | Less work builds on a bad step before detection | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human reads every step | Vigilance | Decays with throughput |
| Automated health check at boundary | Deterministic | What health check covers |
| Deterministic pass/fail gate per step | Prevention | All work through the gate |

---

### Work type: Designing escalation rules

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1 | Human defines all halt conditions; AI assists | No minimum |
| A2 | AI proposes halt conditions; human validates | Missing conditions: Probabilistic |
| A3 | AI designs and encodes escalation rules within policy | Missing conditions: Prevention |

---

#### Error class: Missing escalation conditions

**The worry**: "Did the AI keep going past the point where I should have been consulted, because we forgot to define a halt condition for that situation?"

**Worry surface**: number of autonomous action categories not covered by halt conditions. Directly countable from the circuit breaker rule set.

**Rate event**: every novel situation the AI encounters with no defined halt condition.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Narrow task scope (AI given small, bounded tasks) | Fewer autonomous decisions per invocation; maximum overshoot is small | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human checks in | Vigilance | Depends on attention |
| Agent detects uncertainty and flags | Probabilistic | Misses confident-but-wrong |
| Deterministic halt conditions (circuit breakers) | Prevention | All conditions in the rule set |

**Gap condition**: even one uncaught event can be high-cost. Probabilistic alone is insufficient.

---


### Work type: Designing and enforcing process

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| A1 | AI suggests process improvements; human implements | No minimum |
| A2 | AI follows process in guided workflows; human reviews | Process: Deterministic (CI gates) |
| A3 | AI orchestrates and enforces autonomously | Process: Prevention (workflow orchestration) |

---

#### Error class: Process enforcement gap

**The worry**: "Does our process enforcement actually cover the decisions that matter, or are important rules only documented and not enforced?"

**Worry surface**: number of decision types or workflow steps without enforcement gates. Directly countable from the workflow definition.

**Rate event**: every workflow execution where a required gate is absent.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Modular process (each step independently gated) | A bypassed step cannot silently affect subsequent steps | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Process documentation + peer review | Vigilance | Discipline-based; decays |
| CI/CD gates | Deterministic | What CI checks cover |
| Deterministic workflow orchestration | Prevention | All work through the workflow |

---

### Work type: Defining and enforcing boundaries

**Agency delegation path:**

| Agency level | What it looks like | Safety required |
|---|---|---|
| Any autonomous agency | Tools enforce boundaries before any autonomous action | Prevention required; Vigilance (documentation only) is insufficient |

---

#### Error class: Scope enforcement gap

**The worry**: "Is the scope we defined for each AI agent actually enforced, or do agents have more access than they should?"

**Worry surface**: files or systems touched beyond authorized scope. Countable from access logs or git diff.

**Rate event**: every autonomous action in an insufficiently bounded system.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Narrow task scope per invocation | Possible overshoot surface is small by construction | Prevention |
| Tooling restrictions (file-type, read-only access) | AI cannot act outside scope regardless of intent | Prevention |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Written boundary documentation | Vigilance | Requires AI to read and follow |
| Workflow enforcement of boundary | Prevention | All work through the workflow |

**Gap condition**: no Probabilistic or Deterministic intermediate exists -- either tools enforce it or they don't.

---

## Summary: Worry Surfaces and Safety Minimums

| Work type | Error class | Worry surface (what to count) | Minimum safe | Target |
|-----------|------------|-------------------------------|--------------|--------|
| Adding new behavior | Capability regression | Callers + customers | Deterministic | + Carefree scope-shrinking |
| Adding new behavior | Adaptability reduction | Coupling depth / mock count | Deterministic (Nullables) | Carefree (functional/template) |
| Evolving the design | Accidental behavior change | Callers + customers | Deterministic | Carefree (AST tools) |
| Evolving the design | Design regression | Modules using abstraction | Probabilistic + reversibility | Deterministic + reversibility |
| Evolving the design | Test duplication | Mock-heavy test count | Deterministic (Nullables) | Carefree (recipe workflow) |
| Making intent visible | Partial rename | Callsites not updated | Prevention (type system) | Carefree (AST tools) |
| Building shared vocabulary | Domain model corruption | Diverged domain concepts | Probabilistic (domain docs) | Prevention (planning tool) |
| Making behavior predictable | Behavioral inconsistency | User journeys affected | Probabilistic (design system) | Prevention (enforced) |
| Architectural decisions | Decision inconsistency | Code areas with violated assumptions | Probabilistic (ADRs) | Prevention (planning tool) |
| Architectural decisions | Drift | Violations in codebase | Probabilistic (guardian) | Deterministic (linters) |
| Planning | Ungrounded goals | Unvalidated story points | Prevention (planning tool) | Prevention |
| Planning | Missing criteria | Work items without criteria | Deterministic (stakeholder review) | Prevention |
| Grounding | Reality disconnect | Users experiencing diverged behavior | Deterministic (metrics) | Prevention (outcome gates) |
| Building evaluation systems | Evaluation coverage gap | Output volume x miss rate | Probabilistic (LLM judge) | Deterministic (eval framework) |
| Designing oversight mechanisms | Mechanism gap | Uncovered step types | Deterministic (health check) | Prevention (gate) |
| Designing escalation rules | Missing conditions | Action categories without halt rules | Prevention (circuit breakers) | Prevention |
| Deploying | Deployment failure | Customers affected during failure | Deterministic (CI/CD) | Prevention (declarative) |
| Deploying | Configuration drift | Environment differences from desired | Deterministic (IaC) | Prevention (immutable) |
| Designing and enforcing process | Process enforcement gap | Decision types without gates | Deterministic (CI gates) | Prevention (workflow code) |
| Defining and enforcing boundaries | Scope enforcement gap | Agent capabilities beyond scope | Prevention (tooling) | Prevention |







