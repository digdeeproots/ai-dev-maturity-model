<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useModelData, getSubstagesForStage } from '../composables/useModelData'
import { useMarkdown } from '../composables/useMarkdown'
import ResponsibilityTable from '../components/ResponsibilityTable.vue'

const router = useRouter()
const { model, agencyStages } = useModelData()
const { md } = useMarkdown()

function getSubstageIds(stageId: string): string[] {
  return getSubstagesForStage(stageId).map(s => s.id)
}

function getSubstageNames(stageId: string): Record<string, string> {
  const substages = getSubstagesForStage(stageId)
  return Object.fromEntries(substages.map(s => [s.id, s.name]))
}

const expandedStageId = ref<string | null>(null)
const expandedSubstageIds = ref<Set<string>>(new Set())

const visibleStages = computed(() =>
  agencyStages.value.filter(s => s.visibility !== 'hidden_by_default')
)

// Axis-level overview: all substages from all visible stages
const axisOverviewSubstageIds = computed(() => {
  const ids: string[] = []
  for (const stage of visibleStages.value) {
    const substages = getSubstagesForStage(stage.id)
    for (const substage of substages) {
      ids.push(substage.id)
    }
  }
  return ids
})

const axisOverviewSubstageNames = computed(() => {
  const names: Record<string, string> = {}
  for (const stage of visibleStages.value) {
    const substages = getSubstagesForStage(stage.id)
    for (const substage of substages) {
      names[substage.id] = substage.name
    }
  }
  return names
})

function toggleStage(id: string) {
  expandedStageId.value = expandedStageId.value === id ? null : id
}

function isExpanded(id: string): boolean {
  return expandedStageId.value === id
}

function toggleSubstage(id: string) {
  if (expandedSubstageIds.value.has(id)) {
    expandedSubstageIds.value.delete(id)
  } else {
    expandedSubstageIds.value.add(id)
  }
}

