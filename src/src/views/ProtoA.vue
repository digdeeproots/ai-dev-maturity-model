<script setup lang="ts">
import { ref, computed } from 'vue'

const LEVEL_COLORS = ['#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#0e7490']
const LEVEL_BG = ['#fef2f2', '#fff7ed', '#fffbeb', '#f7fee7', '#f0fdf4', '#ecfeff']

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
      { name: 'AI exploratory testing (edge-case tests after change)', level: 2, scope: 'Bootstraps to Deterministic' },
      { name: 'Unit tests (recipe-based, comprehensive coverage)', level: 3, scope: 'Recipe-defined coverage; predictable gaps remain' },
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
    name: 'Documentation–Code Misalignment',
    worry: 'Does our documentation still describe what the system actually does?',
    surface: 'Number of documented concepts whose documentation no longer matches reality.',
    rateEvent: 'Every change to code not reflected in documentation, or every doc update not reflected in code.',
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
    description: 'Work that directly improves the product across its seven facets.',
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
        businessStake: "Every future pivot costs less when the design can absorb it. This is not cleanup — it is preserving the team's ability to act on business decisions.",
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
    description: 'Work that manages how the team operates, plans, and coordinates.',
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
const allWorkTypes = DOMAINS.flatMap(d => d.workTypes)

const selectedId = ref('adding_new_behavior')
const hoveredLevel = ref<number | null>(null)
const expandedWorries = ref<string[]>(['capability_regression'])

const selectedWorkType = computed(() => allWorkTypes.find(wt => wt.id === selectedId.value) ?? null)
const selectedWorries = computed(() =>
  (selectedWorkType.value?.worryIds ?? []).map(id => worryMap[id]).filter(Boolean)
)

function selectWorkType(id: string) {
  selectedId.value = id
  expandedWorries.value = []
}

function toggleWorry(id: string) {
  const idx = expandedWorries.value.indexOf(id)
  if (idx >= 0) expandedWorries.value.splice(idx, 1)
  else expandedWorries.value.push(id)
}

function levelName(n: number) {
  return SAFETY_LADDER.find(l => l.level === n)?.name ?? ''
}
</script>

