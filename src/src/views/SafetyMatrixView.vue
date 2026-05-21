<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useSafetyData } from '@/composables/useSafetyData'
import { useMarkdown } from '@/composables/useMarkdown'
import type { WorkType, WorryRef } from '@/types'

const {
  safetyLadder, domains, worryMap,
  bestScopeLevel, bestEfficiencyLevel, worstScopeLevel,
  mergedScopeOptions, domainOfWorkType,
} = useSafetyData()

const { md } = useMarkdown()

// ── Safety level palette ─────────────────────────────────────

const LEVEL_COLORS = ['#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#0e7490']
const LEVEL_BG     = ['#fef2f2', '#fff7ed', '#fffbeb', '#f7fee7', '#f0fdf4', '#ecfeff']

function levelColor(n: number) { return LEVEL_COLORS[n] ?? '#999' }
function levelBg(n: number)    { return LEVEL_BG[n]    ?? '#f5f5f5' }
function levelName(n: number)  { return safetyLadder.value.find(l => l.level === n)?.name ?? '' }

// ── Focus state ──────────────────────────────────────────────

const selectedWT    = ref<WorkType | null>(null)
const selectedRef   = ref<WorryRef | null>(null)   // the WorryRef from the work type (carries context_note etc.)
const startRect     = ref({ top: 0, left: 0, width: 300, height: 200 })
const isExpanded    = ref(false)
const worryVisible  = ref(false)

const overlayStyle = computed((): Record<string, string> => ({
  position: 'fixed',
  top:    isExpanded.value ? '0px'   : `${startRect.value.top}px`,
  left:   isExpanded.value ? '0px'   : `${startRect.value.left}px`,
  width:  isExpanded.value ? '100vw' : `${startRect.value.width}px`,
  height: isExpanded.value ? '100vh' : `${startRect.value.height}px`,
  borderRadius: isExpanded.value ? '0px' : '14px',
  transition: isExpanded.value
    ? 'top 420ms cubic-bezier(0.4,0,0.2,1), left 420ms cubic-bezier(0.4,0,0.2,1), width 420ms cubic-bezier(0.4,0,0.2,1), height 420ms cubic-bezier(0.4,0,0.2,1), border-radius 420ms cubic-bezier(0.4,0,0.2,1)'
    : 'none',
  zIndex: '60',
  overflow: 'hidden',
  background: '#fff',
  boxShadow: isExpanded.value ? 'none' : '0 8px 40px rgba(0,0,0,0.14)',
}))

async function focusWT(wt: WorkType, e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r  = el.getBoundingClientRect()
  startRect.value  = { top: r.top, left: r.left, width: r.width, height: r.height }
  isExpanded.value = false
  selectedWT.value = wt
  await nextTick()
  await new Promise<void>(res => requestAnimationFrame(() => requestAnimationFrame(() => res())))
  isExpanded.value = true
}

async function unfocusWT() {
  if (worryVisible.value) {
    worryVisible.value = false
    await new Promise(res => setTimeout(res, 340))
    selectedRef.value = null
  }
  isExpanded.value = false
  await new Promise(res => setTimeout(res, 440))
  selectedWT.value = null
}

function openWorry(ref: WorryRef) {
  selectedRef.value = ref
  nextTick(() => { worryVisible.value = true })
}

function closeWorry() {
  worryVisible.value = false
  setTimeout(() => { selectedRef.value = null }, 360)
}

// Resolved worry for the selected ref
const selectedWorry = computed(() =>
  selectedRef.value ? worryMap.value[selectedRef.value.worry_id] : null
)

// Merged scope options: base from worry + additional from the WorryRef
const mergedScope = computed(() =>
  selectedRef.value ? mergedScopeOptions(selectedRef.value) : []
)

// ── Mouse parallax tilt ──────────────────────────────────────

const tilt = ref({ x: 0, y: 0 })

function onMouseMove(e: MouseEvent) {
  if (selectedWT.value) return
  tilt.value = {
    x: ((e.clientX / window.innerWidth)  - 0.5) * 5,
    y: ((e.clientY / window.innerHeight) - 0.5) * 3,
  }
}

