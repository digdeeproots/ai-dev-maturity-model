import { ref } from 'vue'
import type { ModelOverview, FateDeterminingChoiceDetail, AgencyStage } from '../types'
import overviewData from '@model/overview.json'
import fateChoicesData from '@model/fate-determining-choices.json'
import agencyStagesData from '@model/agency_stages.json'

const model = ref<ModelOverview>(overviewData as ModelOverview)
const fateChoices = ref<FateDeterminingChoiceDetail[]>(
  fateChoicesData.fate_determining_choices as FateDeterminingChoiceDetail[]
)
const agencyStages = ref<AgencyStage[]>(
  agencyStagesData.stages as AgencyStage[]
)

export function useModelData() {
  return {
    model,
    fateChoices,
    agencyStages,
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
