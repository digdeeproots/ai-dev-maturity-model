# Safety Matrix — Data Schema and Component Plan

*Planning document. Describes the JSON files and Vue components needed to encode and display the behavioral matrix data. Data section is detailed (schemas + examples). Code section is broad (names and responsibilities).*

---

## Context: How the Existing Model Works

The existing model uses five JSON files in `model/`, imported at compile time via the `useModelData` composable. Data flows: JSON → TypeScript interfaces → composable reactive refs → views + components. Markdown fields are rendered on demand via `useMarkdown`. Navigation: OverviewView → PrimaryAxisView (agency axis + responsibility matrix) | FateChoiceDetailView.

The new safety matrix is a parallel structure — a second major viewer alongside the agency axis viewer. It does not replace the existing files; it adds new ones.

---

## New JSON Files

Five new files in `model/`:

| File | Purpose |
|------|---------|
| `safety_ladder.json` | The 6 levels of the careless safety ladder |
| `facets.json` | The 7 product facets |
| `behavioral_domains.json` | Domains with their work type membership |
| `work_types.json` | Work types with agency paths and error class refs |
| `error_classes.json` | Error classes with worry, worry surface, rate event, and options |

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
      "what_it_means": "Known error classes are reliably caught. Careless is fine for covered classes.",
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

## File 2: `facets.json`

The 7 product facets. Defines the vocabulary for work type classification. Referenced by work_types.json via `facet_id`.

### TypeScript Interface

```typescript
export interface ProductFacet {
  id: string                    // "capability" | "adaptability" | etc.
  name: string                  // "Capability"
  work_type_phrase: string      // "Adding new behavior"
  business_stake_markdown: string
}

export interface FacetsData {
  facets: ProductFacet[]
}
```

### Example

```json
{
  "facets": [
    {
      "id": "capability",
      "name": "Capability",
      "work_type_phrase": "Adding new behavior",
      "business_stake_markdown": "Delivering what users need. The direct reason we exist -- but without the other facets, new capability erodes everything else."
    },
    {
      "id": "adaptability",
      "name": "Adaptability",
      "work_type_phrase": "Evolving the design",
      "business_stake_markdown": "Staying viable as the business changes. Dismissed as \"cleaning up\" or \"technical debt,\" but actually preserving option value. A rigid codebase cannot absorb pivots; an adaptable one costs 10x less to redirect."
    },
    {
      "id": "explainability",
      "name": "Explainability",
      "work_type_phrase": "Making intent visible",
      "business_stake_markdown": "Reducing the cost of every future decision. A multiplier on the productivity of every future developer and AI agent."
    }
  ]
}
```

---

## File 3: `behavioral_domains.json`

The 4 domains with their descriptions and ordered work type membership. Drives top-level navigation.

### TypeScript Interface

```typescript
export interface BehavioralDomain {
  id: string
  name: string
  description_markdown: string
  work_type_ids: string[]   // ordered; matches work_types.json ids
}

export interface BehavioralDomainsData {
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
      "description_markdown": "Work that directly improves the product across its seven facets. Architectural decisions -- adaptability and consistency work at the system level -- are included here, not as a separate category.",
      "work_type_ids": [
        "adding_new_behavior",
        "evolving_the_design",
        "making_intent_visible",
        "building_the_shared_vocabulary",
        "illuminating_system_behavior",
        "making_behavior_predictable",
        "hardening_against_threats",
        "deploying_and_operating"
      ]
    },
    {
      "id": "planning",
      "name": "Planning",
      "description_markdown": "Work that determines what gets built and why.",
      "work_type_ids": [
        "planning_and_scoping",
        "grounding_in_reality"
      ]
    },
    {
      "id": "operations",
      "name": "Operations",
      "description_markdown": "All work required to keep the product running: provisioning and managing systems infrastructure, deploying new versions, operating the product in production, and maintaining the environments that support it.",
      "work_type_ids": [
        "deploying_and_operating_infrastructure"
      ]
    },
    {
      "id": "work_on_the_system",
      "name": "Work on the system",
      "description_markdown": "Work on the infrastructure that makes all other work possible. The work product is the execution and safety systems themselves.",
      "work_type_ids": [
        "building_evaluation_systems",
        "building_monitoring_systems",
        "designing_oversight_mechanisms",
        "designing_escalation_rules",
        "designing_and_enforcing_process",
        "defining_and_enforcing_boundaries"
      ]
    }
  ]
}
```

---

## File 4: `work_types.json`

