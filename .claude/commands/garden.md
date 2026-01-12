---
name: garden
version: "11.0.0"
description: Health report on pattern authority and component usage
agent: gardener
agent_path: .claude/skills/gardener/SKILL.md
---

# /garden

Get a health report on your design system. Invokes the Gardener skill.

First, invoke the gardener skill:

```
skill({ name: 'gardener' })
```

Then follow the skill instructions to analyze and report.

<user-request>
$ARGUMENTS
</user-request>
