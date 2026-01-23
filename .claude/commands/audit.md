---
name: "audit"
version: "1.0.0"
description: |
  Comprehensive security and quality audit of the application codebase.
  OWASP Top 10, secrets, architecture, code quality review.

arguments:
  - name: "scope"
    description: "Limit audit to specific area (security, architecture, quality, devops, or path pattern)"
    required: false
    default: "all"

agent: "auditing-security"
agent_path: "skills/auditing-security/"

context_files:
  - path: "grimoires/loa/prd.md"
    required: false
    purpose: "Product requirements for context"
  - path: "grimoires/loa/sdd.md"
    required: false
    purpose: "Architecture decisions for context"
  - path: "grimoires/loa/sprint.md"
    required: false
    purpose: "Sprint plan and implementation status"
  - path: "app/src/**/*"
    required: false
    purpose: "Application source code"
  - path: "app/tests/**/*"
    required: false
    purpose: "Test files"

pre_flight: []

outputs:
  - path: "grimoires/loa/a2a/audits/$DATE/SECURITY-AUDIT-REPORT.md"
    type: "file"
    description: "Comprehensive security audit report"
  - path: "grimoires/loa/a2a/audits/$DATE/remediation/"
    type: "directory"
    description: "Remediation tracking for findings"

mode:
  default: "foreground"
  allow_background: true
---

# Audit Codebase

## Purpose

Comprehensive security and quality audit of the application codebase by the Paranoid Cypherpunk Auditor. Use before production deployment or after major code changes.

## Invocation

```bash
/audit                          # Full audit (all areas)
/audit --scope security         # Security audit only
/audit --scope architecture     # Architecture audit only
/audit --scope quality          # Code quality audit only
/audit --scope devops           # DevOps/infrastructure audit only
/audit --scope "src/auth/**"    # Audit specific path pattern
/audit background               # Run as background subagent
```

## Agent

Launches `auditing-security` from `skills/auditing-security/`.

See: `skills/auditing-security/SKILL.md` for full workflow details.

## When to Use

- Before production deployment
- After major code changes or new integrations
- When implementing security-sensitive features (auth, payments, data handling)
- Periodically for ongoing projects
- When onboarding to assess existing codebase

## Workflow

1. **Documentation Review**: Read PRD, SDD, sprint plan for context
2. **Code Audit**: Review `app/src/` for security vulnerabilities
3. **Test Review**: Check `app/tests/` for coverage and quality
4. **Config Audit**: Review configuration and environment handling
5. **Report**: Generate audit report at `grimoires/loa/a2a/audits/YYYY-MM-DD/`

## Output Location

Reports are stored in the State Zone under `grimoires/loa/a2a/audits/`:

```
grimoires/loa/a2a/audits/
└── 2026-01-17/
    ├── SECURITY-AUDIT-REPORT.md   # Main audit report
    └── remediation/               # Remediation tracking
        ├── critical-001.md
        └── high-001.md
```

## Arguments

| Argument | Description | Required | Default |
|----------|-------------|----------|---------|
| `--scope` | Limit audit to specific area or path | No | `all` |
| `background` | Run as subagent for parallel execution | No | - |

### Scope Values

| Value | Description |
|-------|-------------|
| `all` | Full comprehensive audit (default) |
| `security` | Security vulnerabilities, secrets, auth |
| `architecture` | Design patterns, complexity, scalability |
| `quality` | Code quality, testing, documentation |
| `devops` | Infrastructure, deployment, monitoring |
| `<path>` | Audit specific file/directory pattern |

## Outputs

| Path | Description |
|------|-------------|
| `grimoires/loa/a2a/audits/YYYY-MM-DD/SECURITY-AUDIT-REPORT.md` | Comprehensive audit report |
| `grimoires/loa/a2a/audits/YYYY-MM-DD/remediation/` | Remediation tracking |

## Focus Areas

### Security Audit (Highest Priority)
- Secrets management
- Authentication & authorization
- Input validation & injection vulnerabilities
- Data privacy concerns
- Supply chain security
- API security
- Infrastructure security

### Architecture Audit
- Threat modeling
- Single points of failure
- Complexity analysis
- Scalability concerns
- Vendor lock-in risks

### Code Quality Audit
- Error handling
- Type safety
- Code smells
- Testing coverage
- Documentation quality

### DevOps & Infrastructure Audit
- Deployment security
- Monitoring & observability
- Backup & recovery
- Access control

## Severity Criteria

| Severity | Definition | SLA | Examples |
|----------|------------|-----|----------|
| **CRITICAL** | Active exploitation possible, data breach imminent | Fix within 24h, block deployment | Hardcoded secrets, SQL injection, auth bypass, RCE |
| **HIGH** | Significant security risk, exploitation likely | Fix before production | XSS, CSRF, insecure deserialization, missing auth checks |
| **MEDIUM** | Moderate risk, exploitation requires effort | Fix within sprint | Information disclosure, weak crypto, missing rate limits |
| **LOW** | Minor risk, defense in depth | Track in backlog | Verbose errors, missing headers, outdated non-vulnerable deps |
| **INFO** | Best practice recommendations | Optional | Code style, documentation, optimization opportunities |

### Severity Decision Tree

```
Can attacker gain unauthorized access to data/systems?
├─ YES → Does it require authentication?
│        ├─ NO → CRITICAL (public exploit path)
│        └─ YES → HIGH (authenticated exploit path)
└─ NO → Can attacker disrupt service?
         ├─ YES → HIGH (DoS/availability impact)
         └─ NO → Can attacker gain information?
                  ├─ YES → MEDIUM (info disclosure)
                  └─ NO → LOW or INFO
```

### Risk Score Calculation

```
Risk = Likelihood × Impact

Likelihood: 1 (unlikely) to 5 (trivial to exploit)
Impact: 1 (minimal) to 5 (catastrophic)

Score 15-25: CRITICAL
Score 10-14: HIGH
Score 5-9: MEDIUM
Score 1-4: LOW
```

## Report Format

The audit report includes:
- Executive summary with overall risk level
- Critical issues (fix immediately)
- High priority issues (fix before production)
- Medium and low priority issues
- Informational notes and best practices
- Positive findings
- Actionable recommendations
- Complete security checklist status
- Threat model summary
