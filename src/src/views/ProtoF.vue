<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const LEVEL_COLORS = ['#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#0e7490']
const LEVEL_BG     = ['#fef2f2', '#fff7ed', '#fffbeb', '#f7fee7', '#f0fdf4', '#ecfeff']
const LEVEL_NAMES  = ['Hope', 'Vigilance', 'Probabilistic', 'Deterministic', 'Prevention', 'Carefree']

const WORRIES = [
  {
    id: 'capability_regression',
    name: 'Capability Regression',
    short: 'Cap. Regression',
    worry: "Did I break something that was working? Who's going to find out in production before I do?",
    surface: 'Number of callers (components, services, customer flows) that depend on the behavior that could break.',
    rateEvent: 'Every time shared code changes.',
    scopeShrinking: [
      { name: 'Feature flags / canary deployments', level: 4, effect: 'Regression rolls back within minutes; affected customers limited to canary cohort' },
      { name: 'Decoupled architecture (no shared state, pure interfaces)', level: 4, effect: 'Regression cannot propagate beyond the component\'s direct consumers' },
      { name: 'Functional / decoupled style (isolation is the easy default)', level: 5, effect: 'Errors are self-contained; cross-component propagation is structurally hard' },
    ],
    efficiency: [
      { name: 'Human code review', level: 1, scope: 'Whatever reviewer noticed' },
      { name: 'AI exploratory testing (edge-case tests after change)', level: 2, scope: 'Bootstraps to Deterministic' },
      { name: 'Unit tests (recipe-based, comprehensive coverage)', level: 3, scope: 'Recipe-defined coverage; predictable gaps remain' },
      { name: 'Theorem provers', level: 4, scope: 'Formally specified invariants only' },
    ],
  },
  {
    id: 'adaptability_reduction',
    name: 'Adaptability Reduction',
    short: 'Adaptability',
    worry: 'Is this change making the codebase harder to change next time? Am I slowly turning our asset into a liability?',
    surface: 'Lines of code or architectural decisions that reduce future flexibility.',
    rateEvent: 'Every time code is written or structure is changed.',
    scopeShrinking: [
      { name: 'Architecture boundary enforcement', level: 3, effect: 'Reduces blast radius of poor structural choices' },
      { name: 'Automated design metrics gates', level: 4, effect: 'Structural degradation detected before merge' },
    ],
    efficiency: [
      { name: 'Human design review', level: 1, scope: 'Reviewer attention span' },
      { name: 'AI design smell detection', level: 2, scope: 'Broader than rules; unpredictable' },
      { name: 'Architecture linters', level: 3, scope: 'Configured rule set' },
    ],
  },
  {
    id: 'documentation_misalignment',
    name: 'Documentation–Code Misalignment',
    short: 'Doc. Alignment',
    worry: 'Does our documentation still describe what the system actually does?',
    surface: 'Number of documented concepts whose documentation no longer matches reality.',
    rateEvent: 'Every change to code not reflected in documentation, or vice versa.',
    scopeShrinking: [
      { name: 'Fewer, well-bounded documented items', level: 3, effect: 'Smaller surface of docs to keep in sync' },
    ],
    efficiency: [
      { name: 'Human review of docs vs. code', level: 1, scope: 'When someone thinks to check' },
      { name: 'AI alignment scan', level: 2, scope: 'Broader than rules; unpredictable' },
      { name: 'Architecture linters', level: 3, scope: 'Configured rule set' },
      { name: 'Auto-generated documentation', level: 4, scope: 'All items expressible in generated form' },
    ],
  },
]

