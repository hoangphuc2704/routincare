# Routin Frontend

Social Habit Tracker frontend built with React 19, Vite 8, and a feature-oriented architecture.

## Architecture

```text
App Bootstrap -> Routing -> Features/Pages -> Services API/Core
```

| Layer | Responsibility |
| --- | --- |
| app | Bootstrap entry, providers, and centralized route table |
| pages | Route-level screens (admin and customer) |
| features | Feature-specific business logic and UI modules |
| entities | Pure domain models and type-like constants |
| shared | Reusable ui, hooks, utils, constants |
| widgets | High-level composed UI blocks |
| services | API clients and core runtime integrations |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run local

```bash
npm run dev
```

### Build and preview

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

### Performance baseline

```bash
npm run perf:baseline
```

Check current bundle breakdown without rebuilding:

```bash
npm run perf:check
```

Default budget thresholds:

- Total JS: 1500 KB
- Largest JS chunk: 550 KB
- Entry JS chunk: 330 KB
- Total CSS: 180 KB

Override budgets per environment when needed:

- PERF_MAX_TOTAL_JS_KB
- PERF_MAX_LARGEST_JS_KB
- PERF_MAX_ENTRY_JS_KB
- PERF_MAX_TOTAL_CSS_KB

## Project Structure

```text
src/
	app/
		bootstrap/
		providers/
		router/
	pages/
		admin/
		customer/
		Login/
	features/
	entities/
	shared/
	widgets/
	services/
		api/
		core/
	components/
	contexts/
	layouts/
	utils/
	constants/
```

## Config Layout

- configs/build: Vite + PostCSS
- configs/lint: ESLint
- configs/style: Tailwind + environment variables
- Current env file: configs/style/.env
- Build perf baseline config: configs/build/vite.config.js
- Bundle budget checker: scripts/perf/check-bundle-size.mjs

## Naming Conventions

- Folder names should be clear and typo-free.
- Page files should be consistent by module, using either SomethingPage.jsx or index.jsx.
- Feature modules should be split into api, hooks, model, and components when needed.
- Keep domain pages in their domain folder, not at pages root.

## API Documents

- Backend REST specification: [docs/Api Specification](docs/Api%20Specification)
- FE request/response contract: [docs/FE_API_REQUEST_RESPONSE.md](docs/FE_API_REQUEST_RESPONSE.md)
- FE/backend coverage matrix: [docs/FE_BACKEND_API_COVERAGE.md](docs/FE_BACKEND_API_COVERAGE.md)

## Workspace Notes

- Explorer nesting for package-lock.json and vercel.json is disabled so both files appear separately.
- Technical folders such as .vscode, node_modules, dist, .vite, and .vercel are hidden in Explorer.

## Migration Policy

- Legacy folders are still kept to avoid breaking existing imports.
- New code should follow the app/shared/entities/features/pages/widgets direction.

## Tech Stack

- React 19
- Vite 8
- React Router
- Ant Design
- Axios
- SignalR
- Tailwind CSS

## Team

- Frontend team: React-based web client development
- Backend team: ASP.NET Core API and infrastructure