<template>
  <div class="proto-a">
    <header class="ladder-bar">
      <span class="bar-eyebrow">Safety Ladder</span>
      <div class="pills-row">
        <button
          v-for="l in [...SAFETY_LADDER].reverse()"
          :key="l.level"
          class="level-pill"
          :class="{ dimmed: hoveredLevel !== null && hoveredLevel !== l.level }"
          :style="{ '--lc': LEVEL_COLORS[l.level] }"
          @mouseenter="hoveredLevel = l.level"
          @mouseleave="hoveredLevel = null"
        >
          <span class="pill-num">{{ l.level }}</span>
          <span class="pill-name">{{ l.name }}</span>
        </button>
      </div>
      <transition name="desc-fade">
        <div v-if="hoveredLevel !== null" class="level-tooltip">
          <span class="tooltip-text">{{ SAFETY_LADDER.find(l => l.level === hoveredLevel)?.desc }}</span>
          <span v-if="SAFETY_LADDER.find(l => l.level === hoveredLevel)?.canReachZero" class="zero-chip">✓ Can reach zero vigilance</span>
        </div>
      </transition>
    </header>

    <div class="body-layout">
      <nav class="sidebar">
        <div v-for="domain in DOMAINS" :key="domain.id" class="domain-group">
          <div class="domain-label">{{ domain.name }}</div>
          <button
            v-for="wt in domain.workTypes"
            :key="wt.id"
            class="wt-btn"
            :class="{ active: selectedId === wt.id }"
            @click="selectWorkType(wt.id)"
          >
            <span class="wt-btn-indicator"></span>
            {{ wt.name }}
          </button>
        </div>
      </nav>

      <main class="detail-panel" v-if="selectedWorkType">
        <div class="wt-hero">
          <h1 class="wt-title">{{ selectedWorkType.name }}</h1>
          <p class="wt-desc">{{ selectedWorkType.description }}</p>
        </div>

        <div class="stake-block">
          <div class="stake-eyebrow">Business Stake</div>
          <p class="stake-body">{{ selectedWorkType.businessStake }}</p>
        </div>

        <section class="content-section">
          <h2 class="section-head">Agency Delegation Path</h2>
          <div class="agency-timeline">
            <div
              v-for="(step, i) in selectedWorkType.agencyPath"
              :key="step.level"
              class="timeline-row"
            >
              <div class="tl-left">
                <div class="tl-node">{{ step.level }}</div>
                <div class="tl-rail" v-if="i < selectedWorkType.agencyPath.length - 1"></div>
              </div>
              <div class="tl-content">
                <div class="tl-label">{{ step.label }}</div>
                <p class="tl-desc">{{ step.desc }}</p>
                <div
                  class="tl-req"
                  :class="step.required === 'No minimum' ? 'req-none' : 'req-has'"
                >
                  <span class="req-tag">{{ step.required === 'No minimum' ? 'No safety minimum' : 'Requires' }}</span>
                  <span v-if="step.required !== 'No minimum'" class="req-text">{{ step.required }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="content-section">
          <h2 class="section-head">Worries</h2>
          <div class="worry-list">
            <div
              v-for="worry in selectedWorries"
              :key="worry.id"
              class="worry-card"
              :class="{ expanded: expandedWorries.includes(worry.id) }"
            >
              <button class="worry-trigger" @click="toggleWorry(worry.id)">
                <div class="worry-trigger-left">
                  <span class="worry-title">{{ worry.name }}</span>
                  <span class="worry-rate">{{ worry.rateEvent }}</span>
                </div>
                <span class="chevron" :class="{ open: expandedWorries.includes(worry.id) }">›</span>
              </button>

              <div v-show="expandedWorries.includes(worry.id)" class="worry-body">
                <blockquote class="worry-quote">{{ worry.worry }}</blockquote>
                <div class="worry-meta-row">
                  <div class="worry-meta-item">
                    <span class="meta-key">Worry surface</span>
                    <span class="meta-val">{{ worry.surface }}</span>
                  </div>
                  <div class="worry-meta-item">
                    <span class="meta-key">Rate event</span>
                    <span class="meta-val">{{ worry.rateEvent }}</span>
                  </div>
                </div>
                <div class="options-cols">
                  <div class="options-col">
                    <div class="col-label">Scope-Shrinking Options</div>
                    <div
                      v-for="opt in worry.scopeShrinking"
                      :key="opt.name"
                      class="opt-item"
                      :style="{ '--opt-bg': LEVEL_BG[opt.level], '--opt-border': LEVEL_COLORS[opt.level] }"
                    >
                      <span class="opt-badge" :style="{ background: LEVEL_COLORS[opt.level] }">
                        {{ opt.level }}&thinsp;{{ levelName(opt.level) }}
                      </span>
                      <div class="opt-text">
                        <div class="opt-name">{{ opt.name }}</div>
                        <div class="opt-effect">{{ opt.effect }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="options-col">
                    <div class="col-label">Efficiency Options</div>
                    <div
                      v-for="opt in worry.efficiency"
                      :key="opt.name"
                      class="opt-item"
                      :style="{ '--opt-bg': LEVEL_BG[opt.level], '--opt-border': LEVEL_COLORS[opt.level] }"
                    >
                      <span class="opt-badge" :style="{ background: LEVEL_COLORS[opt.level] }">
                        {{ opt.level }}&thinsp;{{ levelName(opt.level) }}
                      </span>
                      <div class="opt-text">
                        <div class="opt-name">{{ opt.name }}</div>
                        <div class="opt-effect">{{ opt.scope }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

.proto-a {
  font-family: 'Open Sans', sans-serif;
  background: #faf8f5;
  color: #222;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 1.55;
}

/* ── Header ───────────────────────────────────── */

.ladder-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 2px solid #76232f;
  padding: 0 24px;
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}

.bar-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  white-space: nowrap;
  flex-shrink: 0;
}

.pills-row {
  display: flex;
  gap: 5px;
  flex-wrap: nowrap;
}

.level-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border: none;
  border-radius: 20px;
  background: var(--lc);
  color: #fff;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 180ms, transform 120ms;
  white-space: nowrap;
}

.level-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.18);
}

.level-pill.dimmed {
  opacity: 0.35;
}

.pill-num {
  font-size: 10px;
  font-weight: 800;
  opacity: 0.9;
}

.level-tooltip {
  background: #fdfaf9;
  border: 1px solid #e8ddd9;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12.5px;
  color: #555;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.zero-chip {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
}

.desc-fade-enter-active, .desc-fade-leave-active { transition: opacity 150ms; }
.desc-fade-enter-from, .desc-fade-leave-to { opacity: 0; }

/* ── Layout ───────────────────────────────────── */

