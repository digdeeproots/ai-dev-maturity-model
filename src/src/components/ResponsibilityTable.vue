<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OwnershipCode, OwnershipCodeInfo, Responsibility } from '../types'
import { getResponsibilityMatrixForSubstages } from '../composables/useModelData'

const props = defineProps<{
  substageIds: string[]
  substageNames?: Record<string, string>
}>()

const expanded = ref(false)
const matrixData = computed(() => getResponsibilityMatrixForSubstages(props.substageIds))

function getOwnershipClass(code: OwnershipCode): string {
  return `ownership-${code.toLowerCase()}`
}

function getOwnershipInfo(code: OwnershipCode): OwnershipCodeInfo {
  return matrixData.value.ownershipCodes[code]
}

function getOwnershipCode(substageIndex: number, respIndex: number): OwnershipCode {
  return matrixData.value.matrix[substageIndex]?.[respIndex] || 'H'
}

function getSubstageLabel(id: string): string {
  const name = props.substageNames?.[id]
  return name ? `${id}: ${name}` : id
}

function toggleExpanded() {
  expanded.value = !expanded.value
}

function getTooltipText(responsibility: Responsibility, substageIndex: number, respIndex: number): string {
  const code = matrixData.value.matrix[substageIndex]?.[respIndex] || 'H'
  const ownership = getOwnershipInfo(code).description
  return `${responsibility.full}: ${ownership}`
}
</script>

<template>
  <div class="responsibility-table-container" :class="{ expanded }">
    <!-- Compact sparkline view -->
    <div v-if="!expanded" class="sparkline" @click="toggleExpanded">
      <div class="sparkline-grid">
        <!-- Header row with responsibility codes -->
        <div class="sparkline-header-row">
          <div class="sparkline-row-label"></div>
          <div
            v-for="responsibility in matrixData.responsibilities"
            :key="responsibility.id"
            class="sparkline-col-label"
            :title="responsibility.full"
          >
            {{ responsibility.id.substring(0, 3).toUpperCase() }}
          </div>
        </div>
        <!-- Data rows -->
        <div
          v-for="(substageId, substageIndex) in substageIds"
          :key="substageId"
          class="sparkline-row"
        >
          <div class="sparkline-row-label">{{ substageId }}</div>
          <div
            v-for="(responsibility, respIndex) in matrixData.responsibilities"
            :key="responsibility.id"
            class="sparkline-cell"
            :class="getOwnershipClass(getOwnershipCode(substageIndex, respIndex))"
          >
            <span class="sparkline-tooltip">{{ getTooltipText(responsibility, substageIndex, respIndex) }}</span>
          </div>
        </div>
      </div>
      <div class="sparkline-hint">Click to expand</div>
    </div>

    <!-- Expanded table view -->
    <div v-else class="expanded-view">
      <button class="collapse-btn" @click="toggleExpanded">Collapse</button>
      <table class="responsibility-table">
        <thead>
          <tr>
            <th class="substage-header">Substage</th>
            <th
              v-for="responsibility in matrixData.responsibilities"
              :key="responsibility.id"
              class="responsibility-header"
            >
              <div class="rotated-header">
                <span :title="responsibility.full">{{ responsibility.short }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(substageId, substageIndex) in substageIds"
            :key="substageId"
          >
            <td class="substage-name">{{ getSubstageLabel(substageId) }}</td>
            <td
              v-for="(responsibility, respIndex) in matrixData.responsibilities"
              :key="responsibility.id"
              class="ownership-cell"
              :class="getOwnershipClass(getOwnershipCode(substageIndex, respIndex))"
            >
              <span class="cell-content">
                {{ getOwnershipInfo(getOwnershipCode(substageIndex, respIndex)).label }}
                <span class="tooltip">{{ getOwnershipInfo(getOwnershipCode(substageIndex, respIndex)).description }}</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.responsibility-table-container {
  margin: var(--spacing-md) 0;
}

/* Sparkline compact view */
.sparkline {
  cursor: pointer;
  display: inline-block;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  transition: box-shadow 0.15s ease;
}

.sparkline:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sparkline-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sparkline-header-row {
  display: flex;
  gap: 1px;
  margin-bottom: 2px;
}

.sparkline-col-label {
  width: 12px;
  font-size: 6px;
  text-align: center;
  color: var(--color-text-light);
  overflow: hidden;
  cursor: help;
}

.sparkline-row {
  display: flex;
  gap: 1px;
  align-items: center;
}

.sparkline-row-label {
  width: 28px;
  font-size: 8px;
  color: var(--color-text-light);
  text-align: right;
  padding-right: 3px;
  flex-shrink: 0;
}

.sparkline-header-row .sparkline-row-label {
  width: 28px;
}

.sparkline-cell {
  width: 12px;
  height: 10px;
  position: relative;
}

.sparkline-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 100;
  transition: opacity 0.15s ease-in-out;
  pointer-events: none;
  margin-bottom: 6px;
}

.sparkline-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
}

.sparkline-cell:hover .sparkline-tooltip {
  visibility: visible;
  opacity: 1;
}

.sparkline-hint {
  font-size: 10px;
  color: var(--color-text-light);
  text-align: center;
  margin-top: var(--spacing-xs);
}

/* Expanded view */
.expanded-view {
  overflow-x: auto;
}

.collapse-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  cursor: pointer;
  margin-bottom: var(--spacing-sm);
}

.collapse-btn:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
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

.responsibility-table .substage-header {
  text-align: right;
  background-color: var(--color-surface);
  font-weight: 600;
  min-width: 80px;
}

.responsibility-header {
  background-color: var(--color-surface);
  font-weight: 600;
  font-size: var(--font-size-xs);
  padding: 0;
  height: 100px;
  min-width: 32px;
  max-width: 32px;
  vertical-align: bottom;
}

.rotated-header {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding-bottom: 6px;
}

.rotated-header span {
  transform: rotate(-55deg);
  transform-origin: left bottom;
  white-space: nowrap;
  display: block;
  padding-left: 4px;
}

.responsibility-table .substage-name {
  text-align: right;
  font-weight: 500;
  white-space: nowrap;
}

.ownership-cell {
  font-weight: 500;
  font-size: var(--font-size-xs);
}

/* Ownership colors - gradient from Human (orange) to AI (blue) */
/* Scale order: H -> S -> AG -> AO -> A */
.ownership-h {
  background-color: #fdba74;
  color: #9a3412;
}

.ownership-s {
  background-color: #fcd34d;
  color: #92400e;
}

.ownership-ag {
  background-color: #fef08a;
  color: #854d0e;
}

.ownership-ao {
  background-color: #a7f3d0;
  color: #065f46;
}

.ownership-a {
  background-color: #bfdbfe;
  color: #1e40af;
}

/* Tooltip for expanded view */
.cell-content {
  position: relative;
  cursor: help;
}

.tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: var(--font-size-xs);
  white-space: nowrap;
  z-index: 100;
  transition: opacity 0.15s ease-in-out;
  pointer-events: none;
  margin-bottom: 4px;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
}

.cell-content:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>
