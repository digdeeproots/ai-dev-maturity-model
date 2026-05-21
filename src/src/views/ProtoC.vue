<script setup lang="ts">
import { ref } from 'vue'

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
    gapCondition: 'Expensive in any codebase where components have more than a few callers. Grows with caller count and customer base.',
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
    gapCondition: 'Compounds with every change. Teams notice when they are already in trouble.',
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
    gapCondition: 'Can be hard to notice until a team member acts on incorrect information.',
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

const ladderOpen = ref(true)
const expandedWorries = ref<string[]>([])

function toggleWorry(id: string) {
  const i = expandedWorries.value.indexOf(id)
  if (i >= 0) expandedWorries.value.splice(i, 1)
  else expandedWorries.value.push(id)
}

function reqLevel(req: string): number | null {
  for (let i = 5; i >= 0; i--) {
    if (req.toLowerCase().includes(SAFETY_LADDER.find(l => l.level === i)!.name.toLowerCase())) return i
  }
  return null
}
</script>

<template>
  <div class="proto-c">
    <!-- ── Page Header ── -->
    <header class="page-header">
      <div class="header-inner">
        <div class="header-kicker">Careless AI Development</div>
        <h1 class="header-title">The Safety Matrix</h1>
        <p class="header-subtitle">
          For each type of work AI might perform, what can go wrong, how badly, and what raises or lowers the cost of careless mistakes.
        </p>
      </div>
    </header>

    <div class="page-body">
      <!-- ── Safety Ladder Legend ── -->
      <section class="ladder-section">
        <button class="ladder-toggle" @click="ladderOpen = !ladderOpen">
          <span class="toggle-label">Safety Ladder — the interpretive key for every level shown in this document</span>
          <span class="toggle-icon" :class="{ open: ladderOpen }">›</span>
        </button>

        <div v-if="ladderOpen" class="ladder-rows">
          <div
            v-for="level in SAFETY_LADDER"
            :key="level.level"
            class="ladder-row"
            :style="{ '--lc': LEVEL_COLORS[level.level], '--lb': LEVEL_BG[level.level] }"
          >
            <div class="ladder-stripe"></div>
            <div class="ladder-num">{{ level.level }}</div>
            <div class="ladder-content">
              <div class="ladder-name">{{ level.name }}</div>
              <div class="ladder-desc">{{ level.desc }}</div>
            </div>
            <div class="ladder-zero" v-if="level.canReachZero">
              <span class="zero-mark">✓</span> Zero vigilance possible
            </div>
          </div>
        </div>
      </section>

      <!-- ── Domains & Work Types ── -->
      <div
        v-for="domain in DOMAINS"
        :key="domain.id"
        class="domain-chapter"
      >
        <div class="domain-divider">
          <span class="divider-line"></span>
          <span class="divider-text">{{ domain.name }}</span>
          <span class="divider-line"></span>
        </div>
        <p class="domain-desc">{{ domain.description }}</p>

        <div
          v-for="wt in domain.workTypes"
          :key="wt.id"
          class="work-type-section"
        >
          <h2 class="wt-heading">{{ wt.name }}</h2>
          <p class="wt-description">{{ wt.description }}</p>

          <blockquote class="business-stake">
            <div class="stake-label">Business Stake</div>
            <p class="stake-text">{{ wt.businessStake }}</p>
          </blockquote>

          <!-- Agency Path -->
          <div class="agency-section">
            <h3 class="subsection-head">Agency Delegation Path</h3>
            <div class="agency-stations">
              <div
                v-for="(step, i) in wt.agencyPath"
                :key="step.level"
                class="station"
              >
                <div class="station-box">
                  <div class="station-level">{{ step.level }}</div>
                  <div class="station-label">{{ step.label }}</div>
                  <p class="station-desc">{{ step.desc }}</p>
                  <div
                    class="station-req"
                    :class="step.required === 'No minimum' ? 'req-green' : 'req-red'"
                    :style="step.required !== 'No minimum' && reqLevel(step.required) !== null
                      ? { background: LEVEL_BG[reqLevel(step.required)!], borderColor: LEVEL_COLORS[reqLevel(step.required)!], color: LEVEL_COLORS[reqLevel(step.required)!] }
                      : {}"
                  >
                    {{ step.required === 'No minimum' ? 'No safety minimum' : step.required }}
                  </div>
                </div>
                <div class="station-arrow" v-if="i < wt.agencyPath.length - 1">
                  <span class="arrow-line"></span>
                  <span class="arrow-head">›</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Worries -->
          <div class="worries-section">
            <h3 class="subsection-head">Worries</h3>
            <div
              v-for="wId in wt.worryIds"
              :key="`${wt.id}-${wId}`"
              class="worry-entry"
            >
              <button class="worry-head-row" @click="toggleWorry(`${wt.id}-${wId}`)">
                <div class="worry-head-left">
                  <h4 class="worry-name">{{ worryMap[wId]?.name }}</h4>
                  <p class="worry-surface-line">{{ worryMap[wId]?.rateEvent }}</p>
                </div>
                <span class="worry-toggle-icon" :class="{ open: expandedWorries.includes(`${wt.id}-${wId}`) }">›</span>
              </button>

              <div v-if="expandedWorries.includes(`${wt.id}-${wId}`)" class="worry-detail">
                <div class="worry-quote-block">
                  <p class="worry-q">"{{ worryMap[wId]?.worry }}"</p>
                </div>

                <div class="worry-meta-grid">
                  <div class="worry-meta-cell">
                    <div class="wm-label">Worry Surface</div>
                    <div class="wm-value">{{ worryMap[wId]?.surface }}</div>
                  </div>
                  <div class="worry-meta-cell">
                    <div class="wm-label">Gap Condition</div>
                    <div class="wm-value">{{ worryMap[wId]?.gapCondition }}</div>
                  </div>
                </div>

                <div class="options-tables">
                  <!-- Scope-Shrinking Table -->
                  <div class="options-table-wrap">
                    <div class="table-title">Scope-Shrinking Options</div>
                    <div class="table-subtitle">Reduce how much can go wrong before the mistake happens.</div>
                    <table class="options-table">
                      <thead>
                        <tr>
                          <th>Level</th>
                          <th>Option</th>
                          <th>Effect</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="opt in worryMap[wId]?.scopeShrinking"
                          :key="opt.name"
                          :style="{ background: LEVEL_BG[opt.level] }"
                        >
                          <td class="td-level">
                            <span class="level-swatch" :style="{ background: LEVEL_COLORS[opt.level] }">{{ opt.level }}</span>
                            <span class="level-lname" :style="{ color: LEVEL_COLORS[opt.level] }">{{ SAFETY_LADDER.find(l => l.level === opt.level)?.name }}</span>
                          </td>
                          <td class="td-name">{{ opt.name }}</td>
                          <td class="td-detail">{{ opt.effect }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Efficiency Table -->
                  <div class="options-table-wrap">
                    <div class="table-title">Efficiency Options</div>
                    <div class="table-subtitle">Detect mistakes after they happen — how reliably and at what coverage.</div>
                    <table class="options-table">
                      <thead>
                        <tr>
                          <th>Level</th>
                          <th>Option</th>
                          <th>Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="opt in worryMap[wId]?.efficiency"
                          :key="opt.name"
                          :style="{ background: LEVEL_BG[opt.level] }"
                        >
                          <td class="td-level">
                            <span class="level-swatch" :style="{ background: LEVEL_COLORS[opt.level] }">{{ opt.level }}</span>
                            <span class="level-lname" :style="{ color: LEVEL_COLORS[opt.level] }">{{ SAFETY_LADDER.find(l => l.level === opt.level)?.name }}</span>
                          </td>
                          <td class="td-name">{{ opt.name }}</td>
                          <td class="td-detail">{{ opt.scope }}</td>
                        </tr>
                      </tbody>
                    </table>
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

.proto-c {
  font-family: 'Open Sans', sans-serif;
  background: #fff;
  color: #1a1a1a;
  min-height: 100vh;
  font-size: 15px;
  line-height: 1.65;
}

/* ── Page Header ──────────────────────────────── */

.page-header {
  background: #76232f;
  padding: 56px 0 52px;
}

.header-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 48px;
}

