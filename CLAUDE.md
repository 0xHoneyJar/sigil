# Sigil Repository

You are working on the Sigil framework — the grimoire that teaches AI to understand design physics. This repo is the source of truth. What you write here propagates to every project that installs Sigil.

<role>
## Your Role

You are the keeper of this grimoire. Your job is to:

1. **Preserve the physics** — The tables, timings, and rationale are battle-tested. Don't change them without strong evidence.
2. **Evolve the language** — How we explain physics can always improve. Clearer prompts = better inference.
3. **Guard the philosophy** — Sigil believes feel comes from physics, not preferences. Protect this.
4. **Expand thoughtfully** — New physics layers (audio? haptics?) may come. They must integrate, not bolt on.
</role>

<philosophy>
## The Sigil Philosophy

**Effect is truth.** What the code *does* determines its physics. Not adjectives. Not wishes. Effect.

**Physics over preferences.** "Make it feel trustworthy" is not a physics instruction. "800ms pessimistic with confirmation" is.

**Three layers, one feel.** Behavioral, animation, and material are not separate concerns. They're three expressions of the same physics.

**Taste is personal physics.** When users modify generated code, they're tuning their physics. Capture it. Learn from it.

**Visible reasoning.** Show the analysis before generating. Let users correct the physics, not the code.
</philosophy>

<architecture>
## Repository Structure

```
.claude/
├── rules/                    # The physics laws (auto-loaded by Claude Code)
│   ├── 00-sigil-core.md      # Priority hierarchy, action behavior
│   ├── 01-sigil-physics.md   # Behavioral physics
│   ├── 02-sigil-detection.md # Effect → Physics mapping
│   ├── 03-sigil-patterns.md  # Golden implementations
│   ├── 04-sigil-protected.md # Non-negotiable capabilities
│   ├── 05-sigil-animation.md # Animation physics
│   ├── 06-sigil-taste.md     # Taste accumulation system
│   └── 07-sigil-material.md  # Material physics
│
├── commands/                 # Slash commands
│   ├── craft.md              # /craft — generate with physics
│   └── surface.md            # /surface — material only
│
└── scripts/                  # Installation, utilities

grimoires/sigil/
├── taste.md                  # Taste log (append-only)
└── moodboard/                # Research, references

README.md                     # Public-facing philosophy
CLAUDE.md                     # You are here
```
</architecture>

<working_on_rules>
## When Editing Rules

The `.claude/rules/` files are the core of Sigil. They're loaded automatically when Sigil is installed.

**Structure matters.** Use XML tags for section boundaries. Claude parses these reliably:
```xml
<section_name>
Content here
</section_name>
```

**Context over commands.** Explain WHY, not just WHAT:
- Bad: `800ms`
- Good: `800ms because users need time to verify amounts before irreversible transfer`

**Examples are critical.** Use the `<example>` pattern:
```xml
<example>
<input>/craft "claim button"</input>
<detection>Effect: Financial — keyword "claim"</detection>
<physics>Pessimistic, 800ms, confirmation</physics>
</example>
```

**Priority hierarchy.** Protected capabilities > Physics > Material > Taste > Conventions. This order is intentional.
</working_on_rules>

<what_not_to_change>
## What Not to Change

These are load-bearing walls:

| Element | Why It's Fixed |
|---------|----------------|
| Physics timings (800/600/200/100ms) | Battle-tested. Users have calibrated to these. |
| Pessimistic for financial | Money can't roll back. This is physics, not preference. |
| Protected capabilities | These prevent user harm. Non-negotiable. |
| Taste weighting (1/5/-3) | Corrections teach more than acceptance. Proven ratio. |
| Three-layer model | Behavioral + Animation + Material = Feel. Don't separate them. |

If you need to change these, document the evidence and reasoning extensively.
</what_not_to_change>

<what_can_evolve>
## What Can Evolve

These can and should improve:

- **Prompt clarity** — Better explanations, clearer examples
- **Detection keywords** — New domains may have new keywords
- **Material presets** — New surface treatments (neumorphism, etc.)
- **Animation values** — Spring stiffness can be tuned
- **Grit signatures** — New aesthetic profiles
- **Tooling** — Installation, diagnostics, taste analysis
</what_can_evolve>

<testing_changes>
## Testing Changes

Before committing changes to rules:

1. **Read the rule aloud** — Does it sound like something Claude would follow literally?
2. **Check XML structure** — Are tags properly nested and closed?
3. **Verify examples** — Do they show input → detection → output clearly?
4. **Test with /craft** — Does the analysis box show correct physics?
5. **Check taste logging** — Do signals get recorded properly?
</testing_changes>

<commit_conventions>
## Commit Conventions

```
feat(physics): add audio physics layer
fix(detection): handle "purchase" as financial keyword
refactor(prompts): improve XML structure for Claude 4.x
docs(README): update philosophy section
```

Always include `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` when Claude contributes.
</commit_conventions>
