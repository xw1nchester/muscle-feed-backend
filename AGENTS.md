# AGENTS.md

## Project Overview

Backend API for Muscle Feed, a food delivery platform. The code serves client-facing endpoints and admin endpoints for auth, users, menus, dishes, orders, reviews, FAQ, cities, promocodes, uploads, settings, and reports.

Stack confirmed in `package.json` and bootstrap code: NestJS 10, TypeScript, PostgreSQL, Prisma 6, Redis-backed Nest cache, Passport/JWT, cookie refresh tokens, class-validator/class-transformer, Jest/Supertest, Nodemailer/Pug, Sharp, Docker.

## Architecture

- NestJS feature modules live under `src/`. Most features follow `*.module.ts`, `*.controller.ts`, `*.service.ts`, with local `dto/` and `pipes/` where needed.
- `src/main.ts` configures global `ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })`, CORS, `cookie-parser`, global `/api` prefix, and Swagger from `swagger.yaml`.
- `src/app.module.ts` wires feature modules, `ServeStaticModule` at `/static`, global Redis cache, `LoggerMiddleware`, and the global JWT guard.
- Persistence is direct Prisma access through injected `PrismaService`, which extends `PrismaClient`. There is no separate repository layer; services often use small Prisma delegate getters.
- Auth is global: `JwtAuthGuard` is registered as `APP_GUARD`. A route is unauthenticated only when decorated with `@Public()`.
- Admin routing uses `Controller('admin/...')`. Role checks are explicit with `@UseGuards(RoleGuard)` and `@Role(...)`; do not assume every `admin/*` method has a role check.
- Cache is Redis-backed through Nest `CacheModule`. Existing invalidation is manual via `RedisService.del(...)` or `RedisService.clear()`, and some controllers also use `CacheInterceptor` with explicit `CacheKey`.
- Localization is stored as `*Ru` and `*He` fields. Many DTO builders return `{ ru, he }` using explicit mapping or `extractLocalizedFields`.

## Repository Structure

- `src/main.ts` - runtime bootstrap and global HTTP behavior.
- `src/app.module.ts` - root module, global auth/cache/static setup.
- `src/auth` - JWT strategy, guards, decorators, auth controller/service, auth DTOs.
- `src/admin` - admin controllers, admin DTOs, admin-only pipes, reports.
- `src/order` - order creation, delivery plans, freezes, skipped days, replacements, bag returns.
- `src/menu` - menu types, menu prices, menu cycle/meal-plan logic, recommendations.
- `src/settings` - settings, contacts, delivery weekdays, next-delivery-date helpers.
- `src/prisma` - Prisma Client wrapper for Nest injection.
- `prisma/schema` - Prisma schema folder; models are split by file.
- `prisma/migrations` - committed database migrations.
- `test` - e2e tests and SQL fixtures.
- `uploads` - files served through `/static`.
- `.github/workflows/deploy.yml` - CI/deploy workflow for `main` and `dev`.

## Development Commands

- `npm install` - install dependencies. Modifies `node_modules`; can touch lockfile depending on npm behavior.
- `npm run start:dev` - start Nest in watch mode.
- `npm run start` - start Nest without watch.
- `npm run start:prod` - run `dist/main`.
- `npm run build` - run `nest build`; writes `dist` and catches TypeScript compile errors. There is no separate `typecheck` script.
- `npm run test` - run Jest unit tests from `src` matching `*.spec.ts`.
- `npm run test:watch` - run unit tests in watch mode.
- `npm run test:cov` - run unit tests with coverage. Writes coverage output.
- `npm run test:e2e` - run e2e tests with `test/jest-e2e.json`.
- `npm run lint` - run ESLint with `--fix`; this can modify files.
- `npm run format` - run Prettier over `src/**/*.ts` and `test/**/*.ts`; this modifies files.
- `npm run seed` - run `prisma/seed.ts`; modifies the configured database.
- `npx prisma migrate deploy` - apply committed migrations to the configured database.
- `npx prisma generate` - regenerate Prisma Client after schema changes.

## Coding Rules

