# dotcloak

> Encrypt your .env so AI coding tools can't read it.

**Ship with AI. Without leaking secrets.**

dotcloak encrypts your `.env` files with [age encryption](https://age-encryption.org/) so AI coding tools (Cursor, Claude Code, Copilot, etc.) can only see ciphertext. Your app gets secrets via `dotcloak run` which decrypts in-memory only.

## Quick Start

```bash
npm install -g dotcloak

# Encrypt your .env
dotcloak init

# Run your app with secrets
dotcloak run npm start
```

## How it works

1. `dotcloak init` encrypts `.env` → `.env.cloak` and deletes the original
2. AI tools see only `.env.cloak` (encrypted gibberish)
3. `dotcloak run <cmd>` decrypts in-memory and injects as environment variables
4. Your app uses `process.env.API_KEY` as usual — zero code changes

## Commands

| Command | Description |
|---------|-------------|
| `dotcloak init` | Generate keys and encrypt .env |
| `dotcloak run <cmd>` | Run command with decrypted secrets |
| `dotcloak list` | List secrets (masked) |
| `dotcloak set KEY=VALUE` | Add/update a secret |
| `dotcloak unset KEY` | Remove a secret |
| `dotcloak edit` | Edit secrets in $EDITOR |
| `dotcloak status` | Show protection status |
| `dotcloak key export` | Export secret key |
| `dotcloak key import` | Import secret key |

## Why dotcloak?

AI coding agents read your filesystem and send contents to cloud APIs. `.cursorignore` is "best effort" — it can be bypassed. `.claudeignore` has known vulnerabilities.

dotcloak takes a different approach: **encrypt the file itself**. No plaintext `.env` on disk means nothing to leak.

## License

MIT
