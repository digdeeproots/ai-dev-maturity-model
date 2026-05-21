# Safety Matrix — Data Schema and Component Plan

*Planning document. Describes the JSON files and Vue components needed to encode and display the behavioral matrix data. Data section is detailed (schemas + examples). Code section is broad (names and responsibilities).*

---

## Context: How the Existing Model Works

The existing model uses five JSON files in `model/`, imported at compile time via the `useModelData` composable. Data flows: JSON → TypeScript interfaces → composable reactive refs → views + components. Markdown fields are rendered on demand via `useMarkdown`. Navigation: OverviewView → PrimaryAxisView (agency axis + responsibility matrix) | FateChoiceDetailView.

The new safety matrix is a parallel structure — a second major viewer alongside the agency axis viewer. It does not replace the existing files; it adds new ones. These new files are intended as the v0.2 model; a future step will remove the prior model entirely once the new viewer is complete and validated.

---

## New JSON Files

Three new files in `model/`:

| File | Purpose |
|------|---------|
| `safety_ladder.json` | The 6 levels of the careless safety ladder |
| `work_types.json` | Domains containing their work types, with agency paths and worry refs |
| `worries.json` | Worry definitions with options for addressing each |

---

## File 1: `safety_ladder.json`

Defines the 6-level careless safety ladder. Used as a reference by all option tables.

### TypeScript Interface

```typescript
export interface SafetyLevel {
  level: number          // 0–5
  name: string           // "Hope" | "Vigilance" | "Probabilistic" | "Deterministic" | "Prevention" | "Carefree"
  what_it_means: string  // one-sentence description
  can_reach_zero_vigilance: boolean
}

export interface SafetyLadderData {
  levels: SafetyLevel[]
}
```

### Example

```json
{
  "levels": [
    {
      "level": 5,
      "name": "Carefree",
      "what_it_means": "The system makes the right action easy and mistakes structurally hard. Careless implementors thrive.",
      "can_reach_zero_vigilance": true
    },
    {
      "level": 4,
      "name": "Prevention",
      "what_it_means": "Mistakes cannot propagate past the originator. Careless is fine within well-defined scopes.",
      "can_reach_zero_vigilance": true
    },
    {
      "level": 3,
      "name": "Deterministic",
      "what_it_means": "Known worries are reliably caught. Careless is fine for covered ones.",
      "can_reach_zero_vigilance": false
    },
    {
      "level": 2,
      "name": "Probabilistic",
      "what_it_means": "Errors are sometimes caught. Careless is sometimes fine.",
      "can_reach_zero_vigilance": false
    },
    {
      "level": 1,
      "name": "Vigilance",
      "what_it_means": "Errors are caught only when someone is paying attention. Careless is never fine.",
      "can_reach_zero_vigilance": false
    },
    {
      "level": 0,
      "name": "Hope",
      "what_it_means": "No mechanism exists. Errors propagate undetected.",
      "can_reach_zero_vigilance": false
    }
  ]
}
```

---

## File 2: `work_types.json`

Domains containing their work types. Each work type includes its description, business stake, agency delegation path, and the ordered list of worries that apply to it. Worry definitions are in `worries.json`; this file only references them by ID.

Each worry ref may include a `context_note` specific to this work type and `additional_scope_shrinking` options relevant to this context.

### TypeScript Interface

```typescript
export interface AgencyPathEntry {
  agency_level: string        // "A1" | "A2" | "A3" | "A4"
  label: string               // "AI assists" | "AI executes, human reviews" | etc.
  description: string         // what this looks like for this work type
  safety_required: string     // plain text: "No minimum" or "Capability regression: Deterministic"
}

export interface SafetyOption {
  name: string
  safety_level: number          // 0–5 (matches safety_ladder.json levels)
  safety_level_note?: string    // qualifier on the level, e.g., "Bootstrapped"
  // scope-shrinking options use "effect"; efficiency options use "scope"
  effect?: string               // scope-shrinking: what it does to the worry surface
  scope?: string                // efficiency: what the option covers
}

export interface WorryRef {
  worry_id: string
  context_note?: string                         // work-type-specific note shown alongside the entry
  additional_scope_shrinking?: SafetyOption[]   // extra scope-shrinking options specific to this work type context
}

export interface WorkType {
  id: string
  name: string
  description_markdown: string
  business_stake_markdown: string
  total_toil_formula_markdown?: string
  agency_path: AgencyPathEntry[]
  worries: WorryRef[]
}

export interface BehavioralDomain {
  id: string
  name: string
  description_markdown: string
  work_types: WorkType[]
}

export interface WorkTypesData {
  domains: BehavioralDomain[]
}
```

