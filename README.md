# MSB Workspace

Project structure has been reorganized into a clear monorepo layout.

## Structure

- `apps/frontend`: React application (formerly `_tmp_front_end_visuals`)
- `apps/api`: Node/Express backend + DB schema/migrations (formerly `secure-login`)

## Quick Start

### 1) Frontend

```bash
cd apps/frontend
npm install
npm run build
```

### 2) API

```bash
cd apps/api
npm install
npm run start
```

### 3) Run API with frontend build step

```bash
cd apps/api
npm run start:all
```

## Notes

- API serves the built frontend from `apps/frontend/build` by default.
- You can override that location with `FRONTEND_BUILD_DIR`.

## Detailed Project Handover Documentation (FR)

- `DOCUMENTATION_REPRISE_PROJET_FR.md`
