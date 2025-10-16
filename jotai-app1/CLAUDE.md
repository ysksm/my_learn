# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A learning project for exploring Jotai state management patterns in React. Built with Vite, React 19, and TypeScript.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production (runs TypeScript compiler then Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build locally
npm run preview
```

## Build System

- **Bundler**: Uses `rolldown-vite` (Vite 7.1.14 with Rolldown bundler) for faster builds
- **Fast Refresh**: Configured via `@vitejs/plugin-react` with Babel (or oxc in rolldown-vite)
- **TypeScript**: Dual tsconfig setup - `tsconfig.app.json` for app code, `tsconfig.node.json` for config files

## Code Quality

- **ESLint**: Configured with TypeScript ESLint, React Hooks rules, and React Refresh plugin
- **Type checking**: Run `tsc -b` to check types across all referenced tsconfigs
- Linting uses modern ESLint flat config format (eslint.config.js)

## Project Structure

```
src/
├── App.tsx       # Main application component
├── main.tsx      # Entry point with React root setup
├── assets/       # Static assets
└── *.css         # Styles
```

## Notes

- React 19.1.1 is used (latest stable)
- React Compiler is NOT enabled (for performance reasons)
- Currently a basic template - will evolve with Jotai patterns for usecase/hook architecture
