<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OwnershipCode, OwnershipCodeInfo } from '../types'
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

function hasTransition(respIndex: number): boolean {
  const codes = matrixData.value.matrix.map(row => row[respIndex])
  return new Set(codes).size > 1
}

function getOwnershipCode(substageIndex: number, respIndex: number): OwnershipCode {
  return matrixData.value.matrix[substageIndex]?.[respIndex] || 'H'
}

function getSubstageName(id: string): string {
  return props.substageNames?.[id] || id
}

function toggleExpanded() {
  expanded.value = !expanded.value
}

function getTooltipText(respIndex: number, substageIndex: number): string {
  const code = matrixData.value.matrix[substageIndex]?.[respIndex] || 'H'
  const responsibility = matrixData.value.responsibilities[respIndex]
  const ownership = getOwnershipInfo(code).description
  return `${responsibility}: ${ownership}`
}
</script>

<template>
  <div class="responsibility-table-container" :class="{ expanded }">
    <!-- Compact sparkline view -->
    <div v-if="!expanded" class="sparkline" @click="toggleExpanded">
      <div class="sparkline-grid">
        <div
          v-for="(substageId, substageIndex) in substageIds"
          :key="substageId"
          class="sparkline-row"
        >
          <div
            v-for="(responsibility, respIndex) in matrixData.responsibilities"
            :key="responsibility"
            class="sparkline-cell"
            :class="[getOwnershipClass(getOwnershipCode(substageIndex, respIndex)), { 'has-transition': hasTransition(respIndex) }]"
          >
            <span class="sparkline-tooltip">{{ getTooltipText(respIndex, substageIndex) }}</span>
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
              v-for="(responsibility, respIndex) in matrixData.responsibilities"
              :key="responsibility"
              class="responsibility-header"
              :class="{ 'has-transition': hasTransition(respIndex) }"
            >
              {{ responsibility }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(substageId, substageIndex) in substageIds"
            :key="substageId"
          >
            <td class="substage-name">{{ getSubstageName(substageId) }}</td>
            <td
              v-for="(responsibility, respIndex) in matrixData.responsibilities"
              :key="responsibility"
              class="ownership-cell"
              :class="[getOwnershipClass(getOwnershipCode(substageIndex, respIndex)), { 'has-transition': hasTransition(respIndex) }]"
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

.sparkline-row {
  display: flex;
  gap: 1px;
}

.sparkline-cell {
  width: 8px;
  height: 12px;
  position: relative;
}

.sparkline-cell.has-transition {
  outline: 1px solid #fbbf24;
  outline-offset: -1px;
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

.substage-header {
  text-align: left;
  background-color: var(--color-surface);
  font-weight: 600;
  min-width: 80px;
}

.responsibility-header {
  background-color: var(--color-surface);
  font-weight: 600;
  font-size: var(--font-size-xs);
  min-width: 60px;
  max-width: 120px;
  word-wrap: break-word;
}

.responsibility-header.has-transition {
  background-color: #fef3c7;
}

.substage-name {
  text-align: left;
  font-weight: 500;
  white-space: nowrap;
}

.has-transition {
  background-color: #fffbeb;
}

.ownership-cell {
  font-weight: 500;
  font-size: var(--font-size-xs);
}

/* Ownership colors - gradient from Human (blue) to AI (green) */
.ownership-h {
  background-color: #dbeafe;
  color: #1e40af;
}

.ownership-ag {
  background-color: #a5d8ff;
  color: #1864ab;
}

.ownership-ao {
  background-color: #99e9f2;
  color: #0b7285;
}

.ownership-s {
  background-color: #96f2d7;
  color: #087f5b;
}

.ownership-a {
  background-color: #b2f2bb;
  color: #2b8a3e;
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