.header-kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  margin-bottom: 10px;
}

.header-title {
  font-size: 44px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 14px;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.header-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.75);
  margin: 0;
  max-width: 580px;
  line-height: 1.6;
}

/* ── Page Body ────────────────────────────────── */

.page-body {
  max-width: 820px;
  margin: 0 auto;
  padding: 48px 48px 80px;
}

/* ── Safety Ladder ────────────────────────────── */

.ladder-section {
  margin-bottom: 52px;
  border: 1px solid #e8e0dc;
  border-radius: 10px;
  overflow: hidden;
}

.ladder-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #faf8f6;
  border: none;
  font-family: inherit;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  border-bottom: 1px solid #e8e0dc;
  transition: background 150ms;
}

.ladder-toggle:hover {
  background: #f5f2ef;
}

.toggle-label {
  font-weight: 500;
}

.toggle-icon {
  font-size: 18px;
  color: #bbb;
  transition: transform 200ms;
  flex-shrink: 0;
}

.toggle-icon.open {
  transform: rotate(90deg);
}

.ladder-rows {
  display: flex;
  flex-direction: column;
}

.ladder-row {
  display: flex;
  align-items: flex-start;
  padding: 14px 20px 14px 0;
  border-bottom: 1px solid #f0eae6;
  gap: 16px;
  background: var(--lb);
}

