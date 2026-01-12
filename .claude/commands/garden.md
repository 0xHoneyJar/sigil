---
name: garden
version: "10.1.0"
description: Health report including Process layer (Constitution, Decisions, Personas)
agent: diagnostician
agent_path: .claude/skills/diagnostician/SKILL.md
---

# /garden

Get a health report on your design system. Uses the Diagnostician to analyze patterns, detect issues, and report on component authority.

## Usage

```
/garden              # Full health report
/garden Button       # Diagnose specific component
```

## What It Checks

1. **Authority Status** — Which components are Gold, Silver, Draft
2. **Pattern Health** — Survival metrics, usage trends
3. **Potential Issues** — Common pitfalls, misconfigurations
4. **Context Gaps** — Missing taste signals, persona ambiguity

## Report Format

```
AUTHORITY REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gold (10+ imports):   Button, Card, Modal
Silver (5-9 imports): Tooltip, Dropdown
Draft (1-4 imports):  NewFeature, Experimental

PATTERN HEALTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
animation:spring     ████████░░ 8 uses (canonical)
animation:fade       ████░░░░░░ 4 uses (surviving)

POTENTIAL ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ Button.tsx:45 - Hydration mismatch pattern detected
  → See diagnostician for fix

CONTEXT HEALTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Taste signals:  ████████░░ 80% confident
Persona:        ██████░░░░ 60% confident (need more prompts)
Project:        ██████████ 100% mapped
```

## The Gardener Runs Automatically

The Gardener skill runs on every git push to main:
- Computes authority from imports
- Updates survival metrics
- Promotes patterns that meet criteria

This command just reports the current state.