### Example

```json
{
  "domains": [
    {
      "id": "product_work",
      "name": "Product Work",
      "description_markdown": "Work that directly improves the product across its seven facets.",
      "work_types": [
        {
          "id": "adding_new_behavior",
          "name": "Adding new behavior",
          "description_markdown": "Adding new behavior, fixing defects, implementing requirements.",
          "business_stake_markdown": "The most visible work, but capability delivered on an adaptability-poor codebase degrades every other facet with each release.",
          "total_toil_formula_markdown": "throughput × (capability regression cost + adaptability reduction cost + consistency violation cost)",
          "agency_path": [
            {
              "agency_level": "A1",
              "label": "AI assists",
              "description": "AI suggests; human executes and reviews every line",
              "safety_required": "No minimum"
            },
            {
              "agency_level": "A2",
              "label": "AI executes, human reviews",
              "description": "AI writes complete modules; human reviews outcomes",
              "safety_required": "Capability regression: Deterministic"
            },
            {
              "agency_level": "A3",
              "label": "AI operates in scope",
              "description": "AI implements features autonomously within task boundaries",
              "safety_required": "Capability regression: Prevention or Carefree scope-shrinking; adaptability: Deterministic"
            },
            {
              "agency_level": "A4",
              "label": "Human in the loop",
              "description": "AI implements and self-tests; human anchors scope",
              "safety_required": "All major classes: Prevention; escalation: circuit breakers"
            }
          ],
          "worries": [
            { "worry_id": "capability_regression" },
            { "worry_id": "adaptability_reduction_in_touched_code" },
            { "worry_id": "consistency_violation_in_code" }
          ]
        },
        {
          "id": "evolving_the_design",
          "name": "Evolving the design",
          "description_markdown": "Refactoring, restructuring, improving design, extracting abstractions.",
          "business_stake_markdown": "Every future pivot costs less when the design can absorb it. This is not cleanup -- it is preserving the team's ability to act on business decisions.",
          "agency_path": [
            {
              "agency_level": "A1",
              "label": "AI assists",
              "description": "AI suggests refactoring; human executes each step",
              "safety_required": "No minimum"
            },
            {
              "agency_level": "A2",
              "label": "AI executes, human reviews",
              "description": "AI executes refactoring sequences; human validates outcomes",
              "safety_required": "Capability regression: Deterministic"
            },
            {
              "agency_level": "A3",
              "label": "AI operates in scope",
              "description": "AI plans and executes multi-step design improvements",
              "safety_required": "Capability regression: Carefree (AST tools); design regression: Deterministic"
            },
            {
              "agency_level": "A4",
              "label": "Human in the loop",
              "description": "AI continuously improves design within architectural principles",
              "safety_required": "All structural classes: Carefree (AST tools)"
            }
          ],
          "worries": [
            {
              "worry_id": "capability_regression",
              "context_note": "Accidental behavior change during restructuring. Applies when edit-file is used instead of AST tools.",
              "additional_scope_shrinking": [
                {
                  "name": "AST-based refactoring tools only (no edit-file)",
                  "effect": "Behavioral safety guaranteed by tool; wrong structural choices undone as cheaply as made",
                  "safety_level": 5
                }
              ]
            },
            { "worry_id": "adaptability_regression_design" },
            { "worry_id": "consistency_violation_structural_breakage" },
            { "worry_id": "adaptability_reduction_test_duplication" }
          ]
        }
      ]
    }
  ]
}
```

---

## File 3: `worries.json`

