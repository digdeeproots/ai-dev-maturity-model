<script setup lang="ts">
import { RouterLink } from 'vue-router'

const PROTOTYPES = [
  {
    id: 'proto-a',
    letter: 'A',
    name: 'The Navigator',
    direction: 'Application',
    tagline: 'Professional split-panel app: sticky safety ladder, sidebar navigation, agency timeline, accordion worries.',
    palette: ['#76232f', '#faf8f5', '#1a1a1a', '#15803d', '#0e7490'],
    font: 'Open Sans',
    bg: '#faf8f5',
    accent: '#76232f',
  },
  {
    id: 'proto-b',
    letter: 'B',
    name: 'The Spectrum Board',
    direction: 'Dashboard',
    tagline: 'Monitoring-board aesthetic: color-coded spectrum bar, work type rows with worry dot indicators, compact expandable detail.',
    palette: ['#76232f', '#ffffff', '#1a1a1a', '#0e7490', '#4d7c0f'],
    font: 'Open Sans + monospace',
    bg: '#f5f4f2',
    accent: '#76232f',
  },
  {
    id: 'proto-c',
    letter: 'C',
    name: 'The Field Guide',
    direction: 'Editorial',
    tagline: 'Spacious reference document: large typography, pull-quote stakes, horizontal agency stations, full option tables.',
    palette: ['#76232f', '#ffffff', '#1a1a1a', '#b8860b', '#15803d'],
    font: 'Open Sans',
    bg: '#ffffff',
    accent: '#76232f',
  },
  {
    id: 'proto-d',
    letter: 'D',
    name: 'The Chart',
    direction: 'Nautical Metaphor',
    tagline: 'Vintage portolan chart as texture and metaphor: rhumb lines, compass rose, hazard symbols, sailing directions.',
    palette: ['#1b3558', '#f4ede0', '#7a1f1f', '#2d5a27', '#a08060'],
    font: 'IM Fell English + Cinzel',
    bg: '#f4ede0',
    accent: '#1b3558',
  },
  {
    id: 'proto-e',
    letter: 'E',
    name: 'The Bestiary',
    direction: 'Illuminated Manuscript',
    tagline: 'Medieval bestiary as framework: real 12th–13th century manuscript illustrations, heraldic shields, Latin creature names, vellum aesthetic.',
    palette: ['#76232f', '#f5eed4', '#1a3a6e', '#b8860b', '#1a1208'],
    font: 'Cinzel Decorative + EB Garamond',
    bg: '#f5eed4',
    accent: '#76232f',
  },
  {
    id: 'proto-f',
    letter: 'F',
    name: 'The Object',
    direction: 'Spatial / Zoom',
    tagline: 'Full-screen spatial interface: dot-grid board with 3D tilt, morph animation from card to full viewport, worry drawer slides from edge.',
    palette: ['#1a1a1a', '#eeeae3', '#76232f', '#15803d', '#0e7490'],
    font: 'Open Sans',
    bg: '#eeeae3',
    accent: '#76232f',
  },
]
</script>

<template>
  <div class="proto-index">
    <header class="index-header">
      <div class="index-header-inner">
        <div class="index-kicker">Safety Matrix</div>
        <h1 class="index-title">Design Prototypes</h1>
        <p class="index-subtitle">Five directions for the same model. Click any to explore.</p>
      </div>
    </header>

    <div class="proto-grid">
      <RouterLink
        v-for="p in PROTOTYPES"
        :key="p.id"
        :to="`/${p.id}`"
        class="proto-card"
        :style="{ '--card-bg': p.bg, '--card-accent': p.accent }"
      >
        <div class="card-swatch-bar">
          <span
            v-for="(color, i) in p.palette"
            :key="i"
            class="swatch"
            :style="{ background: color }"
          ></span>
        </div>

        <div class="card-body">
          <div class="card-header-row">
            <span class="card-letter" :style="{ color: p.accent }">{{ p.letter }}</span>
            <span class="card-direction-tag">{{ p.direction }}</span>
          </div>
          <h2 class="card-name">{{ p.name }}</h2>
          <p class="card-tagline">{{ p.tagline }}</p>
          <div class="card-font-label">{{ p.font }}</div>
        </div>

        <div class="card-footer">
          <span class="view-link">View prototype →</span>
        </div>
      </RouterLink>
    </div>

    <footer class="index-footer">
      <RouterLink to="/" class="back-link">← Back to main overview</RouterLink>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap');

.proto-index {
  font-family: 'Open Sans', sans-serif;
  background: #f5f3f0;
  min-height: 100vh;
  color: #1a1a1a;
}

/* ── Header ──────────────────────────────────── */

.index-header {
  background: #76232f;
  padding: 48px 32px 44px;
  text-align: center;
}

.index-header-inner {
  max-width: 560px;
  margin: 0 auto;
}

.index-kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  margin-bottom: 8px;
}

.index-title {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
  letter-spacing: -0.02em;
}

.index-subtitle {
  font-size: 15px;
  color: rgba(255,255,255,0.72);
  margin: 0;
}

/* ── Grid ────────────────────────────────────── */

.proto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 40px 32px;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Card ────────────────────────────────────── */

.proto-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1.5px solid #e0dbd7;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 200ms, transform 160ms, border-color 180ms;
  position: relative;
}

.proto-card:hover {
  box-shadow: 0 8px 28px rgba(0,0,0,0.11);
  transform: translateY(-3px);
  border-color: var(--card-accent);
}

/* Color swatch strip at top */
.card-swatch-bar {
  display: flex;
  height: 7px;
}

.swatch {
  flex: 1;
}

/* Card body */
.card-body {
  flex: 1;
  padding: 22px 22px 16px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-letter {
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}

.card-direction-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #999;
  border: 1px solid #e0dbd7;
  padding: 3px 8px;
  border-radius: 20px;
}

.card-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.card-tagline {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 14px;
}

.card-font-label {
  font-size: 10.5px;
  color: #bbb;
  font-style: italic;
}

/* Card footer */
.card-footer {
  padding: 12px 22px 16px;
  border-top: 1px solid #f0ebe6;
  background: #faf8f5;
}

.view-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--card-accent, #76232f);
  transition: gap 150ms;
}

.proto-card:hover .view-link {
  text-decoration: underline;
}

/* ── Footer ──────────────────────────────────── */

.index-footer {
  text-align: center;
  padding: 8px 32px 40px;
}

.back-link {
  font-size: 13px;
  color: #76232f;
  text-decoration: none;
  transition: opacity 150ms;
}

.back-link:hover { opacity: 0.75; text-decoration: underline; }

@media (max-width: 700px) {
  .proto-grid { grid-template-columns: 1fr; padding: 24px 16px; }
  .index-title { font-size: 28px; }
}
</style>
