# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability in dotcloak, please report it via **GitHub Issues**:

👉 https://github.com/3062-in-zamud/dotcloak/issues/new

### What to include

- A clear description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact assessment
- Any suggested fixes (optional)

### What to expect

- **Acknowledgment**: within 48 hours
- **Assessment**: within 7 days
- **Fix or mitigation**: timeline depends on severity

We take security seriously. Reports that identify real vulnerabilities will be credited in the release notes (unless you prefer to remain anonymous).

## Scope

### In scope

- Encryption/decryption logic (`age-encryption` usage)
- Key management and vault file handling
- CLI argument parsing and input handling
- Secrets exposure through error messages or logs

### Out of scope

- Vulnerabilities in upstream dependencies (report to the respective project)
- Issues requiring physical access to the machine
- Social engineering attacks
