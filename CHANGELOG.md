# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-08

### Added
- `init` command: initialize dotcloak with age key generation and `.env.age` creation
- `run` command: decrypt `.env.age` and inject secrets into child process environment
- `set` command: add or update a secret in `.env.age`
- `unset` command: remove a secret from `.env.age`
- `list` command: list all secret keys stored in `.env.age`
- `edit` command: open `.env.age` in editor (decrypted, re-encrypted on save)
- `status` command: show encryption status of `.env` and `.env.age`
- `key` command: manage age keys (show public key, rotate)
- age encryption backend via [`age`](https://age-encryption.org/) for strong, modern encryption
- CLI integration tests with 96.98% code coverage
- Node.js 20 and 22 support via CI matrix

[Unreleased]: https://github.com/3062-in-zamud/dotcloak/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/3062-in-zamud/dotcloak/releases/tag/v0.1.0
