import { ref, onMounted } from 'vue'
import type { ModelOverview, FateDeterminingChoiceDetail, FateChoicesData } from '../types'

const model = ref<ModelOverview | null>(null)
const fateChoices = ref<FateDeterminingChoiceDetail[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const loaded = ref(false)

async function loadData() {
  if (loaded.value) return

  try {
    const [overviewRes, fateRes] = await Promise.all([
      fetch('/model/overview.json'),
      fetch('/model/fate-determining-choices.json')
    ])
    if (!overviewRes.ok) throw new Error('Failed to load model overview')
    if (!fateRes.ok) throw new Error('Failed to load fate-determining choices')

    model.value = await overviewRes.json()
    const fateData: FateChoicesData = await fateRes.json()
    fateChoices.value = fateData.fate_determining_choices
    loaded.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

export function useModelData() {
  onMounted(loadData)

  return {
    model,
    fateChoices,
    loading,
    error
  }
}

export function getFateChoiceById(id: string): FateDeterminingChoiceDetail | undefined {
  return fateChoices.value.find(c => c.id === id)
}