One entry per work type. Contains the description, business stake, total toil formula, agency delegation path, and the ordered list of error class references. Error classes are defined separately; this file only references them.

Error class refs mark whether this work type is the **canonical** (full display) or **cross-reference** (shows a link to the canonical work type). Cross-references may add a `context_note` specific to this work type.

### TypeScript Interface

```typescript
export interface AgencyPathEntry {
  agency_level: string        // "A1" | "A2" | "A3" | "A4"
  label: string               // "AI assists" | "AI executes, human reviews" | etc.
  description: string         // what this looks like for this work type
  safety_required: string     // plain text: "No minimum" or "Capability regression: Deterministic"
}

export interface ErrorClassRef {
  error_class_id: string
  is_canonical: boolean             // true = full display; false = show cross-reference link
  canonical_work_type_id?: string   // only when is_canonical = false
  context_note?: string             // work-type-specific note shown alongside the entry
  additional_scope_shrinking?: SafetyOption[]  // extra scope-shrinking options specific to this work type context
}

export interface WorkType {
  id: string
  name: string
  domain_id: string
  facet_id?: string             // null for work types not tied to a single facet
  description_markdown: string
  business_stake_markdown: string
  total_toil_formula_markdown?: string
  agency_path: AgencyPathEntry[]
  error_class_refs: ErrorClassRef[]
}

export interface WorkTypesData {
  work_types: WorkType[]
}
```

### Example

```json
{
  "work_types": [
    {
      "id": "adding_new_behavior",
      "name": "Adding new behavior",
      "domain_id": "product_work",
      "facet_id": "capability",
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
      "error_class_refs": [
        { "error_class_id": "capability_regression", "is_canonical": true },
        { "error_class_id": "adaptability_reduction_in_touched_code", "is_canonical": true },
        { "error_class_id": "consistency_violation_in_code", "is_canonical": true }
      ]
    },
    {
      "id": "evolving_the_design",
      "name": "Evolving the design",
      "domain_id": "product_work",
      "facet_id": "adaptability",
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
      "error_class_refs": [
        {
          "error_class_id": "capability_regression",
          "is_canonical": false,
          "canonical_work_type_id": "adding_new_behavior",
          "additional_scope_shrinking": [
            {
              "name": "AST-based refactoring tools only (no edit-file)",
              "effect": "Behavioral safety guaranteed; wrong structural choices undone as cheaply as made",
              "safety_level": 5,
              "safety_level_name": "Carefree"
            }
          ]
        },
        { "error_class_id": "adaptability_regression_design", "is_canonical": true },
        { "error_class_id": "consistency_violation_structural_breakage", "is_canonical": true },
        { "error_class_id": "adaptability_reduction_test_duplication", "is_canonical": true }
      ]
    }
  ]
}
```

---

## File 5: `error_classes.json`

One entry per unique error class. Each error class is defined once, with its full content. Work types reference it; the viewer renders the full entry at the canonical work type and a cross-reference link elsewhere.

### TypeScript Interface

```typescript
export interface SafetyOption {
  name: string
  safety_level: number          // 0–5 (matches safety_ladder.json levels)
  safety_level_name: string     // "Hope" | "Vigilance" | ... | "Carefree"
  safety_level_note?: string    // e.g., "Bootstrapped" for the ADR pipeline entry
  // scope-shrinking options use "effect"; efficiency options use "scope"
  effect?: string               // scope-shrinking: what it does to the worry surface
  scope?: string                // efficiency: what the option covers
}

export interface ErrorClass {
  id: string
  name: string
  canonical_work_type_id: string    // where it is fully displayed by default
  worry: string                     // the gut-check statement (no quotes in JSON)
  worry_surface: string             // what to count; quantifiable
  rate_event: string                // the specific trigger
  note?: string                     // optional note (e.g., "resolution is bidirectional")
  gap_condition_markdown?: string   // when the unaddressed cost becomes unsustainable
  scope_shrinking_options: SafetyOption[]
  efficiency_options: SafetyOption[]
}

export interface ErrorClassesData {
  error_classes: ErrorClass[]
}
```

### Example