.ladder-row:last-child {
  border-bottom: none;
}

.ladder-stripe {
  width: 5px;
  align-self: stretch;
  background: var(--lc);
  flex-shrink: 0;
}

.ladder-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--lc);
  line-height: 1;
  width: 28px;
  flex-shrink: 0;
  padding-top: 2px;
  font-family: 'Courier New', monospace;
}

.ladder-content {
  flex: 1;
}

.ladder-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--lc);
  margin-bottom: 2px;
}

.ladder-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.ladder-zero {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
  white-space: nowrap;
  padding-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.zero-mark {
  font-size: 14px;
}

/* ── Domain Chapter ───────────────────────────── */

.domain-chapter {
  margin-bottom: 60px;
}

.domain-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e0d8d4;
}

.divider-text {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #76232f;
  white-space: nowrap;
}

.domain-desc {
  font-size: 14px;
  color: #888;
  margin: 0 0 36px;
}

/* ── Work Type Section ────────────────────────── */

.work-type-section {
  margin-bottom: 52px;
  padding-bottom: 52px;
  border-bottom: 1px solid #f0e8e4;
}

.work-type-section:last-child {
  border-bottom: none;
}

.wt-heading {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
  letter-spacing: -0.015em;
}

.wt-description {
  font-size: 15px;
  color: #888;
  margin: 0 0 24px;
}

.business-stake {
  margin: 0 0 36px;
  padding: 20px 24px;
  border-left: 4px solid #76232f;
  background: #fdf8f6;
  border-radius: 0 8px 8px 0;
}

.stake-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  margin-bottom: 8px;
}

.stake-text {
  margin: 0;
  font-size: 15px;
  font-style: italic;
  color: #555;
  line-height: 1.7;
}

/* ── Agency Section ───────────────────────────── */

.agency-section {
  margin-bottom: 40px;
}

.subsection-head {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #76232f;
  margin: 0 0 18px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0e8e4;
}

.agency-stations {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 4px;
}

