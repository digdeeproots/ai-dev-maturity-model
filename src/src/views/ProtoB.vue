<script setup lang="ts">
import { ref } from 'vue'

const LEVEL_COLORS = ['#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#0e7490']
const LEVEL_BG = ['#fef2f2', '#fff7ed', '#fffbeb', '#f7fee7', '#f0fdf4', '#ecfeff']
const LEVEL_NAMES = ['Hope', 'Vigilance', 'Probabilistic', 'Deterministic', 'Prevention', 'Carefree']

const SAFETY_LADDER = [
  { level: 5, name: 'Carefree', desc: 'The system makes the right action easy and mistakes structurally hard. Careless implementors thrive.', canReachZero: true },
  { level: 4, name: 'Prevention', desc: 'Mistakes cannot propagate past the originator. Careless is fine within well-defined scopes.', canReachZero: true },
  { level: 3, name: 'Deterministic', desc: 'Known worries are reliably caught. Careless is fine for covered ones.', canReachZero: false },
  { level: 2, name: 'Probabilistic', desc: 'Errors are sometimes caught. Careless is sometimes fine.', canReachZero: false },
  { level: 1, name: 'Vigilance', desc: 'Errors are caught only when someone is paying attention. Careless is never fine.', canReachZero: false },
  { level: 0, name: 'Hope', desc: 'No mechanism exists. Errors propagate undetected.', canReachZero: false },
]

const WORRIES = [
  {
    id: 'capability_regression',
    name: 'Capability Regression',
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
      { name: 'AI exploratory testing', level: 2, scope: 'Bootstraps to Deterministic' },
      { name: 'Unit tests (comprehensive coverage)', level: 3, scope: 'Recipe-defined coverage; predictable gaps remain' },
      { name: 'Theorem provers', level: 4, scope: 'Formally specified invariants only' },
    ],
  },
  {
    id: 'adaptability_reduction',
    name: 'Adaptability Reduction',
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
    name: 'Docs–Code Misalignment',
    worry: 'Does our documentation still describe what the system actually does?',
    surface: 'Number of documented concepts whose documentation no longer matches reality.',
    rateEvent: 'Every change to code not reflected in documentation.',
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
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes complete modules; human reviews outcomes', required: 'Capability regression: Deterministic' },
          { level: 'A3', label: 'AI operates in scope', desc: 'AI implements features autonomously within task boundaries', required: 'Capability regression: Prevention or Carefree scope-shrinking; adaptability: Deterministic' },
          { level: 'A4', label: 'Human in the loop', desc: 'AI implements and self-tests; human anchors scope', required: 'All major classes: Prevention; escalation: circuit breakers' },
        ],
      },
      {
        id: 'evolving_the_design',
        name: 'Evolving the Design',
        description: 'Refactoring, restructuring, improving design, extracting abstractions.',
        businessStake: "Every future pivot costs less when the design can absorb it. Not cleanup — preserving the team's ability to act on business decisions.",
        worryIds: ['capability_regression', 'adaptability_reduction'],
        agencyPath: [
          { level: 'A1', label: 'AI assists', desc: 'AI suggests refactoring; human executes each step', required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI executes refactoring sequences; human validates outcomes', required: 'Capability regression: Deterministic' },
          { level: 'A3', label: 'AI operates in scope', desc: 'AI plans and executes multi-step design improvements', required: 'Capability regression: Carefree (AST tools); design regression: Deterministic' },
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
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes full docs from code; human reviews', required: 'Documentation misalignment: Probabilistic' },
          { level: 'A3', label: 'AI operates in scope', desc: 'AI keeps docs in sync automatically', required: 'Documentation misalignment: Deterministic' },
          { level: 'A4', label: 'Human in the loop', desc: 'AI manages full doc lifecycle', required: 'Documentation misalignment: Prevention; all other: Deterministic' },
        ],
      },
    ],
  },
]

const worryMap = Object.fromEntries(WORRIES.map(w => [w.id, w]))

const expandedId = ref<string | null>('adding_new_behavior')
const expandedPills = ref<string[]>([])