One entry per unique worry. Each worry is defined once with its full content. Work types reference worries by ID; the viewer renders the definition in context of each referencing work type, layering in any work-type-specific context note and additional options from the worry ref.

### TypeScript Interface

```typescript
export interface Worry {
  id: string
  name: string
  worry: string                     // the gut-check statement
  worry_surface: string             // what to count; quantifiable
  rate_event: string                // the specific trigger
  note?: string                     // optional note (e.g., "resolution is bidirectional")
  gap_condition_markdown?: string   // when the unaddressed cost becomes unsustainable
  scope_shrinking_options: SafetyOption[]
  efficiency_options: SafetyOption[]
}

export interface WorriesData {
  worries: Worry[]
}
```

(`SafetyOption` is defined in the `work_types.json` section above and shared across both files.)

### Example

```json
{
  "worries": [
    {
      "id": "capability_regression",
      "name": "Capability regression",
      "worry": "Did I break something that was working? Who's going to find out in production before I do?",
      "worry_surface": "Number of callers (components, services, customer flows) that depend on the behavior that could break.",
      "rate_event": "Every time shared code changes.",
      "gap_condition_markdown": "Expensive in any codebase where components have more than a few callers. Grows with caller count and customer base.",
      "scope_shrinking_options": [
        {
          "name": "Feature flags / canary deployments",
          "effect": "Regression rolls back within minutes; affected customers limited to canary cohort",
          "safety_level": 4
        },
        {
          "name": "Decoupled architecture (no shared state, pure interfaces)",
          "effect": "Regression cannot propagate beyond the component's direct consumers",
          "safety_level": 4
        },
        {
          "name": "Functional / decoupled style (isolation is the easy default)",
          "effect": "Errors are self-contained; cross-component propagation is structurally hard",
          "safety_level": 5
        }
      ],
      "efficiency_options": [
        {
          "name": "Human code review",
          "safety_level": 1,
          "scope": "Whatever reviewer noticed"
        },
        {
          "name": "AI exploratory testing (edge-case tests after change)",
          "safety_level": 2,
          "scope": "Bootstraps to Deterministic"
        },
        {
          "name": "Unit tests (recipe-based, comprehensive coverage)",
          "safety_level": 3,
          "scope": "Recipe-defined coverage; predictable gaps remain"
        },
        {
          "name": "Theorem provers",
          "safety_level": 4,
          "scope": "Formally specified invariants only"
        }
      ]
    },
    {
      "id": "documentation_code_misalignment",
      "name": "Documentation-code misalignment",
      "worry": "Does our documentation -- READMEs, how-to guides, API docs, architecture diagrams, decision records, any of it -- still describe what the system actually does? When docs and code disagree, which one is right?",
      "worry_surface": "Number of documented concepts, behaviors, or structures whose documentation no longer matches reality.",
      "rate_event": "Every change to code or system behavior not reflected in documentation, or every doc update not reflected in code.",
      "note": "Resolution is bidirectional. Sometimes code evolved correctly and docs need updating. Sometimes docs reflect intended design and code needs correcting. The error is the misalignment, not the direction.",
      "scope_shrinking_options": [
        {
          "name": "Fewer, well-bounded documented items",
          "effect": "Smaller surface of docs to keep in sync",
          "safety_level": 3
        }
      ],
      "efficiency_options": [
        {
          "name": "Human review of docs vs. code",
          "safety_level": 1,
          "scope": "When someone thinks to check"
        },
        {
          "name": "AI alignment scan (compare docs to code; surface discrepancies)",
          "safety_level": 2,
          "scope": "Broader than rules; unpredictable"
        },
        {
          "name": "Architecture linters (check structural intent vs. code)",
          "safety_level": 3,
          "scope": "Configured rule set"
        },
        {
          "name": "Doc update embedded in planning workflow",
          "safety_level": 3,
          "scope": "All changes that touch a documented item"
        },
        {
          "name": "Auto-generated documentation (derived from code annotations, tests, or living-doc tools; regenerated on every change)",
          "safety_level": 4,
          "scope": "All items expressible in generated form -- API docs, behavior docs from tests, compliance docs from test results, governance reports"
        }
      ]
    }
  ]
}
```

