import { ref } from 'vue'
import type { ModelOverview, FateDeterminingChoiceDetail } from '../types'
import overviewData from '@model/overview.json'
import fateChoicesData from '@model/fate-determining-choices.json'

const model = ref<ModelOverview>(overviewData as ModelOverview)
const fateChoices = ref<FateDeterminingChoiceDetail[]>(
  fateChoicesData.fate_determining_choices as FateDeterminingChoiceDetail[]
)

export function useModelData() {
  return {
    model,
    fateChoices,
    loading: ref(false),
    error: ref<string | null>(null)
  }
}

export function getFateChoiceById(id: string): FateDeterminingChoiceDetail | undefined {
  return fateChoices.value.find(c => c.id === id)
}
