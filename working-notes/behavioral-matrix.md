# Behavioral Matrix — Product Facets and Safety Dimension

*Draft v6 — "safety" replaces "assurance"; careless safety ladder; reversibility folded into scope-shrinking; agency delegation path per work type.*

Purpose: map all types of product work to their vigilance requirements and the safety investments that make careless work safe.

---

## How to Read This Document

**The worry**: the gut-check developers feel — named for what experienced developers recognize when they encounter this work type.

**Worry surface**: the scope of existing product a single instance of this error can affect. Quantifiable -- something we can count for our specific product.

**Rate event**: the specific event that triggers this worry. Toil is paid every time this event occurs.

**Vigilance toil = rate events/period x (worry surface x safety gap)**

Safety options either reduce the worry surface (fewer things at risk per event) or close the safety gap (cheaper to protect each unit). Both are on the careless safety ladder.

**Tests are safety mechanisms, not work types.** Their quality (structure, coverage, duplication, environment coupling) determines their effective safety level.

**Product facets and work types**: work is organized by what facet is being improved. Improving one facet always risks degrading others. Worries are many-to-many.

---

## The Careless Safety Ladder

How careless can an implementor be and still achieve safety? Higher levels mean more carelessness is tolerated.

| Level | Name | What it means |
|-------|------|---------------|
| 5 | **Carefree** | The system makes the right action easy and mistakes structurally hard. Careless implementors thrive. |
| 4 | **Prevention** | Mistakes cannot propagate past the originator. Careless is fine within well-defined scopes. |
| 3 | **Deterministic** | Known worries are reliably caught. Careless is fine for covered ones, but boundaries are fuzzy and require care. |
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

*Work that directly improves the product across its seven facets. Architectural decisions -- which determine the system's long-term adaptability and consistency -- are part of Evolving the design and Making behavior predictable at the system level, not a separate category.*

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

