<script setup lang="ts">
import { ref, computed } from 'vue'

const LEVEL_COLORS = ['#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#0e7490']

const SAFETY_LADDER = [
  { level: 5, name: 'Carefree',      desc: 'The system makes the right action easy and mistakes structurally hard.',           canReachZero: true  },
  { level: 4, name: 'Prevention',    desc: 'Mistakes cannot propagate past the originator.',                                   canReachZero: true  },
  { level: 3, name: 'Deterministic', desc: 'Known worries are reliably caught. Careless is fine for covered ones.',            canReachZero: false },
  { level: 2, name: 'Probabilistic', desc: 'Errors are sometimes caught. Careless is sometimes fine.',                         canReachZero: false },
  { level: 1, name: 'Vigilance',     desc: 'Errors are caught only when someone is paying attention.',                         canReachZero: false },
  { level: 0, name: 'Hope',          desc: 'No mechanism exists. Errors propagate undetected.',                                canReachZero: false },
]

const WORRY_SYMBOLS: Record<string, string> = {
  capability_regression:    '✕',
  adaptability_reduction:   '≈',
  documentation_misalignment: '?',
}
const WORRY_CLASSES: Record<string, string> = {
  capability_regression:    'Submerged Wreck',
  adaptability_reduction:   'Rocky Shoal',
  documentation_misalignment: 'False Light',
}

const WORRIES = [
  {
    id: 'capability_regression',
    name: 'Capability Regression',
    worry: "Did I break something that was working? Who's going to find out in production before I do?",
    surface: 'Number of callers (components, services, customer flows) depending on the behavior that could break.',
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
          { level: 'A1', label: 'AI assists',               desc: 'AI suggests; human executes and reviews every line',               required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes complete modules; human reviews outcomes',             required: 'Capability regression: Deterministic' },
          { level: 'A3', label: 'AI operates in scope',      desc: 'AI implements features autonomously within task boundaries',       required: 'Capability regression: Prevention or Carefree scope-shrinking; adaptability: Deterministic' },
          { level: 'A4', label: 'Human in the loop',         desc: 'AI implements and self-tests; human anchors scope',               required: 'All major classes: Prevention; escalation: circuit breakers' },
        ],
      },
      {
        id: 'evolving_the_design',
        name: 'Evolving the Design',
        description: 'Refactoring, restructuring, improving design, extracting abstractions.',
        businessStake: "Every future pivot costs less when the design can absorb it. This is not cleanup — it is preserving the team's ability to act on business decisions.",
        worryIds: ['capability_regression', 'adaptability_reduction'],
        agencyPath: [
          { level: 'A1', label: 'AI assists',               desc: 'AI suggests refactoring; human executes each step',               required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI executes refactoring sequences; human validates outcomes',   required: 'Capability regression: Deterministic' },
          { level: 'A3', label: 'AI operates in scope',      desc: 'AI plans and executes multi-step design improvements',           required: 'Capability regression: Carefree (AST tools); design regression: Deterministic' },
          { level: 'A4', label: 'Human in the loop',         desc: 'AI continuously improves design within architectural principles', required: 'All structural classes: Carefree (AST tools)' },
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
          { level: 'A1', label: 'AI assists',               desc: 'AI drafts; human edits and approves',                 required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes full docs from code; human reviews',       required: 'Documentation misalignment: Probabilistic' },
          { level: 'A3', label: 'AI operates in scope',      desc: 'AI keeps docs in sync automatically',                required: 'Documentation misalignment: Deterministic' },
          { level: 'A4', label: 'Human in the loop',         desc: 'AI manages full doc lifecycle',                      required: 'Documentation misalignment: Prevention; all other: Deterministic' },
        ],
      },
    ],
  },
]

const worryMap  = Object.fromEntries(WORRIES.map(w => [w.id, w]))
const allWTs    = DOMAINS.flatMap(d => d.workTypes)

const selectedId      = ref('adding_new_behavior')
const expandedWorries = ref<string[]>(['capability_regression'])

const selectedWT      = computed(() => allWTs.find(w => w.id === selectedId.value) ?? null)
const selectedWorries = computed(() => (selectedWT.value?.worryIds ?? []).map(id => worryMap[id]).filter(Boolean))

