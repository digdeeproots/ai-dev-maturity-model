<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useModelData } from '../composables/useModelData'
import { useMarkdown } from '../composables/useMarkdown'

const router = useRouter()
const { model, fateChoices, loading, error } = useModelData()
const { md } = useMarkdown()

function viewFateChoice(id: string) {
  router.push({ name: 'fate-choice-detail', params: { id } })
}
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
        <div class="axes-grid">
          <button
            v-for="choice in fateChoices"
            :key="choice.id"
            class="card axis-card"
            @click="viewFateChoice(choice.id)"
          >
            <h4>{{ choice.name }}</h4>
            <div class="text-muted markdown-content" v-html="md(choice.summary_markdown)"></div>
          </button>
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

/* Clickable cards */
button.axis-card {
  display: block;
  font: inherit;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

button.axis-card:hover {
  background-color: var(--color-background);
}
</style>
