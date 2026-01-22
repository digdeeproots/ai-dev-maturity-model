<script setup lang="ts">
import { computed } from 'vue'
import type { OwnershipCode, OwnershipCodeInfo } from '../types'
import { getResponsibilityMatrixForSubstages } from '../composables/useModelData'

const props = defineProps<{
  substageIds: string[]
  substageNames?: Record<string, string>
}>()

const matrixData = computed(() => getResponsibilityMatrixForSubstages(props.substageIds))

function getOwnershipClass(code: OwnershipCode): string {
  return `ownership-${code.toLowerCase()}`
}

function getOwnershipInfo(code: OwnershipCode): OwnershipCodeInfo {
  return matrixData.value.ownershipCodes[code]
}

function hasTransition(respIndex: number): boolean {
  const codes = matrixData.value.matrix.map(row => row[respIndex])
  return new Set(codes).size > 1
}

function getSubstageName(id: string): string {
  return props.substageNames?.[id] || id
}
</script>

<template>
  <div class="responsibility-table-container">
    <table class="responsibility-table">
      <thead>
        <tr>
          <th class="responsibility-header">Responsibility</th>
          <th
            v-for="substageId in substageIds"
            :key="substageId"
            class="substage-header"
          >
            {{ getSubstageName(substageId) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(responsibility, respIndex) in matrixData.responsibilities"
          :key="responsibility"
          :class="{ 'has-transition': hasTransition(respIndex) }"
        >
          <td class="responsibility-name">{{ responsibility }}</td>
          <td
            v-for="(substageId, substageIndex) in substageIds"
            :key="substageId"
            class="ownership-cell"
            :class="getOwnershipClass(matrixData.matrix[substageIndex]?.[respIndex] || 'H')"
            :title="getOwnershipInfo(matrixData.matrix[substageIndex]?.[respIndex] || 'H').description"
          >
            {{ getOwnershipInfo(matrixData.matrix[substageIndex]?.[respIndex] || 'H').label }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="legend">
      <span class="legend-title">Legend:</span>
      <span
        v-for="(info, code) in matrixData.ownershipCodes"
        :key="code"
        class="legend-item"
        :class="getOwnershipClass(code as OwnershipCode)"
      >
        <span class="legend-code">{{ info.label }}</span>
        <span class="legend-desc">{{ info.description }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.responsibility-table-container {
  overflow-x: auto;
  margin: var(--spacing-md) 0;
}

.responsibility-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.responsibility-table th,
.responsibility-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  text-align: center;
}

.responsibility-header {
  text-align: left;
  background-color: var(--color-surface);
  font-weight: 600;
  min-width: 200px;
}

.substage-header {
  background-color: var(--color-surface);
  font-weight: 600;
  white-space: nowrap;
  min-width: 80px;
}

.responsibility-name {
  text-align: left;
  font-weight: 500;
}

.has-transition {
  background-color: #fffbeb;
}

.has-transition .responsibility-name {
  font-weight: 600;
}

.ownership-cell {
  font-weight: 500;
  font-size: var(--font-size-xs);
}

/* Ownership colors */
.ownership-h {
  background-color: #dbeafe;
  color: #1e40af;
}

.ownership-a {
  background-color: #dcfce7;
  color: #166534;
}

.ownership-ag {
  background-color: #fef3c7;
  color: #92400e;
}

.ownership-ao {
  background-color: #fce7f3;
  color: #9d174d;
}

.ownership-s {
  background-color: #e0e7ff;
  color: #3730a3;
}

/* Legend */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface);
  border-radius: 4px;
  font-size: var(--font-size-xs);
}

.legend-title {
  font-weight: 600;
  color: var(--color-text-light);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.legend-code {
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.legend-desc {
  color: var(--color-text-light);
}
</style>