const DOMAINS = [
  {
    id: 'product_work',
    name: 'Product Work',
    workTypes: [
      {
        id: 'adding_new_behavior',
        name: 'Adding New Behavior',
        description: 'Adding new behavior, fixing defects, implementing requirements.',
        businessStake: 'The most visible work, but capability delivered on an adaptability-poor codebase degrades every other facet with each release.',
        worryIds: ['capability_regression', 'adaptability_reduction'],
        agencyPath: [
          { level: 'A1', label: 'AI assists', desc: 'AI suggests; human executes and reviews every line', required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes complete modules; human reviews outcomes', required: 'Cap. regression: Deterministic' },
          { level: 'A3', label: 'AI operates in scope', desc: 'AI implements features autonomously within task boundaries', required: 'Cap. regression: Prevention; adaptability: Deterministic' },
          { level: 'A4', label: 'Human in the loop', desc: 'AI implements and self-tests; human anchors scope', required: 'All major classes: Prevention' },
        ],
      },
      {
        id: 'evolving_the_design',
        name: 'Evolving the Design',
        description: 'Refactoring, restructuring, improving design, extracting abstractions.',
        businessStake: "Every future pivot costs less when the design can absorb it. This is not cleanup — it is preserving the team's ability to act on business decisions.",
        worryIds: ['capability_regression', 'adaptability_reduction'],
        agencyPath: [
          { level: 'A1', label: 'AI assists', desc: 'AI suggests refactoring; human executes each step', required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI executes refactoring sequences; human validates outcomes', required: 'Cap. regression: Deterministic' },
          { level: 'A3', label: 'AI operates in scope', desc: 'AI plans and executes multi-step design improvements', required: 'Cap. regression: Carefree (AST tools); design: Deterministic' },
          { level: 'A4', label: 'Human in the loop', desc: 'AI continuously improves design within architectural principles', required: 'All structural classes: Carefree (AST tools)' },
        ],
      },
    ],
  },
  {
    id: 'process_work',
    name: 'Process Work',
    workTypes: [
      {
        id: 'writing_documentation',
        name: 'Writing Documentation',
        description: 'Creating and maintaining READMEs, API docs, architecture diagrams, decision records.',
        businessStake: 'Documentation is leverage: it multiplies the value of every other investment, or destroys it when it misleads.',
        worryIds: ['documentation_misalignment', 'adaptability_reduction'],
        agencyPath: [
          { level: 'A1', label: 'AI assists', desc: 'AI drafts; human edits and approves', required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes full docs from code; human reviews', required: 'Doc misalignment: Probabilistic' },
          { level: 'A3', label: 'AI operates in scope', desc: 'AI keeps docs in sync automatically', required: 'Doc misalignment: Deterministic' },
          { level: 'A4', label: 'Human in the loop', desc: 'AI manages full doc lifecycle', required: 'Doc misalignment: Prevention' },
        ],
      },
    ],
  },
]

const worryMap = Object.fromEntries(WORRIES.map(w => [w.id, w]))

function bestScope(worryId: string): number {
  const w = worryMap[worryId]
  if (!w?.scopeShrinking?.length) return 0
  return Math.max(...w.scopeShrinking.map((o: any) => o.level))
}
function bestEfficiency(worryId: string): number {
  const w = worryMap[worryId]
  if (!w?.efficiency?.length) return 0
  return Math.max(...w.efficiency.map((o: any) => o.level))
}
function worstScope(worryIds: string[]): number {
  return Math.min(...worryIds.map(bestScope))
}
function domainOf(wtId: string): string {
  return DOMAINS.find(d => d.workTypes.some(w => w.id === wtId))?.name ?? ''
}

// ── Focus state ──────────────────────────────────────────────

const selectedWT     = ref<any>(null)
const selectedWorry  = ref<any>(null)
const startRect      = ref({ top: 0, left: 0, width: 300, height: 220 })
const isExpanded     = ref(false)
const worryVisible   = ref(false)

const overlayStyle = computed((): Record<string, string> => ({
  position: 'fixed',
  top:      isExpanded.value ? '0px'              : `${startRect.value.top}px`,
  left:     isExpanded.value ? '0px'              : `${startRect.value.left}px`,
  width:    isExpanded.value ? '100vw'            : `${startRect.value.width}px`,
  height:   isExpanded.value ? '100vh'            : `${startRect.value.height}px`,
  borderRadius: isExpanded.value ? '0px'          : '14px',
  transition: isExpanded.value ? 'top 420ms cubic-bezier(0.4,0,0.2,1), left 420ms cubic-bezier(0.4,0,0.2,1), width 420ms cubic-bezier(0.4,0,0.2,1), height 420ms cubic-bezier(0.4,0,0.2,1), border-radius 420ms cubic-bezier(0.4,0,0.2,1)' : 'none',
  zIndex: '60',
  overflow: 'hidden',
  background: '#fff',
  boxShadow: isExpanded.value ? 'none' : '0 8px 40px rgba(0,0,0,0.14)',
}))

async function focusWT(wt: any, e: MouseEvent) {
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
    selectedWorry.value = null
  }
  isExpanded.value = false
  await new Promise(res => setTimeout(res, 440))
  selectedWT.value = null
}

function openWorry(worry: any) {
  selectedWorry.value = worry
  nextTick(() => { worryVisible.value = true })
}
function closeWorry() {
  worryVisible.value = false
  setTimeout(() => { selectedWorry.value = null }, 360)
}

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
  <div class="proto-f" @click.self="selectedWT && unfocusWT()">

    <!-- ── Overview board ──────────────────────────────── -->
    <div
      class="board"
      :class="{ 'board-dimmed': !!selectedWT }"
      :style="!selectedWT ? boardStyle : {}"
    >
      <div v-for="domain in DOMAINS" :key="domain.id" class="domain-section">
        <div class="domain-label">{{ domain.name }}</div>
        <div class="wt-row">
          <div
            v-for="wt in domain.workTypes"
            :key="wt.id"
            class="wt-card"
            :data-wt="wt.id"
            @click="focusWT(wt, $event)"
          >
            <!-- Safety signature: colored strip per worry -->
            <div class="wt-sig">
              <div
                v-for="wId in wt.worryIds"
                :key="wId"
                class="sig-seg"
                :style="{ background: LEVEL_COLORS[bestScope(wId)] }"
                :title="`${worryMap[wId]?.short ?? wId} — best scope: ${LEVEL_NAMES[bestScope(wId)]}`"
              ></div>
            </div>

            <!-- Accent border = worst worry scope level -->
            <div class="wt-accent" :style="{ background: LEVEL_COLORS[worstScope(wt.worryIds)] }"></div>

            <div class="wt-card-body">
              <div class="wt-domain-tag">{{ domain.name }}</div>
              <div class="wt-name">{{ wt.name }}</div>
              <div class="wt-desc">{{ wt.description }}</div>

              <div class="wt-worry-badges">
                <span
                  v-for="wId in wt.worryIds"
                  :key="wId"
                  class="worry-badge"
                  :style="{ background: LEVEL_BG[bestScope(wId)], color: LEVEL_COLORS[bestScope(wId)], borderColor: LEVEL_COLORS[bestScope(wId)] }"
                >
                  <span class="wb-dot" :style="{ background: LEVEL_COLORS[bestScope(wId)] }"></span>
                  {{ worryMap[wId]?.short }}
                </span>
              </div>

              <div class="wt-agency-row">
                <span v-for="step in wt.agencyPath" :key="step.level" class="agency-pip">{{ step.level }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Work type overlay (morph) ───────────────────── -->
    <div v-if="selectedWT" class="wt-overlay" :style="overlayStyle">

      <!-- Header -->
      <div class="ov-header">
        <button class="ov-back" @click="unfocusWT">
          <span class="ov-back-arrow">←</span> All work types
        </button>
        <div class="ov-title-block">
          <div class="ov-domain">{{ domainOf(selectedWT.id) }}</div>
          <h1 class="ov-title">{{ selectedWT.name }}</h1>
        </div>
        <div class="ov-header-right">
          <div class="ov-worry-count">{{ selectedWT.worryIds.length }} worries</div>
        </div>
      </div>

      <!-- Body: split when panel open -->
      <div class="ov-body" :class="{ 'panel-open': worryVisible }">

        <!-- Left/main content -->
        <div class="ov-main">
          <p class="ov-stake">{{ selectedWT.businessStake }}</p>

          <!-- Agency path -->
          <div class="ov-agency">
            <div class="ov-agency-label">Agency Delegation Path</div>
            <div class="ov-agency-steps">
              <div v-for="(step, i) in selectedWT.agencyPath" :key="step.level" class="ov-step">
                <div class="ov-step-inner">
                  <div class="ov-step-level">{{ step.level }}</div>
                  <div class="ov-step-label">{{ step.label }}</div>
                  <p class="ov-step-desc">{{ step.desc }}</p>
                  <div
                    class="ov-step-req"
                    :class="step.required === 'No minimum' ? 'req-none' : 'req-set'"
                  >{{ step.required === 'No minimum' ? 'No minimum' : step.required }}</div>
                </div>
                <div class="ov-step-arrow" v-if="i < selectedWT.agencyPath.length - 1">›</div>
              </div>
            </div>
          </div>

          <!-- Worry cards -->
          <div class="ov-worries-label">Worries</div>
          <div class="ov-worries-grid">
            <button
              v-for="wId in selectedWT.worryIds"
              :key="wId"
              class="ov-worry-card"
              :class="{ active: selectedWorry?.id === wId }"
              @click="openWorry(worryMap[wId])"
            >
              <div class="owc-top">
                <div class="owc-name">{{ worryMap[wId]?.name }}</div>
                <div class="owc-rate">{{ worryMap[wId]?.rateEvent }}</div>
              </div>
              <p class="owc-worry">{{ worryMap[wId]?.worry }}</p>
              <div class="owc-levels">
                <div class="owc-level-badge" :style="{ background: LEVEL_COLORS[bestScope(wId)] }">
                  <span>{{ bestScope(wId) }}</span>
                  <span class="owc-badge-label">scope</span>
                </div>
                <div class="owc-level-badge" :style="{ background: LEVEL_COLORS[bestEfficiency(wId)] }">
                  <span>{{ bestEfficiency(wId) }}</span>
                  <span class="owc-badge-label">detect</span>
                </div>
              </div>
              <div class="owc-open">Open →</div>
            </button>
          </div>
        </div>

        <!-- Worry side panel (slides in) -->
        <div class="worry-panel" :class="{ visible: worryVisible }">
          <div class="wp-header">
            <button class="wp-close" @click="closeWorry">✕</button>
            <h2 class="wp-name">{{ selectedWorry?.name }}</h2>
          </div>
          <div class="wp-body" v-if="selectedWorry">
            <blockquote class="wp-worry-q">"{{ selectedWorry.worry }}"</blockquote>

            <div class="wp-meta">
              <div class="wp-meta-row">
                <span class="wp-meta-label">Surface</span>
                <span class="wp-meta-val">{{ selectedWorry.surface }}</span>
              </div>
              <div class="wp-meta-row">
                <span class="wp-meta-label">Rate event</span>
                <span class="wp-meta-val">{{ selectedWorry.rateEvent }}</span>
              </div>
            </div>

            <div class="wp-section-head">Scope-Shrinking Options</div>
            <div class="wp-subtitle">Reduce how much can go wrong before the mistake happens.</div>
            <div class="wp-options">
              <div
                v-for="opt in selectedWorry.scopeShrinking"
                :key="opt.name"
                class="wp-option"
                :style="{ '--ob': LEVEL_BG[opt.level] }"
              >
                <div class="wp-opt-badge" :style="{ background: LEVEL_COLORS[opt.level] }">
                  <span class="wp-opt-n">{{ opt.level }}</span>
                  <span class="wp-opt-name-sm">{{ LEVEL_NAMES[opt.level] }}</span>
                </div>
                <div class="wp-opt-text">
                  <div class="wp-opt-name">{{ opt.name }}</div>
                  <div class="wp-opt-effect">{{ opt.effect }}</div>
                </div>
              </div>
            </div>

            <div class="wp-section-head" style="margin-top:24px">Efficiency Options</div>
            <div class="wp-subtitle">Detect or catch the mistake after it happens.</div>
            <div class="wp-options">
              <div
                v-for="opt in selectedWorry.efficiency"
                :key="opt.name"
                class="wp-option"
                :style="{ '--ob': LEVEL_BG[opt.level] }"
              >
                <div class="wp-opt-badge" :style="{ background: LEVEL_COLORS[opt.level] }">
                  <span class="wp-opt-n">{{ opt.level }}</span>
                  <span class="wp-opt-name-sm">{{ LEVEL_NAMES[opt.level] }}</span>
                </div>
                <div class="wp-opt-text">
                  <div class="wp-opt-name">{{ opt.name }}</div>
                  <div class="wp-opt-effect">{{ opt.scope }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- ov-body -->

      <!-- ── Safety ladder footer ─────────────────────── -->
      <div class="ladder-strip">
        <div class="ls-label">Safety Ladder</div>
        <div class="ls-levels">
          <div v-for="n in [0,1,2,3,4,5]" :key="n" class="ls-level" :style="{ background: LEVEL_COLORS[n] }">
            <span class="ls-n">{{ n }}</span>
            <span class="ls-name">{{ LEVEL_NAMES[n] }}</span>
          </div>
        </div>
      </div>

    </div><!-- wt-overlay -->

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

/* ── Root ─────────────────────────────────────────────────────── */

.proto-f {
  font-family: 'Open Sans', sans-serif;
  background: #eeeae3;
  min-height: 100vh;
  color: #1a1a1a;
  font-size: 13px;
  line-height: 1.5;
  /* Dot-grid texture */
  background-image: radial-gradient(circle, #c8c2b8 1px, transparent 1px);
  background-size: 28px 28px;
  overflow: hidden;
}

/* ── Safety Ladder Strip ──────────────────────────────────────── */

.ladder-strip {
  height: 42px;
  min-height: 42px;
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

.ls-levels {
  display: flex;
  gap: 3px;
  flex: 1;
}

.ls-level {
  flex: 1;
  height: 22px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: default;
}

.ls-n {
  font-size: 11px;
  font-weight: 800;
  color: #fff;
}

.ls-name {
  font-size: 9.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.02em;
}

/* ── Board (overview) ─────────────────────────────────────────── */

.board {
  padding: 32px 40px 40px;
  min-height: 100vh;
  transition: opacity 380ms, filter 380ms, transform 380ms cubic-bezier(0.4,0,0.2,1);
  transform-style: preserve-3d;
}

.board-dimmed {
  opacity: 0.22;
  filter: blur(3px) saturate(0.6);
  pointer-events: none;
}

.domain-section {
  margin-bottom: 32px;
}

.domain-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 12px;
  padding-left: 4px;
}

.wt-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* ── Work type card (overview) ────────────────────────────────── */

.wt-card {
  width: 272px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
  transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms;
  user-select: none;
}

.wt-card:hover {
  transform: translateY(-5px) scale(1.015);
  box-shadow: 0 12px 36px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04);
}

.wt-sig {
  height: 8px;
  display: flex;
}

.sig-seg {
  flex: 1;
}

.wt-accent {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 0;
  width: 4px;
}

.wt-card-body {
  padding: 14px 16px 16px 22px;
}

.wt-domain-tag {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #aaa;
  margin-bottom: 4px;
}

.wt-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  line-height: 1.3;
}

.wt-desc {
  font-size: 11.5px;
  color: #999;
  font-style: italic;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wt-worry-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.worry-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px 3px 5px;
  border-radius: 10px;
  border: 1px solid;
}

.wb-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.wt-agency-row {
  display: flex;
  gap: 4px;
}

.agency-pip {
  font-size: 9.5px;
  font-weight: 700;
  color: #76232f;
  background: #fef5f4;
  border: 1px solid #f0cdc9;
  border-radius: 4px;
  padding: 2px 6px;
  letter-spacing: 0.02em;
}

/* ── Work type overlay ────────────────────────────────────────── */

.wt-overlay {
  display: flex;
  flex-direction: column;
}

.ov-header {
  height: 64px;
  min-height: 64px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 20px;
  flex-shrink: 0;
}

.ov-back {
  display: flex;
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

.ov-back-arrow { font-size: 14px; }

.ov-title-block { flex: 1; }

.ov-domain {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  margin-bottom: 1px;
}

.ov-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.ov-header-right {}

.ov-worry-count {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}

/* ── Overlay body ─────────────────────────────────────────────── */

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
  transition: padding-right 360ms cubic-bezier(0.4,0,0.2,1);
}

.ov-body.panel-open .ov-main {
  padding-right: 36px;
  filter: brightness(0.94);
}

.ov-stake {
  font-size: 15px;
  font-style: italic;
  color: #555;
  margin: 0 0 28px;
  line-height: 1.7;
  max-width: 640px;
  border-left: 3px solid #76232f;
  padding-left: 16px;
}

/* Agency path */
.ov-agency { margin-bottom: 32px; }

.ov-agency-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 14px;
}

.ov-agency-steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
}

.ov-step {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.ov-step-inner {
  background: #f9f8f6;
  border: 1px solid #e8e0db;
  border-radius: 8px;
  padding: 12px 14px;
  width: 170px;
  transition: box-shadow 150ms;
}

.ov-step-inner:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.ov-step-level {
  font-size: 10.5px;
  font-weight: 800;
  color: #76232f;
  margin-bottom: 3px;
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
  margin: 0 0 8px;
  line-height: 1.5;
  font-style: italic;
}

.ov-step-req {
  font-size: 10.5px;
  padding: 3px 8px;
  border-radius: 4px;
  line-height: 1.4;
}

.ov-step-req.req-none {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.ov-step-req.req-set {
  background: #fef5f4;
  color: #76232f;
  border: 1px solid #f0cdc9;
}

.ov-step-arrow {
  font-size: 20px;
  color: #ccc;
  padding: 0 4px;
  flex-shrink: 0;
  margin-top: -8px;
}

/* Worry cards in overlay */
.ov-worries-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 14px;
}

.ov-worries-grid {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.ov-worry-card {
  width: 260px;
  background: #f9f8f6;
  border: 1.5px solid #e8e0db;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 180ms;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ov-worry-card:hover,
.ov-worry-card.active {
  background: #fff;
  border-color: #76232f;
  box-shadow: 0 4px 20px rgba(118,35,47,0.12);
  transform: translateY(-2px);
}

.owc-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1px;
}

.owc-rate {
  font-size: 10.5px;
  color: #bbb;
}

.owc-worry {
  font-size: 12px;
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
  gap: 6px;
}

.owc-level-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.owc-badge-label {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.owc-open {
  font-size: 11px;
  font-weight: 700;
  color: #76232f;
  margin-top: auto;
}

/* ── Worry side panel ─────────────────────────────────────────── */

.worry-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 44%;
  min-width: 360px;
  max-width: 520px;
  background: #fff;
  border-left: 1px solid #e8e0db;
  box-shadow: -8px 0 40px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 360ms cubic-bezier(0.4,0,0.2,1);
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.worry-panel.visible {
  transform: translateX(0);
}

.wp-header {
  padding: 18px 20px 14px;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
  transition: all 140ms;
}

.wp-close:hover {
  background: #f5f3f0;
  color: #333;
}

.wp-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.wp-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 32px;
}

.wp-worry-q {
  font-style: italic;
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 18px;
  padding-left: 14px;
  border-left: 3px solid #e8ddd9;
}

.wp-meta {
  background: #f9f8f6;
  border: 1px solid #ece5e0;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wp-meta-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wp-meta-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #bbb;
}

.wp-meta-val {
  font-size: 12.5px;
  color: #444;
  line-height: 1.5;
}

.wp-section-head {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 4px;
}

.wp-subtitle {
  font-size: 11.5px;
  color: #aaa;
  font-style: italic;
  margin-bottom: 10px;
}

.wp-options {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.wp-option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 9px 10px;
  background: var(--ob, #fafafa);
  border-radius: 7px;
}

.wp-opt-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  flex-shrink: 0;
  gap: 1px;
}

.wp-opt-n {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.wp-opt-name-sm {
  font-size: 7.5px;
  color: rgba(255,255,255,0.85);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.wp-opt-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 2px;
}

.wp-opt-effect {
  font-size: 11.5px;
  color: #888;
  line-height: 1.5;
}
</style>