onMounted(()  => window.addEventListener('mousemove', onMouseMove))
onUnmounted(() => window.removeEventListener('mousemove', onMouseMove))

const boardStyle = computed(() => ({
  transform: `perspective(1800px) rotateX(${-tilt.value.y}deg) rotateY(${tilt.value.x}deg)`,
  transition: 'transform 100ms linear',
}))
</script>

<template>
  <div class="safety-matrix">

    <!-- ── Overview board ──────────────────────────────── -->
    <div
      class="board"
      :class="{ 'board-dimmed': !!selectedWT }"
      :style="!selectedWT ? boardStyle : {}"
    >
      <div
        v-for="domain in domains"
        :key="domain.id"
        class="domain-cell"
      >
        <div class="domain-label">{{ domain.name }}</div>
        <div class="wt-list">
          <div
            v-for="wt in domain.work_types"
            :key="wt.id"
            class="wt-card"
            :data-wt="wt.id"
            @click="focusWT(wt, $event)"
          >
            <!-- Safety signature: one colored segment per worry -->
            <div class="wt-sig">
              <div
                v-for="ref in wt.worries"
                :key="ref.worry_id"
                class="sig-seg"
                :style="{ background: levelColor(bestScopeLevel(ref.worry_id)) }"
              ></div>
            </div>

            <!-- Worst-worry accent on left edge -->
            <div
              class="wt-accent"
              :style="{ background: levelColor(worstScopeLevel(wt.worries)) }"
            ></div>

            <div class="wt-card-body">
              <div class="wt-name">{{ wt.name }}</div>
              <div class="wt-desc">{{ wt.description_markdown }}</div>
              <div class="wt-badges">
                <span
                  v-for="ref in wt.worries"
                  :key="ref.worry_id"
                  class="worry-badge"
                >{{ worryMap[ref.worry_id]?.name ?? ref.worry_id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Work type overlay (morph) ───────────────────── -->
    <div v-if="selectedWT" class="wt-overlay" :style="overlayStyle">

      <div class="ov-header">
        <button class="ov-back" @click="unfocusWT">
          <span>←</span> All work types
        </button>
        <div class="ov-title-block">
          <div class="ov-domain">{{ domainOfWorkType(selectedWT.id)?.name }}</div>
          <h1 class="ov-title">{{ selectedWT.name }}</h1>
        </div>
        <div class="ov-worry-count">{{ selectedWT.worries.length }} worr{{ selectedWT.worries.length === 1 ? 'y' : 'ies' }}</div>
      </div>

      <div class="ov-body" :class="{ 'panel-open': worryVisible }">

        <!-- Main content -->
        <div class="ov-main">
          <p class="ov-stake" v-html="md(selectedWT.business_stake_markdown)"></p>

          <!-- Agency path -->
          <div class="ov-agency">
            <div class="ov-agency-label">Agency Delegation Path</div>
            <div class="ov-agency-steps">
              <div
                v-for="(step, i) in selectedWT.agency_path"
                :key="step.agency_level"
                class="ov-step"
              >
                <div class="ov-step-inner">
                  <div class="ov-step-level">{{ step.agency_level }}</div>
                  <div class="ov-step-label">{{ step.label }}</div>
                  <p class="ov-step-desc">{{ step.description }}</p>
                  <div
                    class="ov-step-req"
                    :class="step.safety_required === 'No minimum' ? 'req-none' : 'req-set'"
                  >{{ step.safety_required === 'No minimum' ? 'No minimum' : step.safety_required }}</div>
                </div>
                <div class="ov-step-arrow" v-if="i < selectedWT.agency_path.length - 1">›</div>
              </div>
            </div>
          </div>

          <!-- Worry cards -->
          <div class="ov-worries-label">Worries</div>
          <div class="ov-worries-grid">
            <button
              v-for="ref in selectedWT.worries"
              :key="ref.worry_id"
              class="ov-worry-card"
              :class="{ active: selectedRef?.worry_id === ref.worry_id }"
              @click="openWorry(ref)"
            >
              <div class="owc-name">{{ worryMap[ref.worry_id]?.name }}</div>
              <div class="owc-rate">{{ worryMap[ref.worry_id]?.rate_event }}</div>
              <p class="owc-worry">{{ worryMap[ref.worry_id]?.worry }}</p>
              <div class="owc-levels">
                <div class="owc-badge" :style="{ background: levelColor(bestScopeLevel(ref.worry_id)) }">
                  <span>{{ bestScopeLevel(ref.worry_id) }}</span>
                  <span class="owc-badge-label">scope</span>
                </div>
                <div class="owc-badge" :style="{ background: levelColor(bestEfficiencyLevel(ref.worry_id)) }">
                  <span>{{ bestEfficiencyLevel(ref.worry_id) }}</span>
                  <span class="owc-badge-label">detect</span>
                </div>
              </div>
              <div class="owc-open">Open →</div>
            </button>
          </div>
        </div>

        <!-- Worry side panel -->
        <div class="worry-panel" :class="{ visible: worryVisible }">
          <div class="wp-header">
            <button class="wp-close" @click="closeWorry">✕</button>
            <h2 class="wp-name">{{ selectedWorry?.name }}</h2>
          </div>

          <div class="wp-body" v-if="selectedWorry && selectedRef">

            <!-- Work-type-specific context note (if present) -->
            <div v-if="selectedRef.context_note" class="wp-context-note">
              <span class="wp-context-label">In this context</span>
              {{ selectedRef.context_note }}
            </div>

            <blockquote class="wp-quote">"{{ selectedWorry.worry }}"</blockquote>

            <div class="wp-meta">
              <div class="wp-meta-row">
                <span class="wp-meta-label">Surface</span>
                <span class="wp-meta-val">{{ selectedWorry.worry_surface }}</span>
              </div>
              <div class="wp-meta-row">
                <span class="wp-meta-label">Rate event</span>
                <span class="wp-meta-val">{{ selectedWorry.rate_event }}</span>
              </div>
              <div v-if="selectedWorry.note" class="wp-meta-row">
                <span class="wp-meta-label">Note</span>
                <span class="wp-meta-val">{{ selectedWorry.note }}</span>
              </div>
            </div>

            <!-- Scope-shrinking (merged: base + additional from WorryRef) -->
            <div class="wp-section-head">Scope-Shrinking Options</div>
            <div class="wp-section-sub">Reduce how much can go wrong before the mistake happens.</div>
            <div class="wp-options">
              <div
                v-for="opt in mergedScope"
                :key="opt.name"
                class="wp-option"
                :style="{ background: levelBg(opt.safety_level) }"
              >
                <div class="wp-opt-badge" :style="{ background: levelColor(opt.safety_level) }">
                  <span class="wp-opt-n">{{ opt.safety_level }}</span>
                  <span class="wp-opt-lname">{{ levelName(opt.safety_level) }}</span>
                </div>
                <div class="wp-opt-text">
                  <div class="wp-opt-name">{{ opt.name }}</div>
                  <div class="wp-opt-detail">{{ opt.effect }}</div>
                </div>
              </div>
            </div>

            <!-- Efficiency options -->
            <div class="wp-section-head" style="margin-top: 24px">Efficiency Options</div>
            <div class="wp-section-sub">Detect or catch the mistake after it happens.</div>
            <div class="wp-options">
              <div
                v-for="opt in selectedWorry.efficiency_options"
                :key="opt.name"
                class="wp-option"
                :style="{ background: levelBg(opt.safety_level) }"
              >
                <div class="wp-opt-badge" :style="{ background: levelColor(opt.safety_level) }">
                  <span class="wp-opt-n">{{ opt.safety_level }}</span>
                  <span class="wp-opt-lname">{{ levelName(opt.safety_level) }}</span>
                </div>
                <div class="wp-opt-text">
                  <div class="wp-opt-name">{{ opt.name }}</div>
                  <div class="wp-opt-detail">{{ opt.scope }}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div><!-- ov-body -->

      <!-- Safety ladder footer -->
      <div class="ladder-strip">
        <div class="ls-label">Safety Ladder</div>
        <div class="ls-levels">
          <div
            v-for="l in [...safetyLadder].reverse()"
            :key="l.level"
            class="ls-level"
            :style="{ background: levelColor(l.level) }"
            :title="l.what_it_means"
          >
            <span class="ls-n">{{ l.level }}</span>
            <span class="ls-name">{{ l.name }}</span>
          </div>
        </div>
      </div>

    </div><!-- wt-overlay -->

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

.safety-matrix {
  font-family: 'Open Sans', sans-serif;
  background: #eeeae3;
  min-height: 100vh;
  color: #1a1a1a;
  font-size: 13px;
  line-height: 1.5;
  background-image: radial-gradient(circle, #c8c2b8 1px, transparent 1px);
  background-size: 28px 28px;
  overflow: hidden;
}

/* ── Board ────────────────────────────────────────────────── */

.board {
  padding: 32px 40px 40px;
  height: 100vh;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 32px 40px;
  transition: opacity 380ms, filter 380ms, transform 380ms cubic-bezier(0.4,0,0.2,1);
  transform-style: preserve-3d;
}

.board-dimmed {
  opacity: 0.22;
  filter: blur(3px) saturate(0.6);
  pointer-events: none;
}

/* ── Domain cell ──────────────────────────────────────────── */

.domain-cell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.domain-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 10px;
  padding-left: 4px;
  flex-shrink: 0;
}

.wt-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: #c8c2b8 transparent;
}

/* ── Work type card ───────────────────────────────────────── */

.wt-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
  transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 180ms;
  user-select: none;
}