function toggleRow(id: string) {
  expandedId.value = expandedId.value === id ? null : id
  expandedPills.value = []
}

function togglePill(key: string) {
  const i = expandedPills.value.indexOf(key)
  if (i >= 0) expandedPills.value.splice(i, 1)
  else expandedPills.value.push(key)
}

function maxScopeLevel(worryId: string): number {
  const w = worryMap[worryId]
  if (!w || w.scopeShrinking.length === 0) return 0
  return Math.max(...w.scopeShrinking.map((o: any) => o.level))
}

function maxEfficiencyLevel(worryId: string): number {
  const w = worryMap[worryId]
  if (!w || w.efficiency.length === 0) return 0
  return Math.max(...w.efficiency.map((o: any) => o.level))
}

function highestAgencyLabel(wt: any): string {
  return wt.agencyPath[wt.agencyPath.length - 1]?.level ?? 'A1'
}
</script>

<template>
  <div class="proto-b">
    <!-- ── Top Header ── -->
    <header class="board-header">
      <div class="header-left">
        <div class="header-eyebrow">Careless Safety</div>
        <h1 class="header-title">Safety Matrix</h1>
      </div>
      <div class="spectrum-wrap">
        <div class="spectrum-label">SAFETY SPECTRUM</div>
        <div class="spectrum-bar">
          <div
            v-for="l in SAFETY_LADDER"
            :key="l.level"
            class="spectrum-seg"
            :style="{ background: LEVEL_COLORS[l.level] }"
            :title="l.name + ': ' + l.desc"
          >
            <span class="seg-num">{{ l.level }}</span>
            <span class="seg-name">{{ l.name }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Board Content ── -->
    <div class="board-content">
      <div v-for="domain in DOMAINS" :key="domain.id" class="domain-section">
        <div class="domain-banner">
          <span class="domain-code">{{ domain.id.replace('_', ' ').toUpperCase() }}</span>
          <span class="domain-name">{{ domain.name }}</span>
          <span class="wt-count">{{ domain.workTypes.length }} work types</span>
        </div>

        <div class="wt-rows">
          <div
            v-for="wt in domain.workTypes"
            :key="wt.id"
            class="wt-row"
            :class="{ 'is-open': expandedId === wt.id }"
          >
            <!-- Row summary -->
            <button class="row-summary" @click="toggleRow(wt.id)">
              <div class="row-main">
                <div class="row-name">{{ wt.name }}</div>
                <div class="row-desc">{{ wt.description }}</div>
              </div>
              <div class="row-indicators">
                <div class="indicator-group">
                  <span class="ind-label">worries</span>
                  <div class="worry-dots">
                    <span
                      v-for="wId in wt.worryIds"
                      :key="wId"
                      class="worry-dot"
                      :style="{ background: LEVEL_COLORS[maxScopeLevel(wId)], boxShadow: `0 0 0 2px ${LEVEL_BG[maxScopeLevel(wId)]}` }"
                      :title="worryMap[wId]?.name + ' — best scope level: ' + LEVEL_NAMES[maxScopeLevel(wId)]"
                    ></span>
                  </div>
                </div>
                <div class="indicator-group">
                  <span class="ind-label">max agency</span>
                  <span class="agency-badge">{{ highestAgencyLabel(wt) }}</span>
                </div>
              </div>
              <span class="row-chevron" :class="{ open: expandedId === wt.id }">▾</span>
            </button>

            <!-- Expanded Detail -->
            <div v-if="expandedId === wt.id" class="row-detail">
              <div class="detail-stake">
                <span class="stake-pill">Business Stake</span>
                {{ wt.businessStake }}
              </div>

              <!-- Agency Progression -->
              <div class="agency-prog-wrap">
                <div class="prog-label">Agency Delegation</div>
                <div class="agency-prog">
                  <div
                    v-for="(step, i) in wt.agencyPath"
                    :key="step.level"
                    class="prog-step"
                  >
                    <div class="prog-box">
                      <div class="prog-level">{{ step.level }}</div>
                      <div class="prog-step-label">{{ step.label }}</div>
                      <div
                        class="prog-req"
                        :class="step.required === 'No minimum' ? 'req-none' : 'req-set'"
                      >
                        {{ step.required === 'No minimum' ? '— none —' : step.required }}
                      </div>
                    </div>
                    <div class="prog-arrow" v-if="i < wt.agencyPath.length - 1">›</div>
                  </div>
                </div>
              </div>

              <!-- Worries compact -->
              <div class="detail-worries">
                <div class="detail-worries-label">Worries</div>
                <div class="compact-worries">
                  <div
                    v-for="wId in wt.worryIds"
                    :key="wId"
                    class="compact-worry"
                  >
                    <button class="cw-header" @click="togglePill(`scope-${wId}`)">
                      <div class="cw-left">
                        <span class="cw-dot" :style="{ background: LEVEL_COLORS[maxScopeLevel(wId)] }"></span>
                        <span class="cw-name">{{ worryMap[wId]?.name }}</span>
                      </div>
                      <div class="cw-right">
                        <span class="cw-pill" :style="{ background: LEVEL_COLORS[maxScopeLevel(wId)] }">scope {{ maxScopeLevel(wId) }}</span>
                        <span class="cw-pill eff" :style="{ background: LEVEL_COLORS[maxEfficiencyLevel(wId)] }">eff {{ maxEfficiencyLevel(wId) }}</span>
                        <span class="cw-chevron" :class="{ open: expandedPills.includes(`scope-${wId}`) }">▾</span>
                      </div>
                    </button>
                    <div v-if="expandedPills.includes(`scope-${wId}`)" class="cw-pills-body">
                      <div class="pills-section">
                        <span class="pills-section-label">Scope-shrinking</span>
                        <div class="option-pills">
                          <span
                            v-for="opt in worryMap[wId]?.scopeShrinking"
                            :key="opt.name"
                            class="option-pill"
                            :style="{ background: LEVEL_BG[opt.level], borderColor: LEVEL_COLORS[opt.level], color: LEVEL_COLORS[opt.level] }"
                            :title="opt.effect"
                          >
                            <span class="pill-lvl" :style="{ background: LEVEL_COLORS[opt.level], color: '#fff' }">{{ opt.level }}</span>
                            {{ opt.name }}
                          </span>
                        </div>
                      </div>
                      <div class="pills-section">
                        <span class="pills-section-label">Efficiency</span>
                        <div class="option-pills">
                          <span
                            v-for="opt in worryMap[wId]?.efficiency"
                            :key="opt.name"
                            class="option-pill"
                            :style="{ background: LEVEL_BG[opt.level], borderColor: LEVEL_COLORS[opt.level], color: LEVEL_COLORS[opt.level] }"
                            :title="opt.scope"
                          >
                            <span class="pill-lvl" :style="{ background: LEVEL_COLORS[opt.level], color: '#fff' }">{{ opt.level }}</span>
                            {{ opt.name }}
                          </span>
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
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

.proto-b {
  font-family: 'Open Sans', sans-serif;
  background: #f5f4f2;
  color: #1a1a1a;
  min-height: 100vh;
  font-size: 13px;
  line-height: 1.5;
}

/* ── Header ───────────────────────────────────── */

.board-header {
  background: #fff;
  border-bottom: 1px solid #e0dbd7;
  padding: 20px 32px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.header-eyebrow {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 3px;
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.02em;
}

.spectrum-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.spectrum-label {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #bbb;
}

.spectrum-bar {
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.spectrum-seg {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: default;
  transition: filter 150ms;
}

.spectrum-seg:hover {
  filter: brightness(1.08);
}

.seg-num {
  font-size: 13px;
  font-weight: 800;
  color: rgba(255,255,255,0.95);
  font-family: 'Courier New', monospace;
  line-height: 1;
}

.seg-name {
  font-size: 8.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Board Content ────────────────────────────── */

.board-content {
  padding: 28px 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.domain-section {
  margin-bottom: 32px;
}

.domain-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #76232f;
}

.domain-code {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #76232f;
  font-family: 'Courier New', monospace;
}

.domain-name {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}

.wt-count {
  margin-left: auto;
  font-size: 11px;
  color: #bbb;
  font-family: 'Courier New', monospace;
}

.wt-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wt-row {
  background: #fff;
  border: 1px solid #e0dbd7;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 180ms, border-color 180ms;
}

.wt-row.is-open {
  border-color: #c8b8b5;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.row-summary {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 18px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 120ms;
}

.row-summary:hover {
  background: #faf8f5;
}

.row-main {
  flex: 1;
  min-width: 0;
}

.row-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.row-desc {
  font-size: 11.5px;
  color: #999;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-indicators {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.indicator-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.ind-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ccc;
  font-family: 'Courier New', monospace;
}

.worry-dots {
  display: flex;
  gap: 5px;
}

.worry-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: default;
  display: block;
}

.agency-badge {
  font-size: 12px;
  font-weight: 800;
  color: #76232f;
  background: #fef5f4;
  border: 1.5px solid #f0cdc9;
  border-radius: 5px;
  padding: 2px 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.04em;
}

.row-chevron {
  font-size: 14px;
  color: #ccc;
  transition: transform 200ms;
  flex-shrink: 0;
}

.row-chevron.open {
  transform: rotate(180deg);
}

/* ── Expanded Detail ──────────────────────────── */

.row-detail {
  border-top: 1px solid #f0ebe6;
  background: #fdfbf9;
  padding: 20px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-stake {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.stake-pill {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: #76232f;
  color: #fff;
  border-radius: 3px;
  padding: 2px 7px;
  margin-right: 8px;
  vertical-align: baseline;
}

.prog-label {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #bbb;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.agency-prog {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
}

.prog-step {
  display: flex;
  align-items: center;
  gap: 0;
}

.prog-box {
  background: #fff;
  border: 1.5px solid #e0dbd7;
  border-radius: 6px;
  padding: 10px 14px;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prog-level {
  font-size: 11px;
  font-weight: 800;
  color: #76232f;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.06em;
}

.prog-step-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.prog-req {
  font-size: 10px;
  line-height: 1.4;
  padding: 3px 6px;
  border-radius: 3px;
  margin-top: 2px;
}

.prog-req.req-none {
  background: #f0fdf4;
  color: #15803d;
  font-style: italic;
}

.prog-req.req-set {
  background: #fef5f4;
  color: #76232f;
}

.prog-arrow {
  font-size: 18px;
  color: #ccc;
  padding: 0 6px;
  margin-top: -8px;
}

/* ── Compact Worries ──────────────────────────── */

.detail-worries-label {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #bbb;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
}

.compact-worries {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compact-worry {
  background: #fff;
  border: 1px solid #e8e0dc;
  border-radius: 6px;
  overflow: hidden;
}

.cw-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  gap: 12px;
}

.cw-header:hover {
  background: #faf8f5;
}

.cw-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cw-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cw-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #333;
}

.cw-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.cw-pill {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 8px;
  color: #fff;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.04em;
}

.cw-chevron {
  font-size: 12px;
  color: #ccc;
  transition: transform 180ms;
  margin-left: 4px;
}

.cw-chevron.open {
  transform: rotate(180deg);
}

.cw-pills-body {
  padding: 12px 14px 14px;
  border-top: 1px solid #f0ebe6;
  background: #faf8f5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pills-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pills-section-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #bbb;
  font-family: 'Courier New', monospace;
}

.option-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.option-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px 4px 4px;
  border-radius: 12px;
  border: 1.5px solid;
  cursor: default;
  line-height: 1;
}

.pill-lvl {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

@media (max-width: 780px) {
  .spectrum-seg { width: 56px; }
  .board-header { flex-direction: column; align-items: flex-start; }
  .agency-prog { flex-direction: column; }
  .prog-arrow { transform: rotate(90deg); align-self: center; }
}
</style>
