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
const loading = ref(true)
const error = ref<string | null>(null)

function md(text: string): string {
  return marked.parse(text, { async: false }) as string
}

onMounted(async () => {
  try {
    const response = await fetch('/model/overview.json')
    if (!response.ok) throw new Error('Failed to load model')
    model.value = await response.json()
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
</style>
