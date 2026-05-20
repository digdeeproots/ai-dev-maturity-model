# Alternative Model: Portfolio of Zero-Risk Zones

*Prototype — incomplete by design. Elaborates the core concept and what it makes visible.*

---

## Core Concept

Sustainability is not a dial. It is a portfolio of named, scoped guarantees. Each guarantee covers a class of mistakes — within its scope, that class becomes impossible (zero risk), not just unlikely.

Progress on sustainability is the growth of this portfolio: adding new zones, expanding existing ones, and preventing the decay of zones already established.

**Agency delegation is unlocked item by item, not in bulk.** You can safely delegate a class of work as soon as the portfolio covers the mistake classes relevant to that work. You don't need a globally high sustainability score — you need the right specific zones.

---

## What a Portfolio Item Looks Like

Each item in the portfolio has:

| Field | Example |
|-------|---------|
| **Zone name** | Behavioral safety of refactorings |
| **Mistake class covered** | Refactorings that introduce behavior changes |
| **Mechanism** | AST-based refactoring tools only; no edit-file access |
| **Scope** | All refactoring operations performed by the implementing agent |
| **Guarantee strength** | Structural prevention (zero risk within scope) |
| **What it does NOT cover** | Whether the refactoring was the right design choice |
| **Agency it unlocks** | Agent can execute refactoring steps without human review of each one |
| **Decay risk** | Low — mechanism is enforced by tooling, not discipline |

---

## Sample Portfolio (Partial)

A team at early A3 might have accumulated:

1. **Type system coverage** — type errors are caught at build time; entire class of type mismatch mistakes eliminated. Mechanism: TypeScript strict mode. Scope: all code. Does not cover: logic errors, missing cases, runtime failures.

2. **Behavioral safety of refactorings** — see above.

3. **Commit discipline** — every commit passes build, tests, and lint. No broken state reaches the branch. Mechanism: pre-commit hooks enforced by movement tool. Scope: all commits. Does not cover: whether the committed behavior is correct.

4. **Test structure recipe** — tests follow the team's recipe (Nullables for dependencies, snapshot-formatted output, business-concept assertions). Mechanism: deterministic test scaffolding tool injects recipe and reference implementations into agent context. Scope: any test-writing invocation. Does not cover: whether the tests identify the right behaviors.

5. **Migration data safety** — database migrations always produce an archive and a bidirectional remapping; no data loss is possible. Mechanism: migration framework (deterministic) handles execution; agent only provides the mapping definition. Scope: all migrations. Does not cover: whether the mapping is semantically correct.

**Uncovered areas (vigilance still required):**
- Design quality of the chosen approach
- Semantic correctness of migration mappings
- Test behavior selection (are we testing the right things?)
- Architecture drift over time

---

## What This Model Makes Visible

- **Which mistake classes are covered** — not "how safe are we overall" but "what can go wrong that we haven't addressed?"
- **Which specific investments unlock which agency delegations** — traceable, not abstract
- **Whether progress is real** — you either have the zone or you don't; no self-reported position on a dial
- **Decay risk** — each zone has a mechanism; mechanism types have different decay profiles (structural = low decay; discipline-based = high decay)
- **The gap between agency level and portfolio coverage** — you can see directly whether a team has the portfolio items required for their current agency level

---

## What a Portfolio Progress View Might Look Like

For each responsibility (from the responsibility matrix), two columns:
- Work: who performs it (agency axis)
- Assurance: which portfolio item covers it (or: uncovered / vigilance required)

| Responsibility | Work performer | Assurance zone | Covered? |
|---------------|---------------|----------------|----------|
| Code changes | AI (A3) | Behavioral safety of refactorings | Partial — refactoring only |
| Test creation | AI (A3) | Test structure recipe | Yes |
| Migrations | AI (A3) | Migration data safety | Yes |
| Architecture | Human (A3) | — | Uncovered |
| Success criteria | Human (A3) | — | Uncovered |

---

## Opportunities

- **Directly actionable.** The gap between "work performed by AI" and "assurance zone exists" identifies exactly what to invest in next.
- **Honest about progress.** You can't fool yourself with a self-assessed dial position.
- **Connects sustainability to specific agency unlocks.** Teams see what they get for each investment.
- **Decay tracking.** The portfolio requires maintenance; mechanism type predicts decay risk.
- **Composable.** Zones stack; coverage expands incrementally. Matches how teams actually work.

## Challenges

- **No compact summary.** Hard to represent "portfolio state" as a single position on a visual model. The 2D grid is more compact.
- **Portfolio definition requires agreement.** What counts as a zone? Where does one zone end and another begin? Requires conventions.
- **Cross-zone interactions.** Some zones depend on others; the portfolio isn't just a list. A dependency graph may be needed.
- **Hard to compare across teams.** Team A's portfolio and Team B's portfolio may cover different mistake classes at the same "size." Comparison requires normalizing to a shared mistake taxonomy.
