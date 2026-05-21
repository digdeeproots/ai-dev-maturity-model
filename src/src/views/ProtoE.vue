<script setup lang="ts">
import { ref } from 'vue'

const LEVEL_COLORS = ['#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#0e7490']
const LEVEL_BG    = ['#fef2f2', '#fff7ed', '#fffbeb', '#f7fee7', '#f0fdf4', '#ecfeff']
const ROMAN       = ['0', 'I', 'II', 'III', 'IV', 'V']

const SAFETY_LADDER = [
  { level: 5, name: 'Carefree',      desc: 'The system makes the right action easy and mistakes structurally hard. Careless implementors thrive.',   canReachZero: true  },
  { level: 4, name: 'Prevention',    desc: 'Mistakes cannot propagate past the originator. Careless is fine within well-defined scopes.',             canReachZero: true  },
  { level: 3, name: 'Deterministic', desc: 'Known worries are reliably caught. Careless is fine for covered ones.',                                   canReachZero: false },
  { level: 2, name: 'Probabilistic', desc: 'Errors are sometimes caught. Careless is sometimes fine.',                                               canReachZero: false },
  { level: 1, name: 'Vigilance',     desc: 'Errors are caught only when someone is paying attention. Careless is never fine.',                        canReachZero: false },
  { level: 0, name: 'Hope',          desc: 'No mechanism exists. Errors propagate undetected.',                                                       canReachZero: false },
]

// Bestiary creature mappings
const CREATURE_IMAGES: Record<string, string> = {
  capability_regression:     'https://upload.wikimedia.org/wikipedia/commons/e/ed/AberdeenBestiaryFolio065vDragon.jpg',
  adaptability_reduction:    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Griffon_3244.jpg',
  documentation_misalignment:'https://upload.wikimedia.org/wikipedia/commons/9/92/Onocentaur_and_siren.jpg',
}

const CREATURE_NAMES: Record<string, string> = {
  capability_regression:     'Draco Regressionis',
  adaptability_reduction:    'Gryphus Rigiditas',
  documentation_misalignment:'Siren Falsidoca',
}

const CREATURE_NATURES: Record<string, string> = {
  capability_regression:     'A fire-breathing destroyer of working things. It dwells in shared code and emerges when that code is changed, consuming what once worked and leaving smoke where function once stood.',
  adaptability_reduction:    'Half eagle, half lion — immovable in its ways. Its touch turns the soft clay of code into stone. Each passing makes the next change harder, and the next harder still.',
  documentation_misalignment:'A creature of two voices, singing false harmonies. One voice sings of what the code says; the other of what the documents claim. A mariner who heeds either without checking both will find themselves on rocks.',
}

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
          { level: 'A1', label: 'AI assists',               desc: 'AI suggests; human executes and reviews every line',               required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes complete modules; human reviews outcomes',             required: 'Capability regression: Deterministic' },
          { level: 'A3', label: 'AI operates in scope',      desc: 'AI implements features autonomously within task boundaries',       required: 'Capability regression: Prevention or Carefree; adaptability: Deterministic' },
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
    description: 'Work that manages how the team operates, plans, and coordinates.',
    workTypes: [
      {
        id: 'writing_documentation',
        name: 'Writing Documentation',
        description: 'Creating and maintaining READMEs, API docs, architecture diagrams, decision records.',
        businessStake: 'Documentation is leverage: it multiplies the value of every other investment, or destroys it when it misleads.',
        worryIds: ['documentation_misalignment', 'adaptability_reduction'],
        agencyPath: [
          { level: 'A1', label: 'AI assists',               desc: 'AI drafts; human edits and approves',           required: 'No minimum' },
          { level: 'A2', label: 'AI executes, human reviews', desc: 'AI writes full docs from code; human reviews', required: 'Documentation misalignment: Probabilistic' },
          { level: 'A3', label: 'AI operates in scope',      desc: 'AI keeps docs in sync automatically',           required: 'Documentation misalignment: Deterministic' },
          { level: 'A4', label: 'Human in the loop',         desc: 'AI manages full doc lifecycle',                  required: 'Documentation misalignment: Prevention; all other: Deterministic' },
        ],
      },
    ],
  },
]

const worryMap  = Object.fromEntries(WORRIES.map(w => [w.id, w]))
const classOpen = ref(true)
const expandedWorries = ref<string[]>([])

