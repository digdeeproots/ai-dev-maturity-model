<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useModelData, getFateChoiceById } from '../composables/useModelData'
import { useMarkdown } from '../composables/useMarkdown'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const { loading, error } = useModelData()
const { md, mdList } = useMarkdown()

const choice = computed(() => getFateChoiceById(props.id))

function goBack() {
  router.back()
}
</script>

<template>
  <div class="slide">
    <div v-if="loading" class="loading">
      Loading...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>

    <div v-else-if="choice" class="detail-view">
      <button class="back-button" @click="goBack">&larr; Back</button>

      <h1>{{ choice.name }}</h1>
      <div class="summary markdown-content mt-md" v-html="md(choice.summary_markdown)"></div>

      <div class="fate-detail card mt-xl">
        <h3>Definition</h3>
        <div class="markdown-content" v-html="md(choice.definition_markdown)"></div>
      </div>

      <div class="fate-detail card mt-lg">
        <h3>Correct Choice</h3>
        <div class="markdown-content" v-html="md(choice.correct_choice_markdown)"></div>
      </div>

      <div class="fate-columns mt-xl">
        <div class="fate-column success">
          <h3>Success Examples</h3>
          <div class="markdown-content" v-html="mdList(choice.success_examples_markdown)"></div>
        </div>
        <div class="fate-column failure">
          <h3>Failure Examples</h3>
          <div class="markdown-content" v-html="mdList(choice.failure_examples_markdown)"></div>
        </div>
      </div>

      <div class="fate-columns mt-lg">
        <div class="fate-column warning">
          <h3>Early Warning Signs</h3>
          <div class="markdown-content" v-html="mdList(choice.early_warning_signs_markdown)"></div>
        </div>
        <div class="fate-column rationalization">
          <h3>Typical Rationalizations</h3>
          <div class="markdown-content" v-html="mdList(choice.typical_rationalizations_markdown)"></div>
        </div>
      </div>

      <div class="what-breaks card mt-xl">
        <h3>What Breaks If Wrong</h3>
        <div class="markdown-content" v-html="md(choice.what_breaks_if_wrong_markdown)"></div>
      </div>
    </div>

    <div v-else class="error">
      Fate-determining choice not found.
    </div>
  </div>
</template>

<style scoped>
.detail-view {
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

.detail-view h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
}

.fate-detail {
  border-left: 4px solid var(--color-primary);
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
  background-color: var(--color-success-light);
  border: 1px solid var(--color-success-border);
}

.fate-column.failure {
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error-border);
}

.fate-column.warning {
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning-border);
}

.fate-column.rationalization {
  background-color: #f5f5f5;
  border: 1px solid #e5e5e5;
}

.what-breaks {
  background-color: var(--color-error-light);
  padding: var(--spacing-md);
  border-radius: 6px;
  border: 1px solid var(--color-error-border);
}

.loading,
.error {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
}

.error {
  color: var(--color-error);
}
</style>