.wt-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 8px 28px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
}

.wt-sig {
  height: 6px;
  display: flex;
}

.sig-seg { flex: 1; }

.wt-accent {
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 0;
  width: 3px;
}

.wt-card-body {
  padding: 10px 12px 12px 17px;
}

.wt-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2px;
  line-height: 1.3;
}

.wt-desc {
  font-size: 11px;
  color: #aaa;
  font-style: italic;
  margin-bottom: 8px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wt-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.worry-badge {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 8px;
  background: #ece8e2;
  color: #6a6258;
  border: 1px solid #ddd8d0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* ── Work type overlay ────────────────────────────────────── */

.wt-overlay {
  display: flex;
  flex-direction: column;
}

.ov-header {
  height: 60px;
  min-height: 60px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 20px;
  flex-shrink: 0;
}

.ov-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  color: rgba(255,255,255,0.7);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 150ms;
  white-space: nowrap;
  flex-shrink: 0;
}

.ov-back:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.ov-title-block { flex: 1; }

.ov-domain {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}

.ov-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.ov-worry-count {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}

/* ── Overlay body ─────────────────────────────────────────── */

.ov-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.ov-main {
  flex: 1;
  overflow-y: auto;
  padding: 28px 36px 40px;
  transition: filter 300ms;
}

.ov-body.panel-open .ov-main {
  filter: brightness(0.93);
}

.ov-stake {
  font-size: 14.5px;
  font-style: italic;
  color: #555;
  margin: 0 0 26px;
  line-height: 1.7;
  max-width: 680px;
  border-left: 3px solid #76232f;
  padding-left: 16px;
}

/* Agency path */
.ov-agency { margin-bottom: 30px; }

.ov-agency-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 12px;
}