function toggleWorry(key: string) {
  const i = expandedWorries.value.indexOf(key)
  if (i >= 0) expandedWorries.value.splice(i, 1)
  else expandedWorries.value.push(key)
}
</script>

<template>
  <div class="proto-e">

    <!-- ── Frontispiece header ── -->
    <header class="ms-header">
      <div class="header-ornament top">
        <span class="orn-rule"></span>
        <span class="orn-diamond">◆ ◆ ◆</span>
        <span class="orn-rule"></span>
      </div>
      <div class="ms-kicker">Liber Bestiarius Artificialis Intelligentiae</div>
      <h1 class="ms-title">
        <span class="ms-drop-T">T</span>he Bestiary of Perils
      </h1>
      <p class="ms-subtitle">
        Being a full and complete account of those Dangers which attend the Delegation of Works unto Artificial Minds,
        together with their Natures, Signs of Presence, and Remedies against them.
      </p>
      <div class="header-ornament bottom">
        <span class="orn-rule"></span>
        <span class="orn-diamond">◆ ◆ ◆</span>
        <span class="orn-rule"></span>
      </div>
    </header>

    <div class="ms-body">

      <!-- ── Classification of Perils (safety ladder) ── -->
      <section class="classification">
        <button class="class-toggle" @click="classOpen = !classOpen">
          <span class="class-toggle-text">
            <span class="class-drop">C</span>lassification of Perils — the interpretive scale by which all Levels herein are to be read
          </span>
          <span class="class-chevron" :class="{ open: classOpen }">›</span>
        </button>

        <div v-if="classOpen" class="class-entries">
          <div
            v-for="l in SAFETY_LADDER"
            :key="l.level"
            class="class-entry"
          >
            <div class="class-shield" :style="{ background: LEVEL_COLORS[l.level] }">
              <span class="shield-roman">{{ ROMAN[l.level] }}</span>
            </div>
            <div class="class-content">
              <div class="class-name" :style="{ color: LEVEL_COLORS[l.level] }">{{ l.name }}</div>
              <div class="class-desc">{{ l.desc }}</div>
              <div class="class-zero" v-if="l.canReachZero">✦ Zero vigilance possible</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Domain Chapters ── -->
      <div v-for="domain in DOMAINS" :key="domain.id" class="domain-chapter">

        <div class="chapter-heading-block">
          <div class="chapter-ornament">
            <span class="chap-rule"></span>
            <span class="chap-text">Here begins the Chapter of</span>
            <span class="chap-rule"></span>
          </div>
          <h2 class="chapter-title">{{ domain.name }}</h2>
          <p class="chapter-desc">{{ domain.description }}</p>
        </div>

        <!-- Work type sections -->
        <div v-for="wt in domain.workTypes" :key="wt.id" class="wt-section">

          <h3 class="wt-heading">
            <span class="wt-initial">{{ wt.name[0] }}</span><span class="wt-rest">{{ wt.name.slice(1) }}</span>
          </h3>
          <p class="wt-desc">{{ wt.description }}</p>

          <!-- Business stake as illuminated pull quote -->
          <blockquote class="illuminated-stake">
            <div class="stake-mark">❧</div>
            <p>{{ wt.businessStake }}</p>
          </blockquote>

          <!-- Agency path -->
          <div class="agency-manuscript">
            <div class="agency-ms-head">Of the Stages of Delegation</div>
            <div class="agency-ms-steps">
              <div v-for="(step, i) in wt.agencyPath" :key="step.level" class="ms-step">
                <div class="ms-step-level">{{ step.level }}</div>
                <div class="ms-step-content">
                  <div class="ms-step-label">{{ step.label }}</div>
                  <p class="ms-step-desc">{{ step.desc }}</p>
                  <div
                    class="ms-step-req"
                    :class="step.required === 'No minimum' ? 'ms-req-blessed' : 'ms-req-guarded'"
                  >
                    <em>{{ step.required === 'No minimum' ? 'Passeth freely — no requirement of safety' : step.required }}</em>
                  </div>
                </div>
                <div class="ms-step-divider" v-if="i < wt.agencyPath.length - 1">❧</div>
              </div>
            </div>
          </div>

          <!-- Bestiary entries -->
          <div
            v-for="wId in wt.worryIds"
            :key="`${wt.id}-${wId}`"
            class="bestiary-entry"
          >
            <div class="entry-top" @click="toggleWorry(`${wt.id}-${wId}`)">
              <div class="entry-illustration-thumb">
                <img
                  :src="CREATURE_IMAGES[wId] || ''"
                  :alt="CREATURE_NAMES[wId]"
                  class="creature-thumb"
                  loading="lazy"
                />
                <div class="creature-caption-thumb">{{ CREATURE_NAMES[wId] }}</div>
              </div>
              <div class="entry-preview">
                <h4 class="entry-name">
                  <span class="entry-initial-letter">{{ worryMap[wId]?.name[0] }}</span><span>{{ worryMap[wId]?.name.slice(1) }}</span>
                </h4>
                <p class="entry-opening">{{ CREATURE_NATURES[wId] }}</p>
                <button class="entry-expand-btn">
                  {{ expandedWorries.includes(`${wt.id}-${wId}`) ? 'Close entry ▲' : 'Read full entry ▼' }}
                </button>
              </div>
            </div>

            <div v-if="expandedWorries.includes(`${wt.id}-${wId}`)" class="entry-full">
              <!-- Full illustration on expansion -->
              <div class="entry-full-illustration">
                <img
                  :src="CREATURE_IMAGES[wId] || ''"
                  :alt="CREATURE_NAMES[wId]"
                  class="creature-full"
                  loading="lazy"
                />
                <div class="creature-full-caption">
                  <em>{{ CREATURE_NAMES[wId] }}</em> · from a 12th–13th century illuminated bestiary
                </div>
              </div>

              <div class="entry-text-full">
                <div class="entry-latin-heading">{{ CREATURE_NAMES[wId] }}</div>
                <p class="entry-nature-text">{{ CREATURE_NATURES[wId] }}</p>

                <div class="entry-properties">
                  <div class="prop-head">Properties of this Peril</div>
                  <div class="prop-row">
                    <span class="prop-label">Occasion of appearance:</span>
                    <span class="prop-val">{{ worryMap[wId]?.rateEvent }}</span>
                  </div>
                  <div class="prop-row">
                    <span class="prop-label">Surface of exposure:</span>
                    <span class="prop-val">{{ worryMap[wId]?.surface }}</span>
                  </div>
                  <div class="prop-row">
                    <span class="prop-label">The gut-check:</span>
                    <span class="prop-val italic-val">{{ worryMap[wId]?.worry }}</span>
                  </div>
                </div>

                <!-- Remedies -->
                <div class="entry-remedies">
                  <div class="remedies-head">Of Remedies for the Scope of Damage</div>
                  <p class="remedies-intro">These remedies act before the creature strikes, shrinking the ground upon which it may hunt.</p>
                  <div class="remedy-rows">
                    <div
                      v-for="opt in worryMap[wId]?.scopeShrinking"
                      :key="opt.name"
                      class="remedy-row"
                      :style="{ '--rb': LEVEL_BG[opt.level] }"
                    >
                      <div class="remedy-shield" :style="{ background: LEVEL_COLORS[opt.level] }">
                        <span class="shield-r">{{ ROMAN[opt.level] }}</span>
                        <span class="shield-name">{{ SAFETY_LADDER.find(l => l.level === opt.level)?.name }}</span>
                      </div>
                      <div class="remedy-content">
                        <div class="remedy-name">{{ opt.name }}</div>
                        <div class="remedy-effect">{{ opt.effect }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="remedies-head" style="margin-top: 20px;">Of Signs and Observations</div>
                  <p class="remedies-intro">These arts enable the scholar to perceive the creature's passage after it has passed.</p>
                  <div class="remedy-rows">
                    <div
                      v-for="opt in worryMap[wId]?.efficiency"
                      :key="opt.name"
                      class="remedy-row"
                      :style="{ '--rb': LEVEL_BG[opt.level] }"
                    >
                      <div class="remedy-shield" :style="{ background: LEVEL_COLORS[opt.level] }">
                        <span class="shield-r">{{ ROMAN[opt.level] }}</span>
                        <span class="shield-name">{{ SAFETY_LADDER.find(l => l.level === opt.level)?.name }}</span>
                      </div>
                      <div class="remedy-content">
                        <div class="remedy-name">{{ opt.name }}</div>
                        <div class="remedy-effect">{{ opt.scope }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer class="ms-footer">
        <div class="footer-ornament">◆ ◆ ◆</div>
        <p>Here endeth this Bestiary, compiled for the governance of those who would delegate works to Artificial Minds.</p>
        <p class="footer-attribution">Manuscript illustrations: Aberdeen Bestiary (12th c.) · Harley MS 3244 (13th c., British Library) · Sloane MS 278. Public domain.</p>
      </footer>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

/* ── Root ──────────────────────────────────────── */

.proto-e {
  font-family: 'EB Garamond', Georgia, serif;
  background: #f5eed4;
  color: #1a1208;
  min-height: 100vh;
  font-size: 16px;
  line-height: 1.72;

  /* Subtle vellum texture via gradients */
  background-image:
    radial-gradient(ellipse at 20% 80%, rgba(139, 110, 64, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 15%, rgba(100, 70, 30, 0.07) 0%, transparent 45%),
    radial-gradient(ellipse at 60% 50%, rgba(160, 130, 80, 0.04) 0%, transparent 60%);
}

/* ── Header ────────────────────────────────────── */

.ms-header {
  background: #76232f;
  padding: 36px 48px 32px;
  text-align: center;
  position: relative;
}

.header-ornament {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin: 8px 0;
}

.orn-rule {
  flex: 1;
  max-width: 120px;
  height: 1px;
  background: rgba(255,255,255,0.3);
}

.orn-diamond {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 4px;
}

.ms-kicker {
  font-family: 'EB Garamond', serif;
  font-size: 11px;
  font-style: italic;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
}

.ms-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.ms-drop-T {
  font-size: 48px;
  line-height: 0.8;
  color: #f0c060;
  vertical-align: -0.1em;
  margin-right: 2px;
}

.ms-subtitle {
  font-size: 13.5px;
  font-style: italic;
  color: rgba(255,255,255,0.72);
  max-width: 620px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── Page body ─────────────────────────────────── */

.ms-body {
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 48px 80px;
}

/* ── Classification ────────────────────────────── */

.classification {
  border: 1.5px solid #b8860b;
  border-radius: 4px;
  margin-bottom: 52px;
  overflow: hidden;
}

.class-toggle {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: rgba(184, 134, 11, 0.08);
  border: none;
  font-family: 'EB Garamond', serif;
  font-size: 14px;
  font-style: italic;
  color: #1a1208;
  cursor: pointer;
  text-align: left;
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
  transition: background 150ms;
}

.class-toggle:hover { background: rgba(184, 134, 11, 0.13); }

.class-drop {
  font-family: 'Cinzel Decorative', serif;
  font-size: 20px;
  color: #76232f;
  line-height: 0.9;
  margin-right: 2px;
  vertical-align: -0.1em;
}

.class-chevron {
  font-size: 20px;
  color: #b8860b;
  transition: transform 200ms;
  flex-shrink: 0;
  margin-top: 1px;
}

.class-chevron.open { transform: rotate(90deg); }

.class-entries { padding: 8px 0; }

.class-entry {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(184, 134, 11, 0.12);
}

.class-entry:last-child { border-bottom: none; }

.class-shield {
  width: 42px;
  height: 52px;
  border-radius: 3px 3px 50% 50% / 3px 3px 30% 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.shield-roman {
  font-family: 'Cinzel Decorative', serif;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.class-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 3px;
}

.class-desc {
  font-size: 14px;
  color: #5a4a30;
  line-height: 1.55;
}

.class-zero {
  font-size: 12px;
  color: #15803d;
  font-style: italic;
  margin-top: 3px;
}

/* ── Domain Chapter ────────────────────────────── */

.domain-chapter { margin-bottom: 60px; }

.chapter-heading-block { text-align: center; margin-bottom: 32px; }

.chapter-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 6px;
}

.chap-rule {
  flex: 1;
  max-width: 80px;
  height: 1px;
  background: linear-gradient(to right, transparent, #b8860b);
}

.chap-rule:last-child {
  background: linear-gradient(to left, transparent, #b8860b);
}

.chap-text {
  font-family: 'EB Garamond', serif;
  font-size: 11px;
  font-style: italic;
  letter-spacing: 0.14em;
  color: #b8860b;
  text-transform: uppercase;
}

.chapter-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 22px;
  font-weight: 700;
  color: #76232f;
  margin: 0 0 6px;
  letter-spacing: 0.04em;
}

.chapter-desc {
  font-size: 14.5px;
  font-style: italic;
  color: #7a6a50;
  margin: 0;
}

/* ── Work Type Section ─────────────────────────── */

.wt-section { margin-bottom: 56px; padding-bottom: 48px; border-bottom: 1px solid rgba(184,134,11,0.2); }
.wt-section:last-child { border-bottom: none; }

.wt-heading {
  font-family: 'Cinzel Decorative', serif;
  font-size: 20px;
  color: #1a1208;
  margin: 0 0 6px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.wt-initial {
  font-size: 38px;
  line-height: 0.8;
  color: #76232f;
  float: left;
  margin-right: 4px;
  margin-top: 4px;
  font-family: 'Cinzel Decorative', serif;
}

.wt-rest { font-size: 20px; }

.wt-desc { font-size: 15px; font-style: italic; color: #7a6a50; margin: 0 0 22px; clear: both; }

/* Illuminated stake */
.illuminated-stake {
  border-left: 4px solid #b8860b;
  background: rgba(184, 134, 11, 0.07);
  padding: 16px 24px 16px 20px;
  margin: 0 0 32px;
  border-radius: 0 4px 4px 0;
}

.stake-mark {
  font-size: 28px;
  color: #b8860b;
  line-height: 1;
  margin-bottom: 4px;
}

.illuminated-stake p {
  margin: 0;
  font-size: 16px;
  font-style: italic;
  color: #3a2c18;
  line-height: 1.7;
}

/* Agency manuscript */
.agency-manuscript { margin-bottom: 40px; }

.agency-ms-head {
  font-family: 'Cinzel Decorative', serif;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b8860b;
  text-align: center;
  margin-bottom: 16px;
}

.agency-ms-steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 4px;
}

.ms-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  flex: 1;
  min-width: 140px;
}

.ms-step-level {
  font-family: 'Cinzel Decorative', serif;
  font-size: 12px;
  font-weight: 700;
  color: #76232f;
  letter-spacing: 0.04em;
}

.ms-step-content {
  background: rgba(255,255,255,0.4);
  border: 1px solid rgba(184,134,11,0.3);
  border-radius: 3px;
  padding: 10px 14px;
  flex: 1;
  width: 100%;
}

.ms-step-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1208;
  margin-bottom: 4px;
}

.ms-step-desc {
  font-size: 12.5px;
  font-style: italic;
  color: #7a6a50;
  margin: 0 0 6px;
  line-height: 1.5;
}

.ms-step-req {
  font-size: 11.5px;
  padding: 3px 8px;
  border-radius: 2px;
  line-height: 1.4;
}

.ms-req-blessed {
  background: rgba(45, 90, 39, 0.08);
  color: #2d5a27;
  border: 1px solid rgba(45,90,39,0.2);
}

.ms-req-guarded {
  background: rgba(118, 35, 47, 0.08);
  color: #76232f;
  border: 1px solid rgba(118,35,47,0.2);
}

.ms-step-divider {
  font-size: 20px;
  color: #b8860b;
  opacity: 0.4;
  align-self: center;
  padding: 0 6px;
  flex-shrink: 0;
  margin-top: 28px;
}

/* ── Bestiary Entry ────────────────────────────── */

.bestiary-entry {
  border: 1.5px solid #b8860b;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
  background: rgba(255,255,255,0.25);
}

.entry-top {
  display: flex;
  gap: 20px;
  padding: 20px;
  cursor: pointer;
  transition: background 150ms;
}

.entry-top:hover { background: rgba(184, 134, 11, 0.07); }

.entry-illustration-thumb {
  flex-shrink: 0;
  width: 110px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.creature-thumb {
  width: 110px;
  height: 140px;
  object-fit: cover;
  object-position: center top;
  border: 1.5px solid #b8860b;
  border-radius: 2px;
  filter: sepia(15%);
}

.creature-caption-thumb {
  font-size: 9px;
  font-style: italic;
  color: #b8860b;
  text-align: center;
  line-height: 1.4;
}

.entry-preview { flex: 1; }

.entry-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 16px;
  color: #76232f;
  margin: 0 0 6px;
  display: flex;
  align-items: baseline;
  gap: 0;
  flex-wrap: nowrap;
}

.entry-initial-letter {
  font-size: 42px;
  line-height: 0.8;
  color: #76232f;
  float: left;
  margin-right: 3px;
  margin-top: 5px;
  font-family: 'Cinzel Decorative', serif;
}

.entry-opening {
  font-size: 14.5px;
  font-style: italic;
  color: #3a2c18;
  line-height: 1.7;
  margin: 0 0 12px;
  clear: both;
}

.entry-expand-btn {
  background: none;
  border: 1px solid #b8860b;
  border-radius: 2px;
  padding: 4px 12px;
  font-family: 'EB Garamond', serif;
  font-size: 12.5px;
  color: #b8860b;
  cursor: pointer;
  transition: all 150ms;
}

.entry-expand-btn:hover {
  background: #b8860b;
  color: #fff;
}

/* Full entry */
.entry-full {
  border-top: 1.5px solid rgba(184,134,11,0.3);
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0;
}

.entry-full-illustration {
  padding: 24px 20px 24px 24px;
  border-right: 1px solid rgba(184,134,11,0.2);
  background: rgba(184,134,11,0.04);
}

.creature-full {
  width: 100%;
  border: 2px solid #b8860b;
  border-radius: 2px;
  filter: sepia(10%);
}

.creature-full-caption {
  font-size: 10.5px;
  font-style: italic;
  color: #7a6a50;
  text-align: center;
  margin-top: 10px;
  line-height: 1.5;
}

.entry-text-full { padding: 24px 24px 28px; }

.entry-latin-heading {
  font-family: 'Cinzel Decorative', serif;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: #b8860b;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.entry-nature-text {
  font-size: 15px;
  font-style: italic;
  color: #3a2c18;
  line-height: 1.75;
  margin-bottom: 16px;
}

.entry-properties {
  background: rgba(184,134,11,0.06);
  border: 1px solid rgba(184,134,11,0.2);
  border-radius: 3px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.prop-head {
  font-family: 'Cinzel Decorative', serif;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b8860b;
  margin-bottom: 10px;
}

.prop-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.prop-label {
  font-weight: 600;
  color: #76232f;
  flex-shrink: 0;
}

.prop-val { color: #3a2c18; }
.italic-val { font-style: italic; }

/* Remedies */
.remedies-head {
  font-family: 'Cinzel Decorative', serif;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: #76232f;
  margin-bottom: 6px;
}

.remedies-intro {
  font-size: 13px;
  font-style: italic;
  color: #7a6a50;
  margin: 0 0 10px;
}

.remedy-rows { display: flex; flex-direction: column; gap: 8px; }

.remedy-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px 10px;
  background: var(--rb, #faf8f4);
  border-radius: 3px;
  border: 1px solid rgba(184,134,11,0.15);
}

.remedy-shield {
  width: 44px;
  height: 54px;
  border-radius: 3px 3px 50% 50% / 3px 3px 28% 28%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  gap: 1px;
}

.shield-r {
  font-family: 'Cinzel Decorative', serif;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.shield-name {
  font-size: 7.5px;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.remedy-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #1a1208;
  line-height: 1.4;
}

.remedy-effect {
  font-size: 12.5px;
  font-style: italic;
  color: #7a6a50;
  margin-top: 3px;
  line-height: 1.5;
}

/* ── Footer ────────────────────────────────────── */

.ms-footer {
  border-top: 1.5px solid #b8860b;
  padding-top: 32px;
  text-align: center;
  color: #7a6a50;
  font-size: 14px;
  font-style: italic;
}

.footer-ornament {
  font-size: 14px;
  letter-spacing: 6px;
  color: #b8860b;
  margin-bottom: 12px;
}

.footer-attribution {
  font-size: 11px;
  color: #a09070;
  margin-top: 10px;
}

@media (max-width: 700px) {
  .ms-body { padding: 32px 20px 60px; }
  .entry-full { grid-template-columns: 1fr; }
  .entry-full-illustration { border-right: none; border-bottom: 1px solid rgba(184,134,11,0.2); }
  .ms-title { font-size: 24px; }
  .agency-ms-steps { flex-direction: column; }
  .ms-step-divider { transform: rotate(90deg); align-self: center; }
}
</style>