#### Worry: Capability regression

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
| AI exploratory testing (edge-case tests after change) | Probabilistic | Findings become permanent test guards; see [AI Problem Scout Pipeline](#ai-problem-scout-pipeline) |
| AI change-impact analysis (untested behaviors, invariants, negative cases) | Probabilistic | Targets specific change surface |
| Unit tests (ad hoc) | Deterministic | Tested behaviors; effective level drops with coverage gaps |
| Unit tests (recipe-based, comprehensive coverage) | Deterministic | Recipe-defined coverage; predictable gaps remain |
| Property-based / mutation testing | Deterministic | Structural properties |
| Theorem provers | Prevention | Formally specified invariants only |

**Gap condition**: expensive in any codebase where components have more than a few callers. Grows with caller count and customer base.

---

#### Worry: Adaptability reduction in touched code

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

#### Worry: Consistency violation in touched code

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

Note: this work type can reach A3 ahead of others because AST tools provide Carefree-level safety for the primary worry.

---

#### Worry: Capability regression (accidental behavior change)

**The worry**: "Did my restructuring change what the code actually does, even slightly?"

→ See *Capability regression* in *Adding new behavior* for worry surface, rate event, and full options.

Additional scope-shrinking specific to this work type:

| Option | Effect | Safety level |
|--------|--------|-------------|
| AST-based refactoring tools only (no edit-file) | Behavioral safety guaranteed by tool; wrong structural choices undone as cheaply as made | Carefree |

---

#### Worry: Adaptability regression in other areas (design regression)

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

#### Worry: Consistency violation (structural breakage)

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

#### Worry: Adaptability reduction in vigilance mechanisms (test duplication)

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

#### Worry: Capability regression (renames that change behavior)

→ See *Capability regression* in *Adding new behavior*. Rare here but applies for symbols called via reflection.

---

#### Worry: Consistency violation (partial rename)

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

#### Worry: Documentation-code misalignment

**The worry**: "Does our documentation -- READMEs, how-to guides, API docs, architecture diagrams, decision records, any of it -- still describe what the system actually does? When docs and code disagree, which one is right?"

**Worry surface**: number of documented concepts, behaviors, or structures whose documentation no longer matches reality. Countable by auditing docs against the current system for each documented item.

**Rate event**: every change to code or system behavior not reflected in documentation, or every doc update not reflected in code.

**Note**: resolution is bidirectional. Sometimes code evolved correctly and docs need updating. Sometimes docs reflect intended design and code needs correcting. The error is the misalignment, not the direction.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Fewer, well-bounded documented items | Smaller surface of docs to keep in sync | Deterministic |
| Modular design (narrow responsibilities per documented item) | Docs stay accurate longer; each change affects fewer doc surfaces | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Human review of docs vs. code | Vigilance | When someone thinks to check |
| AI alignment scan (compare docs to code; surface discrepancies) | Probabilistic | Findings become permanent linter rules or workflow gates; see [AI Problem Scout Pipeline](#ai-problem-scout-pipeline) |
| Architecture linters (check structural intent vs. code) | Deterministic | Configured rule set |
| Doc update embedded in planning workflow | Deterministic | All changes that touch a documented item |
| Automated doc-code alignment tool | Prevention | All items covered by the tool |
| Auto-generated documentation (docs derived from code annotations, tests, or living-doc tools; regenerated on every change) | Prevention | All items expressible in generated form -- including API docs, behavior docs from tests, compliance docs from test results, governance reports |

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

#### Worry: Capability regression

→ See *Capability regression* in *Adding new behavior*. Renaming and restructuring carry the same risk.

---

#### Worry: Domain model corruption

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

#### Worry: Capability regression

→ See *Capability regression* in *Adding new behavior*. Logging code can introduce bugs or performance degradation.

---

#### Worry: Security violation (logs expose sensitive data)

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

#### Worry: Behavioral inconsistency

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

#### Worry: Structural breakage

→ See *Structural breakage* in *Evolving the design*. Same entry: interface change without updating all consumers.

---

#### Worry: Decision inconsistency

**The worry**: "Does this architectural decision contradict something we decided six months ago? Are we building on conflicting assumptions?"

**Worry surface**: number of code areas that make assumptions about the violated decision.

**Rate event**: every architectural decision made without consulting prior decisions.

**Scope-shrinking options:**

| Option | Effect | Safety level |
|--------|--------|-------------|
| Modular architecture (clean seams) | Inconsistent decisions stay contained; cannot cascade to other modules | Deterministic |
| Architectural experiments (prove before committing) | Wrong experiments affect only experimental scope | Deterministic |

**Efficiency options:**

| Option | Safety level | Scope |
|--------|-------------|-------|
| Tribal knowledge | Vigilance | Whatever team remembers |
| Architecture Decision Records (ADRs) | Probabilistic | Written; requires active reference |
| ADR review in planning workflow | Deterministic | All decisions in planning scope |
| Planning tool requiring ADR reference | Prevention | All decisions via the tool |

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

#### Worry: Capability regression

→ See *Capability regression* in *Adding new behavior*. Security controls that are too restrictive break features.

---

#### Worry: Security regression (new security code introduces vulnerability)

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

#### Worry: Ungrounded goals

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

#### Worry: Decomposition gaps

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

#### Worry: Missing or wrong success criteria

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

#### Worry: Priority errors

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

#### Worry: Reality disconnect

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

#### Worry: Deployment failure

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

#### Worry: Configuration drift

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

#### Worry: Evaluation coverage gap

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
| LLM-as-judge (adversarial, multi-run) | Probabilistic | Findings drive deterministic eval criteria; see [AI Problem Scout Pipeline](#ai-problem-scout-pipeline) |
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

#### Worry: Monitoring blind spot

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
| AI problem scout | Probabilistic | Finds candidate blind spots; see [AI Problem Scout Pipeline](#ai-problem-scout-pipeline) |
| Deterministic monitoring guards (one per class the scout found) | Deterministic | All problem classes with guards; see [AI Problem Scout Pipeline](#ai-problem-scout-pipeline) |
| Metrics + alerts | Deterministic | Measured metrics only |

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

#### Worry: Oversight mechanism gap

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

#### Worry: Missing escalation conditions

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

#### Worry: Process enforcement gap

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

#### Worry: Scope enforcement gap

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

| Work type | Worry | Worry surface (what to count) | Minimum safe | Target |
|-----------|------------|-------------------------------|--------------|--------|
| Adding new behavior | Capability regression | Callers + customers | Deterministic | + Carefree scope-shrinking |
| Adding new behavior | Adaptability reduction | Coupling depth / mock count | Deterministic (Nullables) | Carefree (functional/template) |
| Evolving the design | Accidental behavior change | Callers + customers | Deterministic | Carefree (AST tools) |
| Evolving the design | Design regression | Modules using abstraction | Probabilistic + reversibility | Deterministic + reversibility |
| Evolving the design | Test duplication | Mock-heavy test count | Deterministic (Nullables) | Carefree (recipe workflow) |
| Making intent visible | Partial rename | Callsites not updated | Prevention (type system) | Carefree (AST tools) |
| Building shared vocabulary | Domain model corruption | Diverged domain concepts | Probabilistic (domain docs) | Prevention (planning tool) |
| Making behavior predictable | Behavioral inconsistency | User journeys affected | Probabilistic (design system) | Prevention (enforced) |
| Making intent visible | Documentation-code misalignment | Documented items out of sync | Probabilistic (AI scan) | Deterministic (linters + workflow) |
| Making behavior predictable | Decision inconsistency | Code areas with violated assumptions | Probabilistic (ADRs) | Prevention (planning tool) |
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

---

## Patterns

General-applicability patterns that appear across multiple worries and work types. Each is a structural approach to achieving a safety level — not a single tool, but a reusable mechanism.

---

### AI Problem Scout Pipeline {#ai-problem-scout-pipeline}

**The problem**: many worry domains are too large to enumerate upfront. You cannot write comprehensive deterministic guards before you know what classes of problems exist.

**The pattern**: run a probabilistic AI scout continuously to find new problem instances. When the scout finds something, abstract it into a named problem class and build a deterministic guard for that class. The scout then shifts focus to what the guards don't yet cover. Over time, guards accumulate and the deterministic zone expands.

**The two rows**: every option table where this pattern applies has two entries:
- *AI problem scout* — Probabilistic. Finds new candidate classes. Without the workflow below, this row alone stays Probabilistic.
- *Deterministic guards from scout findings* — Deterministic. Each guard covers one class permanently.

**The workflow**: (1) Scout finds a candidate problem instance. (2) Human (or AI) abstracts it into a named class. (3) A deterministic check — test, alert, linter rule, gate — is written for that class. (4) The guard joins the permanent check pipeline. (5) Scout runs again, now focusing on what guards don't cover.

**Applies to**: monitoring blind spots, evaluation coverage gaps, capability regression (via exploratory testing that becomes permanent tests), documentation-code misalignment (via AI alignment scans that become linter rules or workflow gates), decision inconsistency.

---

### Determinism Sandwich {#determinism-sandwich}

**The problem**: AI given unconstrained access has an unbounded mistake space.

**The pattern**: wrap AI creative work between deterministic code on both sides. Deterministic pre-processing molds the input space — scoping context, preparing scaffolding, selecting tools, constraining the decision surface to just the creative question. The AI makes the creative decision. Deterministic post-processing executes and validates the output — expanding templates, running checks, verifying invariants, integrating with the rest of the system.

**The safety effect**: AI's surface of possible mistakes is bounded on both sides. The AI cannot corrupt what it cannot touch. Deterministic code handles the dangerous operations.

**Applies to**: code generation (deterministic scaffold → AI writes function body → deterministic expansion), migration creation (architecture inputs → AI defines migration → deterministic execution library), test scaffolding (recipe injection → AI writes test scenarios → recipe validation), planning (workflow field requirements → AI thinking → deterministic completion check).

---

### Narrow Tools {#narrow-tools}

**The problem**: general-purpose tools (edit-file, raw git, arbitrary writes) make every part of the system reachable from every agent.

**The pattern**: give each agent only the minimal tools for its current task. A refactoring agent gets AST tools but no edit-file. A planning agent gets a planning tool, not free-form notes. A git-using agent gets a movement tool that enforces branching rules, not raw git. Each tool gap is a class of mistakes that becomes structurally impossible.

**The safety effect**: Prevention (4) or Carefree (5) within the constrained scope — the agent cannot make certain mistakes because the tools for those mistakes don't exist in its world.

**Applies to**: capability regression via refactoring (AST tools), consistency violation via architecture decisions (planning tool), scope enforcement gap (file-type and access restrictions), deployment failure (declarative deployment tools instead of scripted commands).

---

### Fork and Specialize {#fork-and-specialize}

**The problem**: a single agent cannot simultaneously implement a feature, critique the design, define correctness criteria, and check for security issues — the roles conflict and bias each other.

**The pattern**: share a context-loading phase between multiple agent invocations. After the shared read, fork: each agent gets the same starting memory but different tools, goals, and perspectives. Agents are blind to each other's post-fork thinking. Pit their independent outputs against each other — disagreements surface genuine uncertainty or risk.

**The safety effect**: Probabilistic (2) to Deterministic (3) depending on the number of forks and how outputs are reconciled. Independent forks share AI biases less than a single agent switching roles.

**Applies to**: adaptability regression (design critique fork vs. implementation fork), evaluation coverage gaps (adversarial judge forks run with different prompts), capability regression (correctness-criteria fork runs before the implementation fork and constrains it), decision inconsistency (independent architecture review fork).

---

### Scope Limiter {#scope-limiter}

**The problem**: reducing the probability of a mistake is hard; reducing the scope of impact when one occurs is often much easier.

**The pattern**: before delegation, bound what can go wrong. Feature flags route only a canary cohort to new behavior. Narrow task scope limits how far an agent can go before a human checkpoint. Immutable infrastructure replaces rather than patches. The `.skip.until()` marker prevents a test-writing agent from attempting premature implementation. The mistake rate stays constant; the worry surface shrinks.

**The safety effect**: Prevention (4) — mistakes cannot propagate past the defined scope boundary.

**Applies to**: capability regression (feature flags, canary deployments), deployment failure (canary), missing escalation conditions (narrow task scope as circuit breaker), scope enforcement gap (tooling restrictions on file and system access).

---

### Nullables Pattern {#nullables-pattern}

**The problem**: mock-based testing couples tests to implementation details, making the codebase fragile to change. The mock count is a direct proxy for future change cost.

**The pattern**: wrap dependencies behind interfaces satisfiable by either a real implementation or a lightweight in-memory stand-in. Tests use the stand-in without mocking. When the dependency changes, tests don't break because they never depended on mock setup. The coupling count — the primary worry surface for adaptability reduction — approaches zero.

**The safety effect**: Deterministic (3) for adaptability in touched code; Carefree (5) for test structure when combined with Test Recipe Workflow.

**Applies to**: adaptability reduction in touched code, adaptability reduction in vigilance mechanisms (test duplication), consistency violation in code.

---

### Test Recipe Workflow {#test-recipe-workflow}

**The problem**: AI defaults to mock-based, structurally duplicated tests and will not reach for better patterns without explicit guidance — the default produces the duplication problem at scale.

**The pattern**: inject a deterministic recipe at test-write time that specifies structure — which helpers to use, which dependencies to substitute, how to name scenarios. The AI follows the recipe rather than generating from its default pattern. The recipe is debugged once and applied consistently. Combine with Nullables to eliminate the need for mocks entirely.

**The safety effect**: Prevention (4) for all tests written through the tool; Carefree (5) for the structural properties the recipe governs.

**Applies to**: adaptability reduction in vigilance mechanisms (test duplication), consistency violation in code, capability regression (recipe-level coverage definition).

---

### Progressive Structure {#progressive-structure}

**The problem**: a complex recurring output has variable content (AI's job) and fixed structure (deterministic code's job), but the structure is not obvious at the start.

**The pattern**: begin with AI generating loose content; observe what parts always take the same shape; encode that shape as a template or schema; have AI fill only the variable parts; assemble deterministically. Each structuring step moves a class of decisions from probabilistic to deterministic. Repeat until AI is responsible only for genuinely variable content.

**The safety effect**: moves from Hope (0) toward Prevention (4) as more structure is encoded.

**Applies to**: consistency violation in output structure, documentation-code misalignment (doc generation), process enforcement gap (workflow structure), decision inconsistency (planning structure).

---

### Defect Stream Feedback Loop {#defect-stream-feedback-loop}

**The problem**: defects are treated as individual events rather than signals about systemic hazards.

**The pattern**: when something fails, don't just fix the instance — find the hazard that made the mistake likely. Make it slightly less likely, slightly smaller in impact, or slightly easier to detect. Apply this to every defect. Small investments compound over time. AI enables the consistency required: the same workflow fires for every defect, with no human fatigue or drift.

**The safety effect**: each improvement permanently moves the relevant worry from a lower safety level to a higher one for that defect's class.

**Applies to**: any worry across any work type. This is the general mechanism for systematically improving safety levels over time and expanding the deterministic zone.

---

### Dead Drops {#dead-drops}

**The problem**: synchronous agent-to-agent call chains are hard to pause, inspect, or redirect — a bad output propagates immediately to the next step.

**The pattern**: agents communicate via fully async message passing rather than synchronous calls. Each agent deposits its output into a named location; the orchestration layer routes it to the next agent independently. Every deposit point is a potential inspection or redirection point. A human can pause at any drop, examine the state, and redirect before the next agent fires.

**The safety effect**: Prevention (4) for oversight mechanism gap — bad outputs can be caught at every drop point before propagating.

**Applies to**: oversight mechanism gap, scope enforcement gap, missing escalation conditions, any multi-agent pipeline where intermediate results need to be inspectable.