.ov-agency-steps {
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 4px;
  gap: 0;
}

.ov-step {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.ov-step-inner {
  background: #f9f8f6;
  border: 1px solid #e8e0db;
  border-radius: 8px;
  padding: 12px 14px;
  width: 168px;
}

.ov-step-level {
  font-size: 10px;
  font-weight: 800;
  color: #76232f;
  margin-bottom: 2px;
  letter-spacing: 0.04em;
}

.ov-step-label {
  font-size: 12px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  line-height: 1.3;
}

.ov-step-desc {
  font-size: 11px;
  color: #888;
  margin: 0 0 7px;
  line-height: 1.5;
  font-style: italic;
}

.ov-step-req {
  font-size: 10.5px;
  padding: 3px 7px;
  border-radius: 4px;
  line-height: 1.4;
}

.req-none { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.req-set  { background: #fef5f4; color: #76232f; border: 1px solid #f0cdc9; }

.ov-step-arrow {
  font-size: 20px;
  color: #ccc;
  padding: 0 4px;
  flex-shrink: 0;
  margin-top: -8px;
}

/* Worry cards */
.ov-worries-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 12px;
}

.ov-worries-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ov-worry-card {
  width: 240px;
  background: #f9f8f6;
  border: 1.5px solid #e8e0db;
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 180ms;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ov-worry-card:hover,
.ov-worry-card.active {
  background: #fff;
  border-color: #76232f;
  box-shadow: 0 4px 18px rgba(118,35,47,0.11);
  transform: translateY(-2px);
}

.owc-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.owc-rate {
  font-size: 10px;
  color: #bbb;
}

.owc-worry {
  font-size: 11.5px;
  font-style: italic;
  color: #888;
  margin: 0;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.owc-levels {
  display: flex;
  gap: 5px;
  margin-top: 2px;
}

.owc-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 5px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.owc-badge-label {
  font-size: 8.5px;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.owc-open {
  font-size: 11px;
  font-weight: 700;
  color: #76232f;
}

/* ── Worry panel ──────────────────────────────────────────── */

.worry-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 44%;
  min-width: 380px;
  max-width: 540px;
  background: #fff;
  border-left: 1px solid #e8e0db;
  box-shadow: -8px 0 40px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 360ms cubic-bezier(0.4,0,0.2,1);
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.worry-panel.visible { transform: translateX(0); }

.wp-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0ebe6;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
}

.wp-close {
  background: none;
  border: 1px solid #e8e0db;
  border-radius: 6px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
  transition: all 140ms;
}

.wp-close:hover { background: #f5f3f0; color: #333; }

.wp-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.wp-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px 32px;
}

.wp-context-note {
  background: #fef5f4;
  border: 1px solid #f0cdc9;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 12.5px;
  color: #76232f;
  line-height: 1.55;
}

.wp-context-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  display: block;
  margin-bottom: 3px;
  opacity: 0.7;
}

.wp-quote {
  font-style: italic;
  font-size: 13.5px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 16px;
  padding-left: 13px;
  border-left: 3px solid #e8ddd9;
}

.wp-meta {
  background: #f9f8f6;
  border: 1px solid #ece5e0;
  border-radius: 7px;
  padding: 11px 14px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.wp-meta-row { display: flex; flex-direction: column; gap: 2px; }

.wp-meta-label {
  font-size: 8.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #bbb;
}

.wp-meta-val {
  font-size: 12px;
  color: #444;
  line-height: 1.5;
}

.wp-section-head {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 3px;
}

.wp-section-sub {
  font-size: 11.5px;
  color: #aaa;
  font-style: italic;
  margin-bottom: 9px;
}

.wp-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wp-option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 6px;
}

.wp-opt-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 7px;
  flex-shrink: 0;
  gap: 1px;
}

.wp-opt-n    { font-size: 15px; font-weight: 800; color: #fff; line-height: 1; }
.wp-opt-lname { font-size: 7px; color: rgba(255,255,255,0.85); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

.wp-opt-name   { font-size: 12px; font-weight: 600; color: #1a1a1a; line-height: 1.4; margin-bottom: 2px; }
.wp-opt-detail { font-size: 11px; color: #888; line-height: 1.5; }

/* ── Safety ladder footer ─────────────────────────────────── */

.ladder-strip {
  height: 40px;
  min-height: 40px;
  background: rgba(26, 26, 26, 0.96);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
  flex-shrink: 0;
}

.ls-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}

.ls-levels { display: flex; gap: 3px; flex: 1; }

.ls-level {
  flex: 1;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: default;
  transition: filter 150ms;
}

.ls-level:hover { filter: brightness(1.1); }

.ls-n    { font-size: 11px; font-weight: 800; color: #fff; }
.ls-name { font-size: 9px; font-weight: 600; color: rgba(255,255,255,0.85); letter-spacing: 0.02em; }
</style>
