# Releasing dotcloak v0.1.0

This project is not published by automation yet. Release is a manual process and requires explicit credentials and approval.

## Pre-release Checks

Run from the repository root:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm_config_cache=/tmp/dotcloak-npm-cache npm pack --dry-run
```

Confirm:

- README matches actual CLI behavior
- `CONTRIBUTING.md` is up to date
- package tarball contains only intended publish artifacts
- Linux limitation note is present in README

## Manual Release Steps

1. Verify the repository state you want to release.
2. Confirm the version in `package.json`.
3. Create the git tag and GitHub release notes.
4. Publish to npm with approved credentials.
5. Verify install flow with `npm install -g dotcloak` or `npx dotcloak`.

## Explicitly Out of Scope for This Repo State

- Running `npm publish`
- Changing GitHub repository visibility
- Creating a demo GIF

## Known Manual Follow-ups

- Demo GIF is still missing. README uses a static CLI flow until that asset exists.
- GitHub Actions should be allowed to run on Ubuntu for final release confidence, but this document does not assume an already-observed green run.
- Final public release still requires human approval and credentials.