.station {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.station-box {
  background: #fff;
  border: 1.5px solid #e0d8d4;
  border-radius: 8px;
  padding: 14px 16px;
  min-width: 148px;
  max-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: box-shadow 150ms;
}

.station-box:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

.station-level {
  font-size: 11px;
  font-weight: 800;
  color: #76232f;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.04em;
  margin-bottom: 1px;
}

.station-label {
  font-size: 12px;
  font-weight: 700;
  color: #222;
  line-height: 1.3;
}

.station-desc {
  font-size: 11.5px;
  color: #888;
  margin: 0;
  line-height: 1.5;
}

.station-req {
  font-size: 10.5px;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid;
  margin-top: 4px;
}

.station-req.req-green {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
  font-style: italic;
}

.station-req.req-red {
  background: #fef5f4;
  border-color: #f0cdc9;
  color: #76232f;
}

.station-arrow {
  display: flex;
  align-items: center;
  padding: 0 2px;
  margin-top: 24px;
  color: #ccc;
  flex-shrink: 0;
}

.arrow-line {
  display: block;
  width: 12px;
  height: 1.5px;
  background: #ddd;
}

.arrow-head {
  font-size: 18px;
  line-height: 1;
  margin-left: -2px;
}

/* ── Worries ──────────────────────────────────── */

.worries-section {
  margin-top: 4px;
}

.worry-entry {
  border: 1px solid #e8e0dc;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.worry-head-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #faf8f6;
  border: none;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  gap: 16px;
  transition: background 150ms;
}

.worry-head-row:hover {
  background: #f5f2ef;
}

.worry-head-left {
  flex: 1;
}

.worry-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 3px;
}

.worry-surface-line {
  font-size: 12px;
  color: #aaa;
  margin: 0;
}

.worry-toggle-icon {
  font-size: 22px;
  color: #ccc;
  transition: transform 200ms;
  flex-shrink: 0;
}

.worry-toggle-icon.open {
  transform: rotate(90deg);
}

.worry-detail {
  padding: 24px 20px 28px;
  border-top: 1px solid #f0e8e4;
}

.worry-quote-block {
  margin-bottom: 20px;
}

.worry-q {
  font-size: 15px;
  font-style: italic;
  color: #555;
  line-height: 1.7;
  margin: 0;
  padding-left: 18px;
  border-left: 3px solid #e0d4cf;
}

.worry-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: #faf8f6;
  border-radius: 6px;
  border: 1px solid #ece5e0;
}

.worry-meta-cell { display: flex; flex-direction: column; gap: 4px; }

.wm-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #bbb;
}

.wm-value {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}

/* ── Options Tables ───────────────────────────── */

.options-tables {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.options-table-wrap {}

.table-title {
  font-size: 12px;
  font-weight: 700;
  color: #76232f;
  margin-bottom: 3px;
  letter-spacing: 0.02em;
}

.table-subtitle {
  font-size: 11.5px;
  color: #aaa;
  margin-bottom: 10px;
}

.options-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.options-table thead tr {
  border-bottom: 2px solid #e0d8d4;
}

.options-table th {
  text-align: left;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #bbb;
  padding: 7px 12px;
}

.options-table td {
  padding: 10px 12px;
  vertical-align: top;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.options-table tr:last-child td {
  border-bottom: none;
}

.td-level {
  white-space: nowrap;
  width: 130px;
}

.level-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  margin-right: 6px;
  vertical-align: middle;
}

.level-lname {
  font-size: 12px;
  font-weight: 600;
  vertical-align: middle;
}

.td-name {
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  width: 280px;
}

.td-detail {
  font-size: 12.5px;
  color: #777;
  line-height: 1.55;
}

@media (max-width: 700px) {
  .header-title { font-size: 30px; }
  .agency-stations { flex-direction: column; }
  .station-arrow { transform: rotate(90deg); align-self: center; }
  .worry-meta-grid { grid-template-columns: 1fr; }
  .page-body { padding: 32px 20px 60px; }
}
</style>