function selectWT(id: string) { selectedId.value = id; expandedWorries.value = [] }
function toggleWorry(id: string) {
  const i = expandedWorries.value.indexOf(id)
  if (i >= 0) expandedWorries.value.splice(i, 1)
  else expandedWorries.value.push(id)
}

</script>

<template>
  <div class="proto-d">
    <!-- Background: actual portolan chart at very low opacity -->
    <div class="chart-bg-image"></div>

    <!-- SVG decorations: compass rose + background rhumb lines -->
    <svg class="rhumb-lines" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g stroke="#1b3558" stroke-width="0.6" opacity="0.07">
        <!-- Rhumb lines radiating from several compass centers (portolan style) -->
        <line x1="200" y1="0"    x2="200" y2="900"/>
        <line x1="0"   y1="300"  x2="1200" y2="300"/>
        <line x1="0"   y1="0"    x2="1200" y2="900"/>
        <line x1="1200" y1="0"   x2="0"   y2="900"/>
        <line x1="0"   y1="600"  x2="1200" y2="0"/>
        <line x1="0"   y1="0"    x2="800"  y2="900"/>
        <line x1="400" y1="0"    x2="1200" y2="600"/>
        <!-- second center -->
        <line x1="900" y1="0"    x2="900" y2="900"/>
        <line x1="0"   y1="600"  x2="1200" y2="600"/>
        <line x1="600" y1="0"    x2="1200" y2="900"/>
        <line x1="1200" y1="300" x2="300" y2="900"/>
        <line x1="0"   y1="0"    x2="1200" y2="450"/>
        <line x1="0"   y1="900"  x2="1200" y2="150"/>
      </g>
    </svg>

    <!-- Compass rose: fixed bottom-right -->
    <svg class="compass-rose" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="90" fill="none" stroke="#1b3558" stroke-width="0.6" opacity="0.35"/>
      <circle cx="100" cy="100" r="74" fill="none" stroke="#1b3558" stroke-width="0.4" opacity="0.25"/>
      <circle cx="100" cy="100" r="26" fill="none" stroke="#1b3558" stroke-width="0.6" opacity="0.4"/>
      <!-- Cardinal points (navy, elongated) -->
      <polygon points="100,8 96,88 100,72 104,88"  fill="#1b3558"/>
      <polygon points="100,8 96,88 100,72 104,88"  fill="#1b3558" transform="rotate(90,100,100)"/>
      <polygon points="100,8 96,88 100,72 104,88"  fill="#1b3558" transform="rotate(180,100,100)"/>
      <polygon points="100,8 96,88 100,72 104,88"  fill="#1b3558" transform="rotate(270,100,100)"/>
      <!-- Intercardinal points (deep red, shorter) -->
      <polygon points="100,28 97.5,82 100,74 102.5,82" fill="#7a1f1f" opacity="0.75" transform="rotate(45,100,100)"/>
      <polygon points="100,28 97.5,82 100,74 102.5,82" fill="#7a1f1f" opacity="0.75" transform="rotate(135,100,100)"/>
      <polygon points="100,28 97.5,82 100,74 102.5,82" fill="#7a1f1f" opacity="0.75" transform="rotate(225,100,100)"/>
      <polygon points="100,28 97.5,82 100,74 102.5,82" fill="#7a1f1f" opacity="0.75" transform="rotate(315,100,100)"/>
      <!-- Center -->
      <circle cx="100" cy="100" r="17" fill="#f4ede0" stroke="#1b3558" stroke-width="1"/>
      <circle cx="100" cy="100" r="7"  fill="#1b3558"/>
      <circle cx="100" cy="100" r="3"  fill="#f4ede0"/>
      <!-- Labels -->
      <text x="100" y="22"  text-anchor="middle" font-family="IM Fell English, serif" font-size="14" fill="#1b3558" font-weight="bold">N</text>
      <text x="182" y="105" text-anchor="middle" font-family="IM Fell English, serif" font-size="12" fill="#1b3558">E</text>
      <text x="100" y="190" text-anchor="middle" font-family="IM Fell English, serif" font-size="12" fill="#1b3558">S</text>
      <text x="18"  y="105" text-anchor="middle" font-family="IM Fell English, serif" font-size="12" fill="#1b3558">W</text>
      <text x="162" y="46"  text-anchor="middle" font-family="IM Fell English, serif" font-size="9"  fill="#7a1f1f" opacity="0.8">NE</text>
      <text x="162" y="162" text-anchor="middle" font-family="IM Fell English, serif" font-size="9"  fill="#7a1f1f" opacity="0.8">SE</text>
      <text x="38"  y="162" text-anchor="middle" font-family="IM Fell English, serif" font-size="9"  fill="#7a1f1f" opacity="0.8">SW</text>
      <text x="38"  y="46"  text-anchor="middle" font-family="IM Fell English, serif" font-size="9"  fill="#7a1f1f" opacity="0.8">NW</text>
    </svg>

    <!-- Chart title block -->
    <header class="chart-header">
      <div class="header-frame">
        <div class="header-top-rule"></div>
        <div class="header-kicker">Careless AI Development · Hydrographic Survey</div>
        <h1 class="chart-title">A Chart of Work Types &amp; Their Hazards</h1>
        <div class="header-bottom-kicker">Compiled for the Navigation of Artificial Agency · Anno MMXXVI</div>
        <div class="header-bottom-rule"></div>
      </div>
    </header>

    <!-- Body -->
    <div class="chart-body">
      <!-- Left: chart legend / key -->
      <aside class="chart-legend">
        <!-- Depth of safety scale -->
        <div class="legend-block">
          <div class="legend-block-title">DEPTH OF SAFETY</div>
          <div class="depth-scale">
            <div
              v-for="l in SAFETY_LADDER"
              :key="l.level"
              class="depth-row"
            >
              <span class="sounding" :style="{ color: LEVEL_COLORS[l.level] }">{{ l.level }}</span>
              <span class="sounding-bar" :style="{ width: (l.level * 14 + 10) + 'px', background: LEVEL_COLORS[l.level] }"></span>
              <span class="sounding-name" :style="{ color: LEVEL_COLORS[l.level] }">{{ l.name }}</span>
            </div>
          </div>
        </div>

        <!-- Hazard legend -->
        <div class="legend-block">
          <div class="legend-block-title">HAZARD CLASSES</div>
          <div class="hazard-legend">
            <div v-for="(cls, id) in WORRY_CLASSES" :key="id" class="hz-legend-row">
              <span class="hz-sym">{{ WORRY_SYMBOLS[id] }}</span>
              <span class="hz-cls">{{ cls }}</span>
            </div>
          </div>
        </div>

        <!-- Charted regions -->
        <div class="legend-block">
          <div class="legend-block-title">CHARTED REGIONS</div>
          <div v-for="domain in DOMAINS" :key="domain.id" class="legend-domain">
            <div class="legend-domain-name">{{ domain.name }}</div>
            <button
              v-for="wt in domain.workTypes"
              :key="wt.id"
              class="region-btn"
              :class="{ active: selectedId === wt.id }"
              @click="selectWT(wt.id)"
            >
              <span class="region-marker">·</span>
              {{ wt.name }}
            </button>
          </div>
        </div>

        <!-- Attribution -->
        <div class="chart-attribution">
          Background: Portolan by Jacobus Russus, Messina 1533.<br>
          Dutch National Archives, public domain.
        </div>
      </aside>

      <!-- Right: sailing directions -->
      <main class="sailing-directions" v-if="selectedWT">
        <!-- Work type heading -->
        <div class="directions-head">
          <div class="directions-region-label">SAILING DIRECTIONS FOR THE REGION OF</div>
          <h2 class="directions-title">{{ selectedWT.name }}</h2>
          <p class="directions-desc">{{ selectedWT.description }}</p>
        </div>

        <!-- Note to mariners (business stake) -->
        <div class="pilots-note">
          <div class="note-label">⊕ NOTE TO MARINERS</div>
          <p class="note-body">{{ selectedWT.businessStake }}</p>
        </div>

        <!-- Agency path as waypoints -->
        <section class="route-section">
          <h3 class="section-rule-head">
            <span class="rule-line"></span>
            <span class="rule-text">ROUTE &amp; WAYPOINTS</span>
            <span class="rule-line"></span>
          </h3>
          <div class="waypoints">
            <div v-for="(step, i) in selectedWT.agencyPath" :key="step.level" class="waypoint">
              <div class="wp-left">
                <div class="wp-marker">{{ step.level }}</div>
                <div class="wp-rail" v-if="i < selectedWT.agencyPath.length - 1"></div>
              </div>
              <div class="wp-content">
                <div class="wp-label">{{ step.label }}</div>
                <p class="wp-desc">{{ step.desc }}</p>
                <div class="wp-req" :class="step.required === 'No minimum' ? 'wp-req-clear' : 'wp-req-marked'">
                  <span v-if="step.required === 'No minimum'">Clear passage — no minimum depth required</span>
                  <span v-else><em>Minimum depth required:</em> {{ step.required }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Worries as charted hazards -->
        <section class="hazards-section">
          <h3 class="section-rule-head">
            <span class="rule-line"></span>
            <span class="rule-text">CHARTED HAZARDS</span>
            <span class="rule-line"></span>
          </h3>
          <div v-for="worry in selectedWorries" :key="worry.id" class="hazard-entry">
            <button class="hazard-head" @click="toggleWorry(worry.id)">
              <div class="hz-head-left">
                <span class="hz-sym-large">{{ WORRY_SYMBOLS[worry.id] }}</span>
                <div>
                  <div class="hz-name">{{ worry.name }}</div>
                  <div class="hz-class">{{ WORRY_CLASSES[worry.id] }} · {{ worry.rateEvent }}</div>
                </div>
              </div>
              <span class="hz-toggle">{{ expandedWorries.includes(worry.id) ? '▲' : '▼' }}</span>
            </button>

            <div v-if="expandedWorries.includes(worry.id)" class="hazard-body">
              <div class="hz-nature">
                <div class="hz-nature-label">NATURE OF HAZARD</div>
                <p class="hz-worry-text">{{ worry.worry }}</p>
                <p class="hz-surface"><em>Extent of exposure:</em> {{ worry.surface }}</p>
              </div>
              <div class="hz-options">
                <div class="hz-col">
                  <div class="hz-col-head">AVOIDING THE HAZARD</div>
                  <div v-for="opt in worry.scopeShrinking" :key="opt.name" class="hz-option">
                    <span class="hz-opt-depth" :style="{ background: LEVEL_COLORS[opt.level] }">{{ opt.level }}</span>
                    <div>
                      <div class="hz-opt-name">{{ opt.name }}</div>
                      <div class="hz-opt-detail">{{ opt.effect }}</div>
                    </div>
                  </div>
                </div>
                <div class="hz-col">
                  <div class="hz-col-head">DETECTING THE HAZARD</div>
                  <div v-for="opt in worry.efficiency" :key="opt.name" class="hz-option">
                    <span class="hz-opt-depth" :style="{ background: LEVEL_COLORS[opt.level] }">{{ opt.level }}</span>
                    <div>
                      <div class="hz-opt-name">{{ opt.name }}</div>
                      <div class="hz-opt-detail">{{ opt.scope }}</div>
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
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cinzel:wght@400;600;700&display=swap');

/* ── Root ──────────────────────────────────────── */

.proto-d {
  font-family: 'IM Fell English', Georgia, serif;
  background: #f4ede0;
  color: #1b3558;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  font-size: 14px;
  line-height: 1.6;
}

/* ── Background chart texture ──────────────────── */

.chart-bg-image {
  position: fixed;
  inset: 0;
  background-image: url('https://upload.wikimedia.org/wikipedia/commons/4/41/Portolan_by_Jacobus_Russus_of_Messina_1533.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.065;
  pointer-events: none;
  z-index: 0;
}

.rhumb-lines {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.compass-rose {
  position: fixed;
  bottom: 24px;
  right: 28px;
  width: 130px;
  height: 130px;
  opacity: 0.55;
  pointer-events: none;
  z-index: 1;
}

/* ── Header ────────────────────────────────────── */

.chart-header {
  position: relative;
  z-index: 2;
  padding: 18px 32px 14px;
  text-align: center;
  border-bottom: 2px solid #1b3558;
}

.header-frame {
  max-width: 700px;
  margin: 0 auto;
}

.header-top-rule,
.header-bottom-rule {
  height: 1px;
  background: linear-gradient(to right, transparent, #1b3558 20%, #1b3558 80%, transparent);
  margin: 6px 0;
}

.header-kicker,
.header-bottom-kicker {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7a1f1f;
  font-family: 'Cinzel', serif;
  font-weight: 400;
}

.chart-title {
  font-family: 'Cinzel', serif;
  font-size: 22px;
  font-weight: 700;
  color: #1b3558;
  margin: 6px 0 4px;
  letter-spacing: 0.04em;
}

/* ── Body layout ───────────────────────────────── */

.chart-body {
  display: flex;
  flex: 1;
  position: relative;
  z-index: 2;
}

/* ── Legend sidebar ────────────────────────────── */

.chart-legend {
  width: 248px;
  min-width: 248px;
  border-right: 1.5px solid #1b3558;
  padding: 24px 18px 40px;
  background: rgba(244, 237, 224, 0.92);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.legend-block-title {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #7a1f1f;
  border-bottom: 1px solid #c8b49c;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.depth-scale {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.depth-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.sounding {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  width: 14px;
  text-align: right;
  flex-shrink: 0;
}

.sounding-bar {
  height: 4px;
  border-radius: 1px;
  flex-shrink: 0;
}

.sounding-name {
  font-size: 11.5px;
  font-style: italic;
}

.hazard-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hz-legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
}

.hz-sym {
  font-size: 16px;
  font-weight: 700;
  color: #7a1f1f;
  width: 20px;
  text-align: center;
}

.hz-cls {
  font-style: italic;
  color: #1b3558;
}

.legend-domain {
  margin-bottom: 8px;
}

.legend-domain-name {
  font-family: 'Cinzel', serif;
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a1f1f;
  margin-bottom: 4px;
  margin-top: 4px;
}

.region-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  background: none;
  border: none;
  border-left: 2px solid transparent;
  font-family: 'IM Fell English', serif;
  font-size: 13px;
  color: #1b3558;
  cursor: pointer;
  transition: all 140ms;
  line-height: 1.4;
}

.region-btn:hover {
  background: rgba(27, 53, 88, 0.06);
  border-left-color: #c8b49c;
}

.region-btn.active {
  background: rgba(122, 31, 31, 0.07);
  border-left-color: #7a1f1f;
  color: #7a1f1f;
  font-style: italic;
}

.region-marker { color: #c8b49c; font-size: 18px; line-height: 1; }

.chart-attribution {
  margin-top: auto;
  font-size: 9px;
  color: #a08060;
  line-height: 1.5;
  font-style: italic;
  border-top: 1px solid #c8b49c;
  padding-top: 10px;
}

/* ── Sailing Directions ────────────────────────── */

.sailing-directions {
  flex: 1;
  overflow-y: auto;
  padding: 32px 48px 60px;
  background: rgba(244, 237, 224, 0.6);
}

.directions-region-label {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #a08060;
  margin-bottom: 4px;
}

.directions-title {
  font-family: 'Cinzel', serif;
  font-size: 24px;
  font-weight: 600;
  color: #1b3558;
  margin: 0 0 6px;
  letter-spacing: 0.03em;
}

.directions-desc {
  font-size: 14px;
  font-style: italic;
  color: #4a6080;
  margin: 0 0 20px;
}

/* Note to mariners */
.pilots-note {
  border: 1.5px solid #1b3558;
  border-radius: 2px;
  padding: 14px 18px;
  margin-bottom: 32px;
  background: rgba(255,255,255,0.45);
  position: relative;
}

.pilots-note::before,
.pilots-note::after {
  content: '';
  position: absolute;
  top: 3px; bottom: 3px; left: 3px; right: 3px;
  border: 1px solid #1b3558;
  opacity: 0.3;
  pointer-events: none;
}

.note-label {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #7a1f1f;
  margin-bottom: 7px;
}

.note-body {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: #2a3d55;
}

/* Section rule heads */
.section-rule-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
}

.rule-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #1b3558 40%);
}

.rule-line:last-child {
  background: linear-gradient(to left, transparent, #1b3558 40%);
}

.rule-text {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  letter-spacing: 0.2em;
  color: #1b3558;
  white-space: nowrap;
}

/* Waypoints / Agency path */
.route-section { margin-bottom: 36px; }

.waypoints { display: flex; flex-direction: column; }

.waypoint { display: flex; gap: 16px; }

.wp-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
}

.wp-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #1b3558;
  background: #f4ede0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-size: 10.5px;
  font-weight: 700;
  color: #1b3558;
  flex-shrink: 0;
}

.wp-rail {
  width: 1px;
  flex: 1;
  min-height: 16px;
  background: repeating-linear-gradient(to bottom, #1b3558 0, #1b3558 4px, transparent 4px, transparent 8px);
  margin: 4px 0;
  opacity: 0.4;
}

.wp-content {
  padding-bottom: 24px;
  flex: 1;
  padding-top: 6px;
}

.wp-label {
  font-weight: 600;
  font-size: 14.5px;
  color: #1b3558;
  margin-bottom: 3px;
}

.wp-desc {
  font-size: 13px;
  color: #5a7090;
  font-style: italic;
  margin: 0 0 7px;
  line-height: 1.6;
}

.wp-req {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 2px;
  display: inline-block;
}

.wp-req-clear {
  background: rgba(45, 90, 39, 0.08);
  color: #2d5a27;
  border: 1px solid rgba(45, 90, 39, 0.25);
}

.wp-req-marked {
  background: rgba(122, 31, 31, 0.07);
  color: #7a1f1f;
  border: 1px solid rgba(122, 31, 31, 0.25);
}

/* Hazards */
.hazards-section { margin-bottom: 32px; }

.hazard-entry {
  border: 1px solid #c8b49c;
  border-radius: 2px;
  margin-bottom: 8px;
  background: rgba(255,255,255,0.35);
  overflow: hidden;
}

.hazard-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  transition: background 130ms;
}

.hazard-head:hover { background: rgba(27, 53, 88, 0.05); }

.hz-head-left { display: flex; align-items: center; gap: 14px; }

.hz-sym-large {
  font-size: 22px;
  font-weight: 700;
  color: #7a1f1f;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.hz-name {
  font-size: 14.5px;
  font-weight: 600;
  color: #1b3558;
}

.hz-class {
  font-size: 11.5px;
  font-style: italic;
  color: #7a1f1f;
  margin-top: 1px;
}

.hz-toggle { font-size: 11px; color: #a08060; }

.hazard-body {
  padding: 4px 16px 18px;
  border-top: 1px solid #ddd0bc;
}

.hz-nature { margin-bottom: 16px; }

.hz-nature-label {
  font-family: 'Cinzel', serif;
  font-size: 8.5px;
  letter-spacing: 0.18em;
  color: #a08060;
  margin-bottom: 7px;
  margin-top: 14px;
}

.hz-worry-text {
  font-style: italic;
  color: #4a6080;
  font-size: 13.5px;
  line-height: 1.65;
  margin: 0 0 7px;
  padding-left: 14px;
  border-left: 2px solid #c8b49c;
}

.hz-surface {
  font-size: 12.5px;
  color: #5a7090;
  margin: 0;
}

.hz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 12px;
}

.hz-col-head {
  font-family: 'Cinzel', serif;
  font-size: 8.5px;
  letter-spacing: 0.18em;
  color: #7a1f1f;
  margin-bottom: 10px;
}

.hz-option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
}

.hz-opt-depth {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.hz-opt-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1b3558;
  line-height: 1.4;
}

.hz-opt-detail {
  font-size: 11.5px;
  font-style: italic;
  color: #7a8a9a;
  margin-top: 2px;
  line-height: 1.5;
}

@media (max-width: 860px) {
  .chart-legend { width: 200px; min-width: 200px; }
  .sailing-directions { padding: 24px 20px 48px; }
  .hz-options { grid-template-columns: 1fr; }
}
</style>
