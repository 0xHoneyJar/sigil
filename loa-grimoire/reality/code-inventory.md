# Code Reality Inventory

> Extracted: 2026-01-01
> Target: sigil (Design Context Framework v2.0.0)

## File Statistics

| Type | Count |
|------|-------|
| Markdown files (.md) | 112 |
| Shell scripts (.sh) | 53 |
| YAML files (.yaml/.yml) | 20 |

## Directory Structure

```
.
├── .claude/
│   ├── commands/     # 20 command files
│   ├── skills/       # 14+ skills (mix of Loa + Sigil)
│   ├── scripts/      # Mount and utility scripts
│   └── templates/    # Moodboard, rules, sigilrc templates
├── loa-grimoire/     # Loa state zone
│   ├── a2a/trajectory/
│   ├── analytics/
│   ├── context/
│   └── reality/
└── (sigil-mark/)     # Sigil state zone (created on setup)
```

## Commands Discovered

### Sigil-Native Commands (in .claude/commands/)
| Command | File | Status |
|---------|------|--------|
| /setup | setup.md | Present |
| /envision | envision.md | Present |
| /inherit | inherit.md | Present |
| /update | update.md | Present |

### Loa Commands (inherited via loa-upstream)
| Command | Purpose |
|---------|---------|
| /architect | Software Design Document |
| /audit | Security audit |
| /audit-deployment | Deployment audit |
| /audit-sprint | Sprint audit |
| /contribute | PR to upstream |
| /deploy-production | Production deployment |
| /feedback | Developer feedback |
| /implement | Task implementation |
| /mcp-config | MCP configuration |
| /mount | Framework mounting |
| /plan-and-analyze | PRD creation |
| /review-sprint | Sprint review |
| /ride | Codebase analysis (this!) |
| /sprint-plan | Sprint planning |
| /translate | Executive translation |
| /translate-ride | Ride output translation |

### Missing Commands (Documented but Not Found)
| Command | Status |
|---------|--------|
| /codify | NOT FOUND |
| /craft | NOT FOUND |
| /approve | NOT FOUND |

## Skills Discovered

### Sigil-Native Skills
| Skill | Index | SKILL.md | Scripts |
|-------|-------|----------|---------|
| sigil-setup | Yes | Yes | detect-components.sh |
| sigil-updating | Yes | Yes | update.sh |
| sigil-envisioning | Yes | Yes | - |
| sigil-inheriting | Yes | Yes | infer-patterns.sh |

### Loa Skills (inherited)
- auditing-security
- deploying-infrastructure
- designing-architecture
- discovering-requirements
- implementing-tasks
- mounting-framework
- planning-sprints
- reviewing-code
- riding-codebase
- translating-for-executives

## Templates Discovered

| Template | Path | Purpose |
|----------|------|---------|
| moodboard.md | .claude/templates/ | Product feel capture template |
| rules.md | .claude/templates/ | Design rules template |
| sigilrc.yaml | .claude/templates/ | Zone configuration template |

## Entry Points

| Entry Point | Path | Purpose |
|-------------|------|---------|
| Mount Script | .claude/scripts/mount-sigil.sh | One-liner installation |
| Update Script | .claude/skills/sigil-updating/scripts/update.sh | Framework updates |
| Component Detection | .claude/skills/sigil-setup/scripts/detect-components.sh | Find components |
| Pattern Inference | .claude/skills/sigil-inheriting/scripts/infer-patterns.sh | Analyze code patterns |

## Version Tracking

| File | Content |
|------|---------|
| VERSION | 2.0.0 |
| .sigil-version.json | Created on mount (contains version, mounted_at, sigil_home) |

## Tech Stack

- **Runtime**: Bash (Claude Code CLI)
- **Format**: Markdown + YAML
- **No dependencies** other than standard shell utilities
- Optional: jq (JSON), yq (YAML)

## Integration Points

| System | Integration |
|--------|-------------|
| Loa | Coexists via loa-upstream remote |
| Claude Code | Commands, skills, scripts |
| Git | Version control, remotes |
