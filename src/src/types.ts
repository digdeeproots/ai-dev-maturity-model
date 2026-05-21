export interface PrimaryAxis {
  id: string
  name: string
  definition_markdown: string
  why_primary_markdown: string
  emotional_frame_markdown: string
}

export interface SecondaryAxis {
  id: string
  name: string
  definition_markdown: string
}

export interface FateDeterminingChoice {
  id: string
  name: string
  definition_markdown: string
}

export interface FateDeterminingChoiceDetail {
  id: string
  name: string
  summary_markdown: string
  definition_markdown: string
  correct_choice_markdown: string
  success_examples_markdown: string[]
  failure_examples_markdown: string[]
  typical_rationalizations_markdown: string[]
  early_warning_signs_markdown: string[]
  what_breaks_if_wrong_markdown: string
  confidence: string
  deterministic_core_markdown?: string[]
  non_deterministic_zone_markdown?: string[]
}

export interface FateChoicesData {
  fate_determining_choices: FateDeterminingChoiceDetail[]
}

export interface AgencyStage {
  id: string
  name: string
  summary_markdown: string
  core_agency_statement: string
  emotional_shift_markdown: string
  sacred_cows_markdown?: string
  substage_ids?: string[]
  visibility?: string
}

export interface SubstageEmotionalState {
  dominant: string
  secondary?: string[]
  discomfort?: string
}

export interface SubstageReadiness {
  ready_to_experiment_markdown?: string
  effectiveness_metric_markdown?: string
  let_go_focus_markdown?: string
}

export interface Substage {
  id: string
  name: string
  keystone_behavior_markdown?: string
  secondary_behaviors_markdown?: string[]
  enabling_investments_markdown?: string[]
  agency_allocation_markdown?: string
  example_markdown?: string
  emotional_state?: SubstageEmotionalState
  failure_modes_markdown?: string[]
  readiness?: SubstageReadiness
  readiness_to_enter_signals?: string[]
  effectiveness_measures?: string[]
  failure_modes?: string[]
  letting_go_to_progress?: string[]
  stability?: string
  implication?: string
}

export interface SubstagesData {
  substages: Substage[]
}

// Responsibility ownership types
export type OwnershipCode = 'H' | 'A' | 'AG' | 'AO' | 'S'

export interface OwnershipCodeInfo {
  label: string
  description: string
}

export interface Responsibility {
  id: string
  short: string
  full: string
  description: string
}

export interface ResponsibilityOwnershipData {
  responsibilities: Responsibility[]
  ownership_codes: Record<OwnershipCode, OwnershipCodeInfo>
  matrix: Record<string, OwnershipCode[]>
}

export interface AgencyStagesData {
  axis_id: string
  stages: AgencyStage[]
}

export interface ModelOverview {
  model_id: string
  title: string
  version: string
  summary_markdown: string
  primary_axis: PrimaryAxis
  secondary_axes: SecondaryAxis[]
  fate_determining_choices: FateDeterminingChoice[]
}

// ── Safety Matrix types ─────────────────────────────────────

export interface SafetyLevel {
  level: number
  name: string
  what_it_means: string
  can_reach_zero_vigilance: boolean
}

export interface SafetyLadderData {
  levels: SafetyLevel[]
}

export interface SafetyOption {
  name: string
  safety_level: number
  safety_level_note?: string
  pattern_ref?: string
  effect?: string
  scope?: string
}

export interface AgencyPathEntry {
  agency_level: string
  label: string
  description: string
  safety_required: string
}

export interface WorryRef {
  worry_id: string
  context_note?: string
  additional_scope_shrinking?: SafetyOption[]
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

export interface Worry {
  id: string
  name: string
  worry: string
  worry_surface: string
  rate_event: string
  note?: string
  gap_condition_markdown?: string
  scope_shrinking_options: SafetyOption[]
  efficiency_options: SafetyOption[]
}

export interface WorriesData {
  worries: Worry[]
}

export interface Pattern {
  id: string
  name: string
  tagline: string
  description_markdown: string
  worry_examples: string[]
}

export interface PatternsData {
  patterns: Pattern[]
}
