<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'

interface PrimaryAxis {
  id: string
  name: string
  definition_markdown: string
  why_primary_markdown: string
  emotional_frame_markdown: string
}

interface SecondaryAxis {
  id: string
  name: string
  definition_markdown: string
}

interface FateDeterminingChoice {
  id: string
  name: string
  definition_markdown: string
}

interface FateDeterminingChoiceDetail {
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

interface FateChoicesData {
  fate_determining_choices: FateDeterminingChoiceDetail[]
}

interface ModelOverview {
  model_id: string
  title: string
  version: string
  summary_markdown: string
  primary_axis: PrimaryAxis
  secondary_axes: SecondaryAxis[]
  fate_determining_choices: FateDeterminingChoice[]
}

const model = ref<ModelOverview | null>(null)
const fateChoices = ref<FateDeterminingChoiceDetail[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

function md(text: string): string {
  return marked.parse(text, { async: false }) as string
}

function mdList(items: string[]): string {
  return items.map(item => marked.parse(item, { async: false }) as string).join('')
}

onMounted(async () => {
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
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="slide">
    <div v-if="loading" class="loading">
      Loading model...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>

    <div v-else-if="model" class="overview">
      <h1>{{ model.title }}</h1>
      <p class="version text-muted">Version {{ model.version }}</p>

      <div class="summary card mt-xl markdown-content" v-html="md(model.summary_markdown)"></div>

      <div class="primary-axis card mt-xl">
        <h2>Primary Axis: {{ model.primary_axis.name }}</h2>
        <div class="definition markdown-content" v-html="md(model.primary_axis.definition_markdown)"></div>
      </div>

      <div class="secondary-axes mt-xl">
        <h3>Secondary Axes</h3>
        <div class="axes-grid">
          <div v-for="axis in model.secondary_axes" :key="axis.id" class="card axis-card">
            <h4>{{ axis.name }}</h4>
            <div class="text-muted markdown-content" v-html="md(axis.definition_markdown)"></div>
          </div>
        </div>
      </div>

      <div class="fate-choices mt-xl">
        <h3>Fate-Determining Choices</h3>
        <p class="text-muted mb-lg">System-level decisions that constrain how far agency can evolve.</p>

        <div v-for="choice in fateChoices" :key="choice.id" class="fate-choice card mt-lg">
          <h4>{{ choice.name }}</h4>
          <div class="summary markdown-content" v-html="md(choice.summary_markdown)"></div>

          <div class="fate-detail mt-lg">
            <h5>Definition</h5>
            <div class="markdown-content" v-html="md(choice.definition_markdown)"></div>
          </div>

          <div class="fate-detail mt-lg">
            <h5>Correct Choice</h5>
            <div class="markdown-content" v-html="md(choice.correct_choice_markdown)"></div>
          </div>

          <div class="fate-columns mt-lg">
            <div class="fate-column success">
              <h5>Success Examples</h5>
              <div class="markdown-content" v-html="mdList(choice.success_examples_markdown)"></div>
            </div>
            <div class="fate-column failure">
              <h5>Failure Examples</h5>
              <div class="markdown-content" v-html="mdList(choice.failure_examples_markdown)"></div>
            </div>
          </div>

          <div class="fate-columns mt-lg">
            <div class="fate-column warning">
              <h5>Early Warning Signs</h5>
              <div class="markdown-content" v-html="mdList(choice.early_warning_signs_markdown)"></div>
            </div>
            <div class="fate-column rationalization">
              <h5>Typical Rationalizations</h5>
              <div class="markdown-content" v-html="mdList(choice.typical_rationalizations_markdown)"></div>
            </div>
          </div>

          <div class="fate-detail mt-lg what-breaks">
            <h5>What Breaks If Wrong</h5>
            <div class="markdown-content" v-html="md(choice.what_breaks_if_wrong_markdown)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overview {
  width: 100%;
  max-width: 900px;
}

.version {
  font-size: var(--font-size-sm);
}

.summary {
  font-size: var(--font-size-lg);
}

.definition {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
}

.axes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.axis-card h4 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.loading,
.error {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
}

.error {
  color: #dc3545;
}

/* Fate-determining choices */
.fate-choice {
  border-left: 4px solid var(--color-primary);
}

.fate-choice h4 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.fate-choice h5 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.fate-detail {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.fate-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.fate-column {
  padding: var(--spacing-md);
  border-radius: 6px;
}

.fate-column.success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.fate-column.failure {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.fate-column.warning {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
}

.fate-column.rationalization {
  background-color: #f5f5f5;
  border: 1px solid #e5e5e5;
}

.what-breaks {
  background-color: #fef2f2;
  padding: var(--spacing-md);
  border-radius: 6px;
  border: 1px solid #fecaca;
}
</style>
