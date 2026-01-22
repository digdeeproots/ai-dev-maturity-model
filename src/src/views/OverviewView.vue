<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModelData } from '../composables/useModelData'
import { useMarkdown } from '../composables/useMarkdown'

const router = useRouter()
const { model, fateChoices, loading, error } = useModelData()
const { md } = useMarkdown()

const showWhyPrimary = ref(false)
const showEmotionalFrame = ref(false)

function viewFateChoice(id: string) {
  router.push({ name: 'fate-choice-detail', params: { id } })
}

function viewPrimaryAxis() {
  router.push({ name: 'primary-axis' })
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

      <div class="primary-axis-section mt-xl">
        <button class="primary-axis card" @click="viewPrimaryAxis">
          <h2>Primary Axis: {{ model.primary_axis.name }}</h2>
          <div class="definition markdown-content" v-html="md(model.primary_axis.definition_markdown)"></div>
        </button>

        <div class="collapsible-section card mt-lg" :class="{ expanded: showWhyPrimary }">
          <button class="section-header" @click="showWhyPrimary = !showWhyPrimary">
            <h3>Why This Is Primary</h3>
            <span class="expand-icon">{{ showWhyPrimary ? '−' : '+' }}</span>
          </button>
          <div v-if="showWhyPrimary" class="section-content markdown-content" v-html="md(model.primary_axis.why_primary_markdown)"></div>
        </div>

        <div class="collapsible-section card mt-lg" :class="{ expanded: showEmotionalFrame }">
          <button class="section-header" @click="showEmotionalFrame = !showEmotionalFrame">
            <h3>Emotional Frame</h3>
            <span class="expand-icon">{{ showEmotionalFrame ? '−' : '+' }}</span>
          </button>
          <div v-if="showEmotionalFrame" class="section-content markdown-content" v-html="md(model.primary_axis.emotional_frame_markdown)"></div>
        </div>
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
button.axis-card,
button.primary-axis {
  display: block;
  font: inherit;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

button.axis-card:hover,
button.primary-axis:hover {
  background-color: var(--color-background);
}

/* Collapsible sections */
.collapsible-section {
  overflow: hidden;
}

.collapsible-section.expanded {
  border-color: var(--color-primary);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  text-align: left;
}

.section-header:hover {
  color: var(--color-primary);
}

.section-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.expand-icon {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.section-content {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