- Do not add `@Public()` unless the endpoint must bypass the global JWT guard.
- For admin authorization, copy the local pattern exactly: import `Role as RoleEnum` from `@prisma/client`, then use `@UseGuards(RoleGuard)` with `@Role(RoleEnum.ADMIN)` or `@Role(RoleEnum.MODERATOR)`.
- `RoleGuard` checks one required role from handler metadata first, then class metadata. If a route needs different access than its controller default, set method-level role metadata.
- Keep request DTOs strict enough for the global `ValidationPipe`; unknown request fields are rejected by `forbidNonWhitelisted`.
- Preserve existing custom pipes for cross-field/domain checks: examples include `OrderPipe`, `ValidateMenuPipe`, `ValidateFreezeDates`, `DateValidationPipe`, upload pipes, and map parsing.
- Access PostgreSQL through injected `PrismaService`; use `$transaction` when changing multiple related rows in one domain operation.
- Keep Prisma field names camelCase in TypeScript and map database names with existing `@map`/`@@map` snake_case conventions.
- Preserve `Ru`/`He` localized model fields and the existing response convention of nested `{ ru, he }` objects where surrounding service code returns that shape.
- When changing data read through cache keys such as `menu:types`, `team`, `cities`, `payment:methods`, `settings`, or `personal:*`, update the corresponding manual invalidation.
- Follow existing Nest module/service/controller layout and existing path aliases; do not introduce a new architecture style for a narrow change.

## Testing Rules

- Add or update focused unit tests for changes to service-level calculations or branching logic.
- Order date planning, delivery weekdays, freezes, skipped weekdays, and replacement selection are high-value test targets; `src/order/services/order.service.spec.ts` already exercises date planning.
- Settings delivery behavior has existing service tests; update them when changing delivery weekday or next-delivery-date logic.
- Use e2e tests for auth, guards, validation behavior, cookies, and controller/API contract changes.
- Verification commands are `npm run test`, `npm run test:e2e`, and `npm run build`. Use the smallest relevant test first, then broader checks if the change touches shared behavior.
- The CI workflow runs `npm run lint`, `npx prisma migrate deploy`, `npm run test`, and `npm run test:e2e`, but the `test` job has `continue-on-error: true`; do not rely on CI failure as the only quality gate.

## Database Rules

- Prisma uses `previewFeatures = ["prismaSchemaFolder"]`; models are split under `prisma/schema`.
- Schema changes require a matching migration under `prisma/migrations`.
- After schema changes, run `npx prisma generate`, `npm run build`, and affected tests.
- Keep relation delete behavior intentional. Existing models use a mix of `Cascade` and `SetNull`, especially around orders, menus, users, cities, payment methods, and order days.
- Use `$transaction` for multi-step writes that must remain consistent, such as order plan creation/update, contact/social replacement, bag return reward updates, and individual order creation.

## High-Risk Areas

- `src/order` - creates and rewrites order days/dishes, calculates delivery plans, handles freezes/skips, prices, discounts, individual orders, replacements, and bag returns.
- `src/menu` - owns menu cycles, primary/replacement dishes, prices, published filtering, recommendations, personal menu cache, and broad cache clears.
- `src/settings` - delivery weekdays and next-delivery-date helpers directly affect order validity and personal menu generation.
- `src/auth` - global JWT guard, `@Public()` metadata, refresh-token cookies, and role checks define access control.
- `prisma/schema` and `prisma/migrations` - schema changes affect generated Prisma types, runtime queries, migrations, and existing data assumptions.
- `uploads` and static serving - files are written to `uploads`, exposed at `/static`, processed by upload pipes/Sharp, and sometimes deleted based on stored URLs.

## Change Guidelines

- Prefer small changes inside the existing feature/module boundary.
- Do not refactor unrelated services, DTOs, migrations, formatting, or generated output.
- Do not add dependencies unless the current Nest/Prisma/utility stack is insufficient for the requested behavior.
- Do not change route paths, auth requirements, response shapes, localized field names, or error shape unless required by the task.
- After touching a cached read path, verify the write path invalidates the same cache key or intentionally clears cache.
- After touching Prisma schema or relationship behavior, check all services that query or include the changed model.

## Definition of Done

For substantial changes:

- Run the closest affected tests, then broader tests when shared behavior changed.
- Run `npm run build`.
- Run lint only when file modification from `--fix` is acceptable, then inspect the diff.
- Inspect `git diff` before finishing.
- Confirm only intended files changed.
- Report any skipped verification.