.body-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ── Sidebar ──────────────────────────────────── */

.sidebar {
  width: 256px;
  min-width: 256px;
  background: #fff;
  border-right: 1px solid #ece5e0;
  padding: 28px 0 40px;
  overflow-y: auto;
}

.domain-group {
  margin-bottom: 12px;
}

.domain-label {
  padding: 6px 20px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 2px;
}

.wt-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 9px 20px 9px 20px;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  font-family: inherit;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: background 120ms, color 120ms, border-color 120ms;
  line-height: 1.4;
}

.wt-btn:hover {
  background: #faf8f5;
  color: #222;
}

.wt-btn.active {
  background: #fef5f4;
  color: #76232f;
  font-weight: 600;
  border-left-color: #76232f;
}

.wt-btn-indicator {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
  transition: opacity 120ms;
  flex-shrink: 0;
}

.wt-btn.active .wt-btn-indicator {
  opacity: 1;
}

/* ── Detail Panel ─────────────────────────────── */

.detail-panel {
  flex: 1;
  overflow-y: auto;
  padding: 40px 52px 60px;
}

.wt-hero {
  margin-bottom: 28px;
  border-bottom: 1px solid #ece5e0;
  padding-bottom: 24px;
}

.wt-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.wt-desc {
  font-size: 14.5px;
  color: #777;
  margin: 0;
  line-height: 1.6;
}

.stake-block {
  background: #fdf8f6;
  border-left: 4px solid #76232f;
  border-radius: 0 8px 8px 0;
  padding: 16px 22px;
  margin-bottom: 36px;
}

.stake-eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 7px;
}

.stake-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #444;
}

.content-section {
  margin-bottom: 44px;
}

.section-head {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  margin: 0 0 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ece5e0;
}

/* ── Agency Timeline ──────────────────────────── */

.agency-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-row {
  display: flex;
  gap: 18px;
}

.tl-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 42px;
  flex-shrink: 0;
}

.tl-node {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #76232f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.tl-rail {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: #e0d4cf;
  margin: 4px 0;
}

.tl-content {
  padding-bottom: 28px;
  flex: 1;
  min-width: 0;
  padding-top: 7px;
}

.tl-label {
  font-weight: 700;
  font-size: 14px;
  color: #222;
  margin-bottom: 4px;
}

.tl-desc {
  font-size: 13px;
  color: #777;
  margin: 0 0 9px;
  line-height: 1.6;
}

.tl-req {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 12px;
}

.tl-req.req-none {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.tl-req.req-has {
  background: #fef5f4;
  color: #76232f;
  border: 1px solid #f0cdc9;
}

.req-tag {
  font-weight: 700;
}

/* ── Worries ──────────────────────────────────── */

.worry-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.worry-card {
  background: #fff;
  border: 1px solid #ece5e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 180ms;
}

.worry-card.expanded {
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}

.worry-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  transition: background 120ms;
}

.worry-trigger:hover {
  background: #faf8f5;
}

.worry-trigger-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.worry-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.worry-rate {
  font-size: 11.5px;
  color: #aaa;
}

.chevron {
  font-size: 20px;
  color: #bbb;
  line-height: 1;
  transition: transform 200ms;
  flex-shrink: 0;
}

.chevron.open {
  transform: rotate(90deg);
}

.worry-body {
  padding: 4px 18px 20px;
  border-top: 1px solid #f2ebe6;
}

.worry-quote {
  font-style: italic;
  color: #888;
  font-size: 13px;
  line-height: 1.65;
  margin: 14px 0;
  padding-left: 14px;
  border-left: 3px solid #e0d4cf;
}

.worry-meta-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.worry-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-key {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #aaa;
}

.meta-val {
  font-size: 12.5px;
  color: #555;
  max-width: 320px;
  line-height: 1.5;
}

.options-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.col-label {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #76232f;
  margin-bottom: 10px;
}

.opt-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--opt-bg, #fafafa);
  border: 1px solid color-mix(in srgb, var(--opt-border, #ccc) 25%, transparent);
}

.opt-badge {
  display: inline-block;
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 1px;
  letter-spacing: 0.02em;
}

.opt-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.opt-effect {
  font-size: 11.5px;
  color: #888;
  margin-top: 2px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .options-cols { grid-template-columns: 1fr; }
  .sidebar { width: 220px; min-width: 220px; }
  .detail-panel { padding: 28px 24px 48px; }
}
</style>
