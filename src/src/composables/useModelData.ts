import { ref } from 'vue'
import type { ModelOverview, FateDeterminingChoiceDetail, AgencyStage, Substage, ResponsibilityOwnershipData, OwnershipCode, Responsibility } from '../types'
import overviewData from '@model/overview.json'
import fateChoicesData from '@model/fate-determining-choices.json'
import agencyStagesData from '@model/agency_stages.json'
import substagesData from '@model/agency_substages.json'
import responsibilityData from '@model/responsibility_ownership.json'

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
const responsibilityOwnership = ref<ResponsibilityOwnershipData>(
  responsibilityData as ResponsibilityOwnershipData
)

export function useModelData() {
  return {
    model,
    fateChoices,
    agencyStages,
    substages,
    responsibilityOwnership,
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

export function getResponsibilityMatrixForSubstages(substageIds: string[]): {
  responsibilities: Responsibility[]
  substageIds: string[]
  matrix: OwnershipCode[][]
  ownershipCodes: ResponsibilityOwnershipData['ownership_codes']
} {
  const data = responsibilityOwnership.value
  const matrix = substageIds.map(id => data.matrix[id] || [])
  return {
    responsibilities: data.responsibilities,
    substageIds,
    matrix,
    ownershipCodes: data.ownership_codes
  }
}