```json
{
  "error_classes": [
    {
      "id": "capability_regression",
      "name": "Capability regression",
      "canonical_work_type_id": "adding_new_behavior",
      "worry": "Did I break something that was working? Who's going to find out in production before I do?",
      "worry_surface": "Number of callers (components, services, customer flows) that depend on the behavior that could break.",
      "rate_event": "Every time shared code changes.",
      "gap_condition_markdown": "Expensive in any codebase where components have more than a few callers. Grows with caller count and customer base.",
      "scope_shrinking_options": [
        {
          "name": "Feature flags / canary deployments",
          "effect": "Regression rolls back within minutes; affected customers limited to canary cohort",
          "safety_level": 4,
          "safety_level_name": "Prevention"
        },
        {
          "name": "Decoupled architecture (no shared state, pure interfaces)",
          "effect": "Regression cannot propagate beyond the component's direct consumers",
          "safety_level": 4,
          "safety_level_name": "Prevention"
        },
        {
          "name": "Functional / decoupled style (isolation is the easy default)",
          "effect": "Errors are self-contained; cross-component propagation is structurally hard",
          "safety_level": 5,
          "safety_level_name": "Carefree"
        }
      ],
      "efficiency_options": [
        {
          "name": "Human code review",
          "safety_level": 1,
          "safety_level_name": "Vigilance",
          "scope": "Whatever reviewer noticed"
        },
        {
          "name": "AI exploratory testing (edge-case tests after change)",
          "safety_level": 2,
          "safety_level_name": "Probabilistic",
          "scope": "Bootstraps to Deterministic"
        },
        {
          "name": "Unit tests (recipe-based, comprehensive coverage)",
          "safety_level": 3,
          "safety_level_name": "Deterministic",
          "scope": "Recipe-defined coverage; predictable gaps remain"
        },
        {
          "name": "Theorem provers",
          "safety_level": 4,
          "safety_level_name": "Prevention",
          "scope": "Formally specified invariants only"
        }
      ]
    },
    {
      "id": "documentation_code_misalignment",
      "name": "Documentation-code misalignment",
      "canonical_work_type_id": "making_intent_visible",
      "worry": "Does our documentation -- READMEs, how-to guides, API docs, architecture diagrams, decision records, any of it -- still describe what the system actually does? When docs and code disagree, which one is right?",
      "worry_surface": "Number of documented concepts, behaviors, or structures whose documentation no longer matches reality.",
      "rate_event": "Every change to code or system behavior not reflected in documentation, or every doc update not reflected in code.",
      "note": "Resolution is bidirectional. Sometimes code evolved correctly and docs need updating. Sometimes docs reflect intended design and code needs correcting. The error is the misalignment, not the direction.",
      "scope_shrinking_options": [
        {
          "name": "Fewer, well-bounded documented items",
          "effect": "Smaller surface of docs to keep in sync",
          "safety_level": 3,
          "safety_level_name": "Deterministic"
        }
      ],
      "efficiency_options": [
        {
          "name": "Human review of docs vs. code",
          "safety_level": 1,
          "safety_level_name": "Vigilance",
          "scope": "When someone thinks to check"
        },
        {
          "name": "AI alignment scan (compare docs to code; surface discrepancies)",
          "safety_level": 2,
          "safety_level_name": "Probabilistic",
          "scope": "Broader than rules; unpredictable"
        },
        {
          "name": "Architecture linters (check structural intent vs. code)",
          "safety_level": 3,
          "safety_level_name": "Deterministic",
          "scope": "Configured rule set"
        },
        {
          "name": "Doc update embedded in planning workflow",
          "safety_level": 3,
          "safety_level_name": "Deterministic",
          "scope": "All changes that touch a documented item"
        },
        {
          "name": "Auto-generated documentation (derived from code annotations, tests, or living-doc tools; regenerated on every change)",
          "safety_level": 4,
          "safety_level_name": "Prevention",
          "scope": "All items expressible in generated form -- API docs, behavior docs from tests, compliance docs from test results, governance reports"
        }
      ]
    }
  ]
}
```

---

## Summary Table Data

The summary view needs a cross-cutting view across all work types. Rather than a separate JSON file, the summary is computed at runtime from the data above: for each work type, find its error classes and surface the highest-cost one (the one with the lowest minimum viable safety level).

The summary table shape (computed, not stored):
```
work_type_name | error_class_name | worry_surface | minimum_viable_level | target_level
```

---

## TypeScript Additions to `types.ts`

New interfaces to add alongside the existing ones:

```typescript
// safety_ladder.json
export interface SafetyLevel { ... }
export interface SafetyLadderData { ... }

// facets.json
export interface ProductFacet { ... }
export interface FacetsData { ... }

// behavioral_domains.json
export interface BehavioralDomain { ... }
export interface BehavioralDomainsData { ... }

// work_types.json
export interface AgencyPathEntry { ... }
export interface ErrorClassRef { ... }
export interface WorkType { ... }
export interface WorkTypesData { ... }

// error_classes.json (shared SafetyOption used in work_types.json too)
export interface SafetyOption { ... }
export interface ErrorClass { ... }
export interface ErrorClassesData { ... }
```