function isSubstageExpanded(id: string): boolean {
  return expandedSubstageIds.value.has(id)
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

      <!-- Axis-level responsibility overview -->
      <div class="axis-responsibility-section mt-xl">
        <h2>Responsibility Overview</h2>
        <p class="section-desc">How responsibilities shift across all substages</p>
        <ResponsibilityTable
          :substage-ids="axisOverviewSubstageIds"
          :substage-names="axisOverviewSubstageNames"
        />
      </div>

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
            <span class="expand-icon" :class="{ expanded: isExpanded(stage.id) }">›</span>
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

            <!-- Responsibility Transitions -->
            <div v-if="getSubstageIds(stage.id).length > 0" class="responsibility-section">
              <h4>Responsibility Transitions</h4>
              <ResponsibilityTable
                :substage-ids="getSubstageIds(stage.id)"
                :substage-names="getSubstageNames(stage.id)"
              />
            </div>

            <!-- Substages -->
            <div v-if="getSubstagesForStage(stage.id).length > 0" class="substages-section">
              <h4>Substages</h4>
              <div class="substages-list">
                <div
                  v-for="substage in getSubstagesForStage(stage.id)"
                  :key="substage.id"
                  class="substage-card"
                  :class="{ expanded: isSubstageExpanded(substage.id) }"
                >
                  <button class="substage-header" @click="toggleSubstage(substage.id)">
                    <div class="substage-title">
                      <span class="substage-id">{{ substage.id }}</span>
                      <span class="substage-name">{{ substage.name }}</span>
                    </div>
                    <div v-if="!isSubstageExpanded(substage.id)" class="substage-summary">
                      {{ substage.keystone_behavior_markdown || substage.agency_allocation_markdown || '' }}
                    </div>
                    <span class="expand-icon" :class="{ expanded: isSubstageExpanded(substage.id) }">›</span>
                  </button>

                  <div v-if="isSubstageExpanded(substage.id)" class="substage-content">
                    <div v-if="substage.example_markdown" class="substage-detail example">
                      <strong>Examples:</strong>
                      <div class="markdown-content" v-html="md(substage.example_markdown)"></div>
                    </div>

                    <div v-if="substage.keystone_behavior_markdown" class="substage-detail">
                      <strong>Keystone Behavior:</strong>
                      <div class="markdown-content" v-html="md(substage.keystone_behavior_markdown)"></div>
                    </div>

                    <div v-if="substage.secondary_behaviors_markdown?.length" class="substage-detail">
                      <strong>Secondary Behaviors:</strong>
                      <ul>
                        <li v-for="(behavior, i) in substage.secondary_behaviors_markdown" :key="i">{{ behavior }}</li>
                      </ul>
                    </div>

                    <div v-if="substage.agency_allocation_markdown" class="substage-detail">
                      <strong>Agency Allocation:</strong>
                      <div class="markdown-content" v-html="md(substage.agency_allocation_markdown)"></div>
                    </div>

                    <div v-if="substage.emotional_state" class="substage-detail emotional-state">
                      <strong>Emotional State:</strong>
                      <div class="emotional-details">
                        <div><em>Dominant:</em> {{ substage.emotional_state.dominant }}</div>
                        <div v-if="substage.emotional_state.secondary?.length">
                          <em>Secondary:</em> {{ substage.emotional_state.secondary.join(', ') }}
                        </div>
                        <div v-if="substage.emotional_state.discomfort">
                          <em>Discomfort:</em> "{{ substage.emotional_state.discomfort }}"
                        </div>
                      </div>
                    </div>

                    <div v-if="substage.failure_modes_markdown?.length" class="substage-detail">
                      <strong>Failure Modes:</strong>
                      <ul>
                        <li v-for="(mode, i) in substage.failure_modes_markdown" :key="i">{{ mode }}</li>
                      </ul>
                    </div>

                    <div v-if="substage.enabling_investments_markdown?.length" class="substage-detail">
                      <strong>Example Enabling Investments:</strong>
                      <ul>
                        <li v-for="(investment, i) in substage.enabling_investments_markdown" :key="i">{{ investment }}</li>
                      </ul>
                    </div>

                    <div v-if="substage.readiness" class="substage-detail readiness">
                      <strong>Readiness:</strong>
                      <div class="readiness-details">
                        <div v-if="substage.readiness.ready_to_experiment_markdown">
                          <em>You may be ready to experiment with this substage if:</em> {{ substage.readiness.ready_to_experiment_markdown }}
                        </div>
                        <div v-if="substage.readiness.effectiveness_metric_markdown">
                          <em>Effectiveness metric for progress within this substage:</em> {{ substage.readiness.effectiveness_metric_markdown }}
                        </div>
                        <div v-if="substage.readiness.let_go_focus_markdown">
                          <em>Let go focus:</em> {{ substage.readiness.let_go_focus_markdown }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

/* Axis responsibility overview */
.axis-responsibility-section h2 {
  margin-bottom: var(--spacing-sm);
}

.axis-responsibility-section .section-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
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
  box-shadow: var(--shadow-md);
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
  min-width: 2.5rem;
  height: 2rem;
  padding: 0 var(--spacing-sm);
  background-color: var(--color-primary);
  color: white;
  border-radius: 6px;
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
  transition: transform var(--transition-normal);
  display: inline-block;
}

.expand-icon.expanded {
  transform: rotate(90deg);
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
  background-color: var(--color-warning-light);
  padding: var(--spacing-md);
  border-radius: 6px;
  border: 1px solid var(--color-warning-border);
}

/* Substages */
.substages-section {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.substages-section > h4 {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.substages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.substage-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.substage-card.expanded {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.substage-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  text-align: left;
  gap: var(--spacing-md);
}

.substage-header:hover {
  background-color: var(--color-surface);
}

.substage-card.expanded .substage-header:hover {
  background-color: var(--color-background);
}

.substage-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.substage-id {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 1.75rem;
  padding: 0 var(--spacing-sm);
  background-color: var(--color-text-light);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: var(--font-size-xs);
}

.substage-card.expanded .substage-id {
  background-color: var(--color-primary);
}

.substage-name {
  font-weight: 500;
  font-size: var(--font-size-base);
}

.substage-summary {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  text-align: right;
}

.substage-content {
  padding: 0 var(--spacing-md) var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.substage-detail {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.substage-detail strong {
  color: var(--color-text);
}

.substage-detail ul {
  margin: var(--spacing-xs) 0 0 var(--spacing-lg);
  padding: 0;
}

.substage-detail li {
  margin-bottom: var(--spacing-xs);
}

.emotional-state .emotional-details {
  margin-top: var(--spacing-xs);
  padding-left: var(--spacing-md);
}

.emotional-state .emotional-details > div {
  margin-bottom: var(--spacing-xs);
}

.emotional-state em {
  color: var(--color-text-light);
}

.substage-detail.example {
  background-color: var(--color-info-light);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  border-left: 3px solid var(--color-info);
}

.substage-detail.enabling-investments ul {
  margin: var(--spacing-xs) 0 0 var(--spacing-md);
}

.readiness-details {
  margin-top: var(--spacing-xs);
  padding-left: var(--spacing-md);
}

.readiness-details > div {
  margin-bottom: var(--spacing-xs);
}

.readiness-details em {
  color: var(--color-text-light);
}

/* Responsibility section */
.responsibility-section {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.responsibility-section > h4 {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}
</style>
