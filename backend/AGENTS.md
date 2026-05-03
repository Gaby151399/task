# Backend Agent Instructions

## Stack

- The backend uses NestJS, TypeScript, Prisma, PostgreSQL, Jest, ESLint, and Prettier.
- Follow the existing NestJS module structure in `src/`.
- Keep controllers thin: route handling, validation boundaries, and HTTP concerns belong there.
- Put business logic in services.
- Use Prisma through the existing database service/module patterns.

## Code Style

- Match the style already used in `backend/src`.
- Prefer small, focused changes over broad refactors.
- Do not add dependencies unless they are clearly needed and justified.
- Do not modify generated files in `dist/`.
- Do not commit secrets or edit `.env` unless explicitly requested.
- Update `.env.example` when adding a required environment variable.

## API Design

- Keep public API behavior stable unless the task explicitly asks for a breaking change.
- Use DTOs or typed request bodies when adding or changing endpoints.
- Return consistent HTTP status codes and error shapes.
- Keep authentication and authorization checks close to the protected use case.
- Do not expose sensitive fields such as passwords, tokens, or internal database details.

## Prisma And Database

- Update `prisma/schema.prisma` for schema changes.
- Add or adjust Prisma queries in services, not controllers.
- Be careful with migrations and destructive schema changes.
- Avoid deleting data or dropping tables unless explicitly requested.
- When changing models, check affected services, tests, and API responses.

## Tests And Verification

- Add or update Jest tests for new behavior or bug fixes.
- Prefer focused unit tests for services and controller behavior.
- Use e2e tests when changing request/response flows.
- Run relevant checks when possible:
  - `npm test`
  - `npm run lint`
  - `npm run build`

## Boundaries

- Do not modify the frontend unless explicitly requested.
- Do not change Docker, Prisma, or TypeScript configuration unless the task requires it.
- Do not refactor unrelated modules while implementing a feature or fix.
