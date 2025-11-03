# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Todo application built with React 19, TypeScript, and Vite. The app manages todo states with periodic polling (every 5 seconds) to fetch data and update the UI. It supports updating todo status and assignees.

## Build System

This project uses **rolldown-vite** (Vite 7 with Rolldown bundler) instead of standard Vite. Rolldown is a Rust-based bundler that uses oxc for Fast Refresh with @vitejs/plugin-react.

## Common Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Type-check with TypeScript then build for production
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

## Architecture

This application follows **Layered Architecture** with **Domain-Driven Design (DDD)** principles:

### Layer Structure

```
src/
├── domain/              # Domain Layer - Business logic, entities, interfaces
│   ├── models/         # Todo, TodoStatus, Assignee
│   └── repositories/   # Repository interfaces
├── application/        # Application Layer - Use cases, orchestration
│   ├── usecases/      # GetTodos, UpdateTodoStatus, UpdateTodoAssignee
│   └── di/            # Dependency Injection container
├── infrastructure/     # Infrastructure Layer - External implementations
│   └── repositories/  # MockTodoRepository (in-memory data)
└── presentation/       # Presentation Layer - React components, hooks
    ├── components/    # TodoList, TodoItem, AssigneeSelector
    └── hooks/         # useTodoPolling
```

### Key Principles

1. **Dependency Inversion Principle (DIP)**: Domain layer defines repository interfaces; Infrastructure layer implements them
2. **Dependency Injection (DI)**: `container.ts` provides repository instances to use cases
3. **Repository Pattern**: Domain layer declares interfaces, Infrastructure layer provides implementations

### Data Flow

1. **Presentation** → calls **Application** use cases
2. **Application** → receives repository via DI, orchestrates domain logic
3. **Domain** → defines business rules and entities
4. **Infrastructure** → implements repository interfaces (currently uses mock data)

## Implementation Details

**Entry Point:** src/main.tsx initializes the React app with StrictMode

**Main Component:** src/App.tsx manages polling and renders TodoList

**Polling:** Every 5 seconds, fetches todos and updates UI (see useTodoPolling hook or App.tsx)

**Data Persistence:** LocalStorageTodoRepository saves todos to browser LocalStorage (replaces MockTodoRepository)

**Initial Data:** First launch creates 4 sample todos with 3 available assignees

**State Management:** Direct React state (useState/useEffect) - no external state library

**TypeScript Configuration:** Uses composite project references (tsconfig.json) with separate configs for app code (tsconfig.app.json) and build tooling (tsconfig.node.json)

## Important Notes

- React 19 is used (latest major version)
- The project uses module ESM (type: "module" in package.json)
- No test framework is currently configured
- Data persists in browser LocalStorage; survives page refresh but is browser-specific
- To switch back to mock data or implement API: modify `src/application/di/container.ts`
- To modify polling interval, change the value in App.tsx (currently 5000ms)
- LocalStorage key: `todo-app-data` (JSON serialized)
