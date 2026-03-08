# Contributing to dotcloak

dotcloak is a small CLI project. Keep changes focused, keep diffs small, and do not change existing behavior without tests or explicit documentation updates.

## Setup

```bash
npm ci
```

Requirements:

- Node.js `>=20`
- npm
- A working terminal editor if you want to use `dotcloak edit` locally

## Development Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
```

## Local Verification

Run these before opening a PR:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

If you change npm packaging metadata, also verify the tarball contents:

```bash
npm_config_cache=/tmp/dotcloak-npm-cache npm pack --dry-run
```

## Test Expectations

- Add or update tests when behavior changes.
- Keep existing CLI behavior stable unless the change is intentional and documented.
- Prefer the smallest test that proves the behavior.

## Issues

- Use issues for bugs, UX gaps, docs problems, and feature proposals.
- Include the command you ran, the expected behavior, the actual behavior, and your environment if the problem is platform-specific.

## Pull Requests

- Keep each PR scoped to one logical change.
- Update README or docs when user-facing behavior or constraints change.
- Mention any Linux-specific or platform-specific caveats in the PR description.
- Do not include unrelated refactors in the same PR.