---

## TypeScript Additions to `types.ts`

New interfaces to add alongside the existing ones:

```typescript
// safety_ladder.json
export interface SafetyLevel { ... }
export interface SafetyLadderData { ... }

// work_types.json (domains with embedded work types)
export interface SafetyOption { ... }
export interface AgencyPathEntry { ... }
export interface WorryRef { ... }
export interface WorkType { ... }
export interface BehavioralDomain { ... }
export interface WorkTypesData { ... }

// worries.json
export interface Worry { ... }
export interface WorriesData { ... }
```

---

## New Composable: `useSafetyData.ts`

Parallel to `useModelData.ts`. Imports the three new JSON files and exposes reactive refs plus lookup helpers:

```typescript
// Reactive refs
safetyLadder     // SafetyLevel[]
domains          // BehavioralDomain[]
worries          // Worry[]

// Helpers
getLevelByNumber(n)
getDomainById(id)
getWorkTypeById(id)
getWorkTypesByDomain(domainId)
getWorryById(id)
getWorriesForWorkType(workTypeId)
```

---

## New Views

### `SafetyMatrixView.vue`
Allows the user to survey the full model — all domains and work types — and understand the safety ladder as the interpretive framework. The safety ladder must remain accessible while the user browses work types, since it is the key for reading safety levels shown everywhere else in the viewer.

### `WorkTypeDetailView.vue`
Allows the user to fully understand one work type: why it matters to the business, how AI agency can be safely delegated at each level, and what the relevant worries are with the full set of options for addressing each. The agency delegation path and the worry detail should be readable as a connected argument — the safety requirements at each agency level refer directly to specific worries, and users should be able to follow that connection.

---

## New Components

### `SafetyLevelBadge.vue`
Renders a safety level (number + name) with color. Levels map to a gradient: Hope=deep red → Vigilance=red → Probabilistic=orange → Deterministic=yellow → Prevention=green → Carefree=blue. Used everywhere a safety level appears.

### `SafetyLadderLegend.vue`
Compact display of all 6 levels with names and one-line descriptions. Shown persistently in SafetyMatrixView and collapsible in detail views.

### `WorryCard.vue`
Full display of one worry in context of a work type: the worry statement, worry surface, rate event, optional note, scope-shrinking options, and efficiency options. Includes the work-type-specific context note and any additional scope-shrinking options from the worry ref.

### `OptionTable.vue`
Renders either a scope-shrinking or efficiency options table. Columns vary by table type. Each row includes a `SafetyLevelBadge`.

### `AgencyPathTable.vue`
Renders the agency delegation path for a work type. Rows: A1–A4. Columns: label, description, safety required.

### `WorkTypeCard.vue`
Compact representation of a work type for navigation within SafetyMatrixView. Clickable to navigate to WorkTypeDetailView.

---

## Integration with Existing Model

This viewer is built in parallel with the existing agency axis viewer and runs alongside it as a separate route. These new files are v0.2 of the overall model and are intended to eventually replace the prior model entirely. A future step will remove the existing views and data files once the new viewer is complete and validated. Until then, both run independently.

In `router/index.ts`, add:

```
/safety              → SafetyMatrixView
/safety/:workTypeId  → WorkTypeDetailView
```

The Overview landing page gets a new entry linking to `/safety` alongside the existing primary axis and fate choices links.

The new data files have no dependency on the existing `model/` files. The two models are independent.

---

## Open Question Before Encoding

**Bootstrapped safety levels**: Some options in the source material have a safety level that is not a fixed point on the ladder but a trajectory. The behavioral matrix lists one monitoring option as "Drift to deterministic check pipeline" with a safety level of "Bootstrapped to Deterministic." This means the option starts at Probabilistic coverage and systematically drives coverage up to Deterministic over time — it is not immediately effective at the higher level. The current `SafetyOption` schema handles this with a `safety_level_note` field: `safety_level: 3, safety_level_note: "Bootstrapped"` (meaning "reaches Deterministic, but via a process rather than immediately"). An alternative is a `from_level` / `to_level` pair that explicitly captures the starting point and destination. Which do you prefer?
