import { ref } from 'vue'
import type { ModelOverview, FateDeterminingChoiceDetail, AgencyStage, Substage } from '../types'
import overviewData from '@model/overview.json'
import fateChoicesData from '@model/fate-determining-choices.json'
import agencyStagesData from '@model/agency_stages.json'
import substagesData from '@model/agency_substages.json'

const model = ref<ModelOverview>(overviewData as ModelOverview)
const fateChoices = ref<FateDeterminingChoiceDetail[]>(
  fateChoicesData.fate_determining_choices as FateDeterminingChoiceDetail[]
)
const agencyStages = ref<AgencyStage[]>(
  agencyStagesData.stages as AgencyStage[]
)
const substages = ref<Substage[]>(
  substagesData.substages as Substage[]
)

export function useModelData() {
  return {
    model,
    fateChoices,
    agencyStages,
    substages,
    loading: ref(false),
    error: ref<string | null>(null)
  }
}

export function getFateChoiceById(id: string): FateDeterminingChoiceDetail | undefined {
  return fateChoices.value.find(c => c.id === id)
}

export function getAgencyStageById(id: string): AgencyStage | undefined {
  return agencyStages.value.find(s => s.id === id)
}

export function getSubstagesForStage(stageId: string): Substage[] {
  return substages.value.filter(s => {
    // Match substages by ID prefix (e.g., "A3.1" belongs to stage "A3", "A0" belongs to stage "A0")
    return s.id === stageId || s.id.startsWith(stageId + '.')
  })
}
