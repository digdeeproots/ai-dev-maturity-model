import { ref, computed } from 'vue'
import safetyLadderRaw from '@model/safety_ladder.json'
import workTypesRaw    from '@model/work_types.json'
import worriesRaw      from '@model/worries.json'
import patternsRaw     from '@model/patterns.json'
import type {
  SafetyLevel, BehavioralDomain, WorkType,
  Worry, Pattern, SafetyOption, WorryRef,
} from '@/types'

const safetyLadder = ref<SafetyLevel[]>((safetyLadderRaw as any).levels)
const domains      = ref<BehavioralDomain[]>((workTypesRaw as any).domains)
const worries      = ref<Worry[]>((worriesRaw as any).worries)
const patterns     = ref<Pattern[]>((patternsRaw as any).patterns)

const worryMap   = computed(() => Object.fromEntries(worries.value.map(w => [w.id, w])))
const patternMap = computed(() => Object.fromEntries(patterns.value.map(p => [p.id, p])))

const allWorkTypes = computed<WorkType[]>(() => domains.value.flatMap(d => d.work_types))

function getLevelByNumber(n: number): SafetyLevel | undefined {
  return safetyLadder.value.find(l => l.level === n)
}

function getWorryById(id: string): Worry | undefined {
  return worryMap.value[id]
}

function getPatternById(id: string): Pattern | undefined {
  return patternMap.value[id]
}

function domainOfWorkType(wtId: string): BehavioralDomain | undefined {
  return domains.value.find(d => d.work_types.some(w => w.id === wtId))
}

function bestScopeLevel(worryId: string): number {
  const w = worryMap.value[worryId]
  if (!w?.scope_shrinking_options?.length) return 0
  return Math.max(...w.scope_shrinking_options.map(o => o.safety_level))
}

function bestEfficiencyLevel(worryId: string): number {
  const w = worryMap.value[worryId]
  if (!w?.efficiency_options?.length) return 0
  return Math.max(...w.efficiency_options.map(o => o.safety_level))
}

function worstScopeLevel(refs: WorryRef[]): number {
  if (!refs.length) return 0
  return Math.min(...refs.map(r => bestScopeLevel(r.worry_id)))
}

// Merge base scope-shrinking options with any extras from the WorryRef,
// sort descending by level.
function mergedScopeOptions(ref: WorryRef): SafetyOption[] {
  const base  = worryMap.value[ref.worry_id]?.scope_shrinking_options ?? []
  const extra = ref.additional_scope_shrinking ?? []
  return [...base, ...extra].sort((a, b) => b.safety_level - a.safety_level)
}

export function useSafetyData() {
  return {
    safetyLadder,
    domains,
    worries,
    patterns,
    worryMap,
    patternMap,
    allWorkTypes,
    getLevelByNumber,
    getWorryById,
    getPatternById,
    domainOfWorkType,
    bestScopeLevel,
    bestEfficiencyLevel,
    worstScopeLevel,
    mergedScopeOptions,
  }
}