---

## New Composable: `useSafetyData.ts`

Parallel to `useModelData.ts`. Imports the five new JSON files and exposes reactive refs plus lookup helpers:

```typescript
// Reactive refs
safetyLadder         // SafetyLevel[]
facets               // ProductFacet[]
domains              // BehavioralDomain[]
workTypes            // WorkType[]
errorClasses         // ErrorClass[]

// Helpers
getLevelByNumber(n)          // → SafetyLevel
getFacetById(id)             // → ProductFacet
getDomainById(id)            // → BehavioralDomain
getWorkTypeById(id)          // → WorkType
getWorkTypesByDomain(domainId) // → WorkType[]
getErrorClassById(id)        // → ErrorClass
getErrorClassesForWorkType(workTypeId) // → ErrorClass[] (only canonicals)
getCanonicalWorkType(errorClassId) // → WorkType
```

---

## New Views

### `SafetyMatrixView.vue`
Top-level entry point. Shows the domain/work-type navigation: a list of domains, each with its work types as clickable cards. Includes the careless safety ladder as a persistent legend. Links to WorkTypeDetailView.

### `WorkTypeDetailView.vue`
Detail view for a single work type. Shows:
- Name, description, business stake
- Agency delegation path (table)
- Each error class in order: full entry for canonicals, cross-reference link for others

### `SafetySummaryView.vue`
Cross-cutting summary table. All work types as rows; columns for highest-cost error class, worry surface, minimum viable safety level, target safety level. Color-coded by level. Useful as a diagnostic starting point.

---

## New Components

### `SafetyLevelBadge.vue`
Renders a safety level (number + name) with color. Levels map to a gradient: Hope=deep red → Vigilance=red → Probabilistic=orange → Deterministic=yellow → Prevention=green → Carefree=blue. Used everywhere a safety level appears.

### `SafetyLadderLegend.vue`
Compact horizontal display of all 6 levels with names and one-line descriptions. Shown persistently in SafetyMatrixView and collapsible in detail views.

### `ErrorClassCard.vue`
Full display of one error class: the worry (styled prominently), worry surface, rate event, optional note, scope-shrinking table, efficiency table. Handles cross-reference rendering (link to canonical instead of full content).

### `OptionTable.vue`
Renders either a scope-shrinking or efficiency options table. Columns vary by table type. Each row includes a `SafetyLevelBadge`. Handles the special "Bootstrapped" note display.

### `AgencyPathTable.vue`
Renders the agency delegation path for a work type. Rows: A1–A4. Columns: label, description, safety required. Safety required cells can be parsed to highlight referenced error classes.

### `WorkTypeSummaryCard.vue`
Compact card for use in SafetyMatrixView: work type name, facet badge (if applicable), count of error classes, highest safety gap. Clickable to navigate to WorkTypeDetailView.

---

## Integration with Existing Model

The new viewer is a parallel route, not a replacement. In `router/index.ts`, add:

```
/safety          → SafetyMatrixView
/safety/:workTypeId → WorkTypeDetailView
/safety/summary  → SafetySummaryView
```

The Overview landing page gets a new card linking to `/safety` alongside the existing primary axis and fate choices links.

The new data files have no dependency on the existing `model/` files. The two models are independent. A future step could cross-reference them (e.g., showing which agency substage unlocks which work type's A3 agency path), but that is not required for the initial viewer.

---

## Open Questions Before Encoding

1. **Summary table minimum viable level**: computed from options tables (lowest safety level in efficiency options that isn't Hope?) — or should this be explicitly stored per error class?

2. **Bootstrapped entries**: the "Drift to ADR pipeline → Bootstrapped to Deterministic" pattern appears several times. The current schema handles it with `safety_level_note: "Bootstrapped"`. Is that sufficient, or should the schema support a `from_level` / `to_level` pair?

3. **Cross-reference display**: when an error class appears non-canonically in a work type, should the viewer show only a link, or a compact summary (worry only) plus link?

4. **Work type note in cross-refs**: the `context_note` and `additional_scope_shrinking` fields on `ErrorClassRef` handle the case where a work type adds something specific (e.g., "Evolving the design" adds AST tools to capability regression's scope-shrinking). Is this the right place for that, or should it be a `work_type_specific_options` array at the work type level?
