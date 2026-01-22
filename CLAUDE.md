# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

All commands run from the `src/` directory:

```bash
cd work/local/src

npm run dev        # Start development server
npm run build      # Type check + production build
npm run typecheck  # Type check only (no build)
npm run preview    # Preview production build
```

## Technology Stack

- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** with strict mode
- **Vite** for bundling
- **Vue Router** for navigation
- **Marked** for markdown rendering

## Project Structure

```
work/local/
├── model/              # JSON data files defining the maturity model
│   ├── overview.json
│   ├── agency_stages.json
│   ├── agency_substages.json
│   └── fate-determining-choices.json
└── src/
    └── src/
        ├── composables/    # Vue composables for data and utilities
        ├── views/          # Route components
        └── types.ts        # TypeScript interfaces for model data
```

## Architecture

**Data Flow**: JSON model files → TypeScript interfaces → Vue composables → Views

- Model data lives in `model/*.json` files
- Types in `types.ts` define the shape of all model data
- `useModelData` composable provides reactive access to model data
- `useMarkdown` composable wraps marked for rendering markdown fields
- Views render model content with collapsible sections and navigation

**Path Aliases** (configured in tsconfig.json and vite.config.ts):
- `@/*` → `src/*`
- `@model/*` → `../model/*`

## Domain Context

This is a presentation/documentation app for an **AI Development Maturity Model**. The model describes:

- **Primary Axis**: Agency in the development loop (who decides what happens next)
- **Secondary Axes**: Self-improvement and parallelism
- **Fate-Determining Choices**: Architectural decisions that determine a system's ceiling (system of record, determinism boundary, evaluation explicitness, memory strategy)
- **Agency Stages**: Progressive levels of human-to-AI agency transfer

Content is stored as markdown within JSON files and rendered via the `marked` library.
