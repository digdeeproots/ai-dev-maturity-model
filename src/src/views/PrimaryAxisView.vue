<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useModelData } from '../composables/useModelData'
import { useMarkdown } from '../composables/useMarkdown'

const router = useRouter()
const { model, agencyStages } = useModelData()
const { md } = useMarkdown()

const expandedStageId = ref<string | null>(null)

const visibleStages = computed(() =>
  agencyStages.value.filter(s => s.visibility !== 'hidden_by_default')
)

function toggleStage(id: string) {
  expandedStageId.value = expandedStageId.value === id ? null : id
}

function isExpanded(id: string): boolean {
  return expandedStageId.value === id
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="slide">
    <div class="axis-view">
      <button class="back-button" @click="goBack">&larr; Back</button>

      <h1>{{ model.primary_axis.name }}</h1>
      <div class="definition markdown-content mt-md" v-html="md(model.primary_axis.definition_markdown)"></div>

      <div class="stages mt-xl">
        <h2>Stages</h2>

        <div
          v-for="stage in visibleStages"
          :key="stage.id"
          class="stage-card"
          :class="{ expanded: isExpanded(stage.id) }"
        >
          <button class="stage-header" @click="toggleStage(stage.id)">
            <div class="stage-title">
              <span class="stage-id">{{ stage.id }}</span>
              <h3>{{ stage.name }}</h3>
            </div>
            <div class="stage-summary text-muted" v-if="!isExpanded(stage.id)">
              {{ stage.core_agency_statement }}
            </div>
            <span class="expand-icon">{{ isExpanded(stage.id) ? '−' : '+' }}</span>
          </button>

          <div v-if="isExpanded(stage.id)" class="stage-content">
            <div class="stage-detail">
              <h4>Summary</h4>
              <div class="markdown-content" v-html="md(stage.summary_markdown)"></div>
            </div>

            <div class="stage-detail">
              <h4>Core Agency Statement</h4>
              <p class="agency-statement">{{ stage.core_agency_statement }}</p>
            </div>

            <div class="stage-detail">
              <h4>Emotional Shift</h4>
              <div class="markdown-content" v-html="md(stage.emotional_shift_markdown)"></div>
            </div>

            <div v-if="stage.sacred_cows_markdown" class="stage-detail sacred-cows">
              <h4>Sacred Cows to Release</h4>
              <div class="markdown-content" v-html="md(stage.sacred_cows_markdown)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.axis-view {
  width: 100%;
  max-width: 900px;
}

.back-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-md);
}

.back-button:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.definition {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
}

/* Stages */
.stages h2 {
  margin-bottom: var(--spacing-md);
}

.stage-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  transition: box-shadow var(--transition-normal);
}

.stage-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stage-card.expanded {
  border-color: var(--color-primary);
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-lg);
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  text-align: left;
  gap: var(--spacing-md);
}

.stage-header:hover {
  background-color: var(--color-background);
}

.stage-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.stage-id {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.stage-title h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.stage-summary {
  flex: 1;
  font-size: var(--font-size-sm);
  text-align: right;
}

.expand-icon {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  flex-shrink: 0;
  width: 1.5rem;
  text-align: center;
}

.stage-content {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.stage-detail {
  margin-top: var(--spacing-lg);
}

.stage-detail h4 {
  font-size: var(--font-size-base);
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.agency-statement {
  font-size: var(--font-size-lg);
  font-weight: 500;
  font-style: italic;
  color: var(--color-text);
}

.sacred-cows {
  background-color: #fffbeb;
  padding: var(--spacing-md);
  border-radius: 6px;
  border: 1px solid #fde68a;
}
</style>
