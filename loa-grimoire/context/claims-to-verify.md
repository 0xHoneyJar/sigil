# Claims to Verify Against Code

> Generated from context discovery interview on 2026-01-01
> These are HYPOTHESES, not facts. Code is truth.

## Architecture Claims

| Claim | Source | Verification Strategy |
|-------|--------|----------------------|
| "Sigil is a design context framework v2.0.0" | README + VERSION | Check VERSION file content |
| "Framework consists of skills + commands + templates" | README | Verify directory structure |
| "Mount script allows one-liner installation" | README | Check mount-sigil.sh exists and runs |
| "Symlinks from SIGIL_HOME to project .claude/" | SKILL.md | Verify symlink creation logic |

## Domain Claims

| Claim | Source | Verification Strategy |
|-------|--------|----------------------|
| "Moodboard captures product feel, references, anti-patterns" | CLAUDE.md | Check moodboard.md template content |
| "Rules define colors, typography, spacing, motion by zone" | CLAUDE.md | Check rules.md template content |
| "Zone system uses path-based context" | CLAUDE.md | Verify .sigilrc.yaml format and usage |
| "Human approval workflow exists" | Interview | Check for /approve command |

## Tribal Knowledge (Handle Carefully)

| Claim | Source | Verification Strategy |
|-------|--------|----------------------|
| "Sigil is bottom-up (details/taste) while Loa is top-down (goals/architecture)" | Interview | Conceptual - check overlap in state zones |
| "Both meet at validation of experiments and marketing" | Interview | Check for integration points |
| "Zone resolution logic is counterintuitive" | Interview | Review zone matching code |
| "Approval workflow needs definition" | Interview | Check if /approve is implemented |
| "Designer-agent collaboration is core vision" | Interview | Check for designer-facing features |
| "Component graduation system is planned" | Interview | Look for tier/graduation references |

## WIP Status

| Area | Claimed Status | Verification Strategy |
|------|----------------|----------------------|
| Core framework | "Being finished now" | Check implemented vs documented commands |
| Commands: /envision | Unknown | Check if envision.md exists |
| Commands: /codify | Unknown | Check if codify.md exists |
| Commands: /craft | Unknown | Check if craft.md exists |
| Commands: /approve | Unknown | Check if approve.md exists |
| Commands: /inherit | Unknown | Check if inherit.md exists |
| Skills beyond setup/update | Unknown | Count skills in .claude/skills/ |

## Feature Claims from Documentation

| Feature | Source | Verification Strategy |
|---------|--------|----------------------|
| "7 commands available" | README | Count command files |
| "2 skills available" | CLAUDE.md | Count skill directories |
| "Templates for moodboard and rules" | SKILL.md | Check .claude/templates/ |
| "Version tracking via .sigil-version.json" | README | Check version file format |
| "Coexistence with Loa" | README | Check for conflicting state zones |

## Integration Claims

| Claim | Source | Verification Strategy |
|-------|--------|----------------------|
| "Sigil state zone: sigil-mark/" | CLAUDE.md | Check for directory creation |
| "Loa state zone: loa-grimoire/" | CLAUDE.md | Verify separation |
| "No automatic cross-loading" | CLAUDE.md | Check for references between systems |
