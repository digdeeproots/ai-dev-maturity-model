<script setup lang="ts">
import { computed } from 'vue'
import type { OwnershipCode } from '../types'
import { getResponsibilityMatrixForSubstages } from '../composables/useModelData'

const props = defineProps<{
  substageIds: string[]
}>()

const matrixData = computed(() => getResponsibilityMatrixForSubstages(props.substageIds))

function getOwnershipClass(code: OwnershipCode): string {
  return `ownership-${code.toLowerCase()}`
}

function getOwnershipCode(substageIndex: number, respIndex: number): OwnershipCode {
  return matrixData.value.matrix[substageIndex]?.[respIndex] || 'H'
}
</script>

<template>
  <div class="mini-sparkline" :title="'Responsibility matrix for ' + substageIds.length + ' substages'">
    <div
      v-for="(substageId, substageIndex) in substageIds"
      :key="substageId"
      class="mini-row"
    >
      <div
        v-for="(responsibility, respIndex) in matrixData.responsibilities"
        :key="responsibility.id"
        class="mini-cell"
        :class="getOwnershipClass(getOwnershipCode(substageIndex, respIndex))"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.mini-sparkline {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  padding: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  flex-shrink: 0;
}

.mini-row {
  display: flex;
  gap: 1px;
}

.mini-cell {
  width: 6px;
  height: 6px;
  border-radius: 1px;
}

/* Ownership colors - gradient from Human (orange) to AI (blue) */
.ownership-h {
  background-color: #fdba74;
}

.ownership-s {
  background-color: #fcd34d;
}

.ownership-ag {
  background-color: #fef08a;
}

.ownership-ao {
  background-color: #a7f3d0;
}

.ownership-a {
  background-color: #bfdbfe;
}
</style>
