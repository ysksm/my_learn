# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite learning project focused on async operations. It uses the modern React 19 setup with strict TypeScript configuration and ESLint for code quality.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (runs TypeScript compilation then Vite build)
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`
- **Type checking**: `tsc -b` (part of build process)

## Architecture

- **Build Tool**: Vite with rolldown-vite override for performance
- **Frontend**: React 19 with TypeScript in strict mode
- **Entry Point**: `src/main.tsx` renders `App` component into `#root`
- **Styling**: CSS modules with separate files for components
- **Configuration**: Split TypeScript configs (app vs node), modern ESLint config with React hooks and refresh plugins

## Key Configuration

- Uses `jsx: "react-jsx"` for modern JSX transform
- Strict TypeScript with unused variable checking enabled
- ESLint configured for React hooks rules and Vite refresh
- Vite configured with React plugin for HMR support