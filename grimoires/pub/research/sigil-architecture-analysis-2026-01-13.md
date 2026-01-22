# Sigil Architecture Analysis: Path to "Pure Craft"

**Date**: 2026-01-13
**Status**: Research Complete
**Analyst**: Oracle Analysis

---

## Executive Summary

Sigil has undergone significant migrations (v9 → v10 → v11) oscillating between over-complication and over-simplification. The current v11.1.0 "Pure Craft" state has:

- **Strength**: Clear physics model (effect → sync → timing → confirmation)
- **Weakness**: Architecture misaligned with Claude Code's native extension points
- **Gap**: No compounding mechanism - knowledge doesn't accumulate
- **Opportunity**: Rebuild on Claude Code's 5-layer stack (Agents, Skills, Commands, Hooks, MCP)

**Key Insight**: RAMS.ai succeeded with a dead-simple command (`/rams`) that does one thing well. Sigil's `/craft` should follow this pattern, but currently lacks the infrastructure to compound learnings.

---

## Part 1: Current State Analysis

### 1.1 What Sigil Has

```
.claude/
├── rules/              # 2 files: sigil-physics.md, sigil-examples.md
├── skills/             # 14 skills (crafting-components, monitoring-patterns, etc.)
├── commands/           # 20+ command definitions
├── protocols/          # Operational guidelines
├── scripts/            # 100+ helper scripts
└── schemas/            # JSON schemas

grimoires/sigil/
├── constitution.yaml   # Physics rules & vocabulary (~240 lines)
├── constitution/       # Detailed physics definitions
├── authority.yaml      # Component tier thresholds
└── state/              # Runtime state (gitignored)
```

### 1.2 What Works

| Strength | Why It Works |
|----------|--------------|
| **Physics table** | Clear mapping: effect → physics is intuitive |
| **Effect detection** | Keyword-based inference is reliable |
| **No-questions policy** | Preserves artist flow |
| **Reference examples** | ClaimButton, LikeButton, etc. are canonical |

### 1.3 What Doesn't Work

| Problem | Impact |
|---------|--------|
| **20+ commands** | Cognitive overload, no clear entry point |
| **14 skills** | Most are Loa framework artifacts, not Sigil-specific |
| **No compounding** | Each `/craft` starts fresh, no learning |
| **Authority is theoretical** | Computed-not-stored means no actual governance |
| **No hooks** | Missing Claude Code's native extension mechanism |
| **No MCP integration** | Design tools (Figma, Storybook) not connected |

### 1.4 Architecture Misalignment

**Claude Code's 5-Layer Stack:**
```
1. Agents (subagents)    → Context-isolated specialists
2. Skills                → Auto-discovered, Claude-triggered
3. Commands              → Manual, user-triggered (/command)
4. Hooks                 → Lifecycle interception (Pre/PostToolUse)
5. MCP Servers           → External tool integration
```

**Sigil's Current Model:**
```
1. Skills                → Overloaded (14 skills doing everything)
2. Commands              → Mirror skills (redundant)
3. Rules                 → Static markdown (no interactivity)
4. Constitution          → YAML config (read but not enforced)
5. Scripts               → 100+ bash scripts (fragile, unmaintained)
```

**Misalignment**: Sigil treats Skills as the universal solution. Claude Code designed Skills for auto-discovery by context, not as workflow containers.

---

## Part 2: Claude Code Best Practices (2026)

### 2.1 Memory Hierarchy

Claude Code's 4-tier memory is perfectly suited for Sigil:

| Tier | Location | Sigil Use |
|------|----------|-----------|
| Enterprise | IT policy | (N/A for open source) |
| **Project Memory** | `.claude/CLAUDE.md` | Physics core + project vocab |
| **Project Rules** | `.claude/rules/*.md` | Effect detection, examples |
| **User Memory** | `~/.claude/CLAUDE.md` | Personal style preferences |

**Insight**: Rules should be modular `.md` files, not monolithic. Currently Sigil has 2 large files; should have ~7 focused files.

### 2.2 Hooks for Physics Enforcement

Claude Code v2.1.3+ supports hooks with 10-minute timeout:

```yaml
# .claude/hooks.yaml
hooks:
  - event: PreToolUse
    matcher: "Write|Edit"
    command: ".claude/scripts/validate-physics.sh"
```

**Opportunity**: PreToolUse hook could validate that generated code matches physics before writing. Currently, validation is advisory (in SKILL.md), not enforced.

### 2.3 Skills vs Commands

| Feature | Skills | Commands |
|---------|--------|----------|
| Trigger | Auto (Claude) | Manual (`/command`) |
| Discovery | Description matching | Filename |
| Context | ~100 tokens scan, <5k active | Full file loaded |
| Use Case | Domain expertise | Explicit workflows |

**Sigil Reality**: `/craft` should be a **Command** (user-triggered, explicit). The underlying physics knowledge should be **Skills** (auto-discovered when Claude sees "button", "claim", etc.).

### 2.4 Subagents for Separation

Recent Claude Code (Dec 2025) stabilized subagent context isolation:

```
Main Agent (user conversation)
    ├── explore-subagent  → Codebase search, pattern discovery
    ├── craft-subagent    → Component generation with physics
    └── validate-subagent → Post-generation physics check
```

**Opportunity**: Sigil's monolithic `/craft` could delegate to specialized subagents, keeping main context clean.

### 2.5 MCP for Design Tools

MCP servers enable real integration:

| MCP Server | Sigil Use |
|------------|-----------|
| **Figma MCP** | Read design tokens, spacing, colors |
| **Storybook MCP** | Discover existing components, authority |
| **GitHub MCP** | Track component usage across repos |
| **Custom Physics MCP** | Serve constitution.yaml as queryable API |

**Gap**: Sigil has zero MCP integration. Design physics remain disconnected from design tools.

---

## Part 3: Gap Analysis

### 3.1 RAMS.ai Comparison

RAMS demonstrates the ideal simplicity:

```
/rams
→ Reviews code for accessibility issues
→ Reviews for visual inconsistencies
→ Reviews for UI polish
→ Offers to fix them
```

**One command. Four focus areas. Clear output.**

Sigil's equivalent should be:

```
/craft "trustworthy claim button"
→ Detects effect (financial mutation)
→ Applies physics (pessimistic, 800ms, confirmation)
→ Finds canonical pattern (ClaimButton.tsx)
→ Generates with correct physics
→ Validates against physics checklist
```

**Same flow.** But Sigil spreads this across multiple skills, commands, and scripts.

### 3.2 What's Missing for Compounding

**Current State**: Each `/craft` invocation is stateless. No learning.

**What Compounding Requires**:

| Mechanism | Purpose | Current State |
|-----------|---------|---------------|
| **Authority tracking** | Know which patterns are canonical | Computed, not persisted |
| **Usage telemetry** | Count imports, track stability | Scripts exist, never run |
| **Feedback loop** | Learn from corrections | None |
| **Pattern registry** | Index of generated components | None |

**Key Insight**: Compounding requires **state**. Sigil currently avoids state ("authority is computed, not stored"). This is philosophically pure but practically limiting.

### 3.3 Anthropic's Agentic Best Practices

From Anthropic's 2025 agentic coding guidance:

1. **Context at 70-75%**: Stop and compact, don't push to 100%
2. **Subagent delegation**: Keep main agent focused
3. **Deny-all security**: Allowlist tools per subagent
4. **CLAUDE.md investment**: 1-2 hours authoring pays dividends
5. **Hooks for validation**: Pre/PostToolUse for guardrails

**Sigil's Alignment**:
- ❌ No context management guidance
- ❌ No subagent architecture
- ✅ No-questions policy (preserves context)
- ⚠️ Rules exist but aren't optimized
- ❌ No hooks for physics validation

---

## Part 4: Proposed Architecture

### 4.1 The "Pure Craft" Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│                     /craft "description"                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     COMMAND LAYER                           │
│  .claude/commands/craft.md                                  │
│  - Parses intent                                            │
│  - Delegates to craft-subagent                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUBAGENT LAYER                          │
│  .claude/agents/                                            │
│  ├── craft.md (generation specialist)                       │
│  ├── explore.md (pattern discovery)                         │
│  └── validate.md (physics checker)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SKILL LAYER (Auto-Discovered)           │
│  .claude/skills/                                            │
│  ├── design-physics/SKILL.md (effect → physics mapping)     │
│  ├── pattern-authority/SKILL.md (canonical detection)       │
│  └── accessibility/SKILL.md (WCAG compliance)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     HOOKS LAYER (Enforcement)               │
│  .claude/hooks.yaml                                         │
│  ├── PreToolUse: validate-physics.sh                        │
│  └── PostToolUse: record-generation.sh                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     KNOWLEDGE LAYER                         │
│  .claude/rules/                                             │
│  ├── sigil-physics.md (core table)                          │
│  ├── sigil-effects.md (detection rules)                     │
│  ├── sigil-sync.md (sync strategies)                        │
│  ├── sigil-timing.md (animation timing)                     │
│  ├── sigil-confirmation.md (confirmation patterns)          │
│  ├── sigil-protected.md (non-negotiable capabilities)       │
│  └── sigil-vocabulary.md (project-specific mappings)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     STATE LAYER (Compounding)               │
│  grimoires/sigil/state/                                     │
│  ├── authority.json (computed authority, persisted)         │
│  ├── generations.jsonl (what was generated, when)           │
│  └── corrections.jsonl (user feedback for learning)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MCP LAYER (Future)                      │
│  .claude/mcp-servers/                                       │
│  ├── figma-tokens/ (design token sync)                      │
│  └── storybook-authority/ (component usage from stories)    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Simplified File Structure

```
.claude/
├── CLAUDE.md                    # Sigil project memory (imports rules)
├── commands/
│   └── craft.md                 # The ONE command
├── agents/
│   ├── craft.md                 # Generation specialist
│   ├── explore.md               # Pattern discovery
│   └── validate.md              # Physics checker
├── skills/
│   ├── design-physics/          # Auto-discovered physics expertise
│   │   └── SKILL.md
│   ├── pattern-authority/       # Canonical pattern detection
│   │   └── SKILL.md
│   └── accessibility/           # WCAG compliance (RAMS-like)
│       └── SKILL.md
├── rules/
│   ├── sigil-physics.md         # Core physics table
│   ├── sigil-effects.md         # Effect detection
│   ├── sigil-sync.md            # Sync strategies
│   ├── sigil-timing.md          # Animation timing
│   ├── sigil-confirmation.md    # Confirmation patterns
│   ├── sigil-protected.md       # Protected capabilities
│   └── sigil-vocabulary.md      # Project vocabulary
├── hooks.yaml                   # Pre/PostToolUse hooks
└── examples/
    └── components/              # Reference implementations

grimoires/sigil/
├── constitution.yaml            # Physics source of truth
└── state/                       # Compounding state (gitignored)
    ├── authority.json
    ├── generations.jsonl
    └── corrections.jsonl
```

### 4.3 The Compounding Loop

```
┌─────────────────────────────────────────────────────┐
│                    GENERATE                          │
│  /craft "claim button" → ClaimButton.tsx            │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    RECORD                            │
│  PostToolUse hook writes to generations.jsonl       │
│  {component: "ClaimButton", effect: "financial",    │
│   physics: {sync: "pessimistic", timing: 800}}      │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    USE                               │
│  Component imported across codebase                 │
│  Import count rises (10+ = Gold authority)          │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    COMPUTE                           │
│  /garden runs authority computation                  │
│  Updates authority.json with tier changes           │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    LEARN                             │
│  Next /craft for similar effect uses Gold           │
│  component as template (not generic example)        │
└─────────────────────────────────────────────────────┘
                          │
                          └──────────────► GENERATE (loop)
```

---

## Part 5: Recommended Actions

### Priority 1: Restructure Rules (1 day)

Split `sigil-physics.md` into 7 focused files matching the physics dimensions:

| File | Content |
|------|---------|
| `sigil-physics.md` | Core table only (20 lines) |
| `sigil-effects.md` | Effect detection keywords/types |
| `sigil-sync.md` | Sync strategy explanations |
| `sigil-timing.md` | Animation timing values |
| `sigil-confirmation.md` | Confirmation patterns |
| `sigil-protected.md` | Non-negotiable capabilities |
| `sigil-vocabulary.md` | Project-specific mappings |

**Benefit**: Claude Code loads rules individually. Smaller files = less context per load.

### Priority 2: Implement Hooks (1 day)

Create `.claude/hooks.yaml`:

```yaml
hooks:
  - event: PreToolUse
    matcher: "Write|Edit"
    command: ".claude/scripts/validate-physics.sh $FILE_PATH"

  - event: PostToolUse
    matcher: "Write"
    command: ".claude/scripts/record-generation.sh $FILE_PATH"
```

**Benefit**: Physics validation moves from advisory to enforced.

### Priority 3: Create Subagent Architecture (2 days)

Replace monolithic crafting-components skill with:

```
.claude/agents/
├── craft.md       # Focused on generation, reads rules
├── explore.md     # Finds canonical patterns in codebase
└── validate.md    # Checks physics compliance post-generation
```

**Benefit**: Context isolation, clearer responsibilities, matches Claude Code patterns.

### Priority 4: Enable State Persistence (1 day)

Implement `grimoires/sigil/state/`:

```json
// authority.json
{
  "ClaimButton": { "tier": "gold", "imports": 15, "stable_days": 21 },
  "LikeButton": { "tier": "silver", "imports": 7, "stable_days": 10 }
}
```

```jsonl
// generations.jsonl
{"timestamp": "2026-01-13T12:00:00Z", "component": "ClaimButton", "effect": "financial", "physics": {"sync": "pessimistic", "timing": 800}}
```

**Benefit**: Enables compounding. `/craft` uses Gold components as templates.

### Priority 5: Reduce to One Command (1 day)

Remove 19 of 20 commands. Keep only:

| Command | Purpose |
|---------|---------|
| `/craft` | Generate components with physics |
| `/garden` | (Optional) Report pattern authority |

All other functionality (architect, implement, audit, etc.) is Loa framework, not Sigil.

**Benefit**: Dead simple like RAMS. One command, one purpose.

### Future: MCP Integration

Phase 2 work for design tool integration:

- **Figma MCP**: Sync design tokens to vocabulary
- **Storybook MCP**: Extract component usage for authority
- **Custom Physics MCP**: Serve constitution.yaml as queryable API

---

## Part 6: Migration Path

### Phase 1: "Focused Craft" (Week 1)

1. Split rules into 7 files
2. Implement hooks for validation
3. Remove non-Sigil commands
4. Update CLAUDE.md to import rules

### Phase 2: "Compound Craft" (Week 2)

1. Create subagent architecture
2. Enable state persistence
3. Implement authority computation
4. Connect /craft to authority data

### Phase 3: "Connected Craft" (Week 3+)

1. Design MCP server architecture
2. Prototype Figma token sync
3. Evaluate Storybook integration
4. Document MCP patterns

---

## Conclusion

Sigil's physics model is sound. The architecture is not.

The path forward:
1. **Align with Claude Code's 5-layer stack** (Agents, Skills, Commands, Hooks, MCP)
2. **Embrace state for compounding** (authority.json, generations.jsonl)
3. **Simplify to one command** (/craft, like RAMS's /rams)
4. **Enforce with hooks** (PreToolUse validation)
5. **Connect with MCP** (design tool integration)

The goal: `/craft "claim button"` should be dead simple, physics-correct, and compound on every use.

---

## Sources

### Anthropic Official
- [Claude Code Overview](https://code.claude.com/docs/en/overview)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Claude Code Releases
- v2.1.7 (Jan 14, 2026): MCP tool search, context fixes
- v2.1.6 (Jan 13, 2026): Skill discovery from nested directories
- v2.1.3 (Jan 9, 2026): Merged slash commands and skills, 10-min hook timeout

### Sigil Internal
- `.claude/rules/sigil-physics.md`
- `.claude/rules/sigil-examples.md`
- `grimoires/sigil/constitution.yaml`
- `.claude/skills/crafting-components/SKILL.md`

### External Reference
- [RAMS.ai](https://www.rams.ai/) - Design engineer tool for accessibility
