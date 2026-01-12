# Sigil Installation Guide

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash
```

## What Gets Installed

```
your-project/
├── .claude/
│   ├── rules/
│   │   ├── sigil-physics.md    # Core physics system (auto-discovered)
│   │   └── sigil-examples.md   # Reference examples (auto-discovered)
│   └── commands/
│       └── craft.md            # /craft command
├── grimoires/
│   └── sigil/
│       └── constitution.yaml   # Physics configuration
├── examples/
│   ├── README.md
│   └── components/
│       ├── ClaimButton.tsx     # Financial mutation example
│       ├── DeleteButton.tsx    # Soft delete example
│       ├── LikeButton.tsx      # Standard mutation example
│       └── ThemeToggle.tsx     # Local state example
└── .sigil-version.json         # Version tracking
```

## What Does NOT Get Modified

**Your existing `CLAUDE.md` is never touched.**

Sigil uses Claude Code's native `.claude/rules/` discovery mechanism. All `.md` files in this directory are automatically loaded with the same priority as `CLAUDE.md`, but they're kept separate.

This means:
- Your project instructions stay in root `CLAUDE.md`
- Sigil's physics live in `.claude/rules/sigil-*.md`
- No merge conflicts when updating either
- Clear separation of concerns

## How It Works

Claude Code automatically discovers and loads:
1. Your root `CLAUDE.md` (project-specific instructions)
2. All `.md` files in `.claude/rules/` (framework instructions)

Both are loaded with equal priority, so Sigil's physics are available alongside your project rules.

## Updating Sigil

Run the mount script again:

```bash
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash
```

Only `.claude/rules/sigil-*.md` and `grimoires/sigil/` are refreshed. Your `CLAUDE.md` is untouched.

## Uninstalling

Remove the Sigil files:

```bash
rm -rf .claude/rules/sigil-*.md
rm -rf .claude/commands/craft.md
rm -rf grimoires/sigil/
rm -rf examples/
rm .sigil-version.json
```

## Usage

After installation:

```
/craft "claim button"           # Financial: 800ms, pessimistic, confirmation
/craft "like button"            # Standard: 200ms, optimistic
/craft "delete with undo"       # Soft delete: optimistic, toast with undo
/craft "dark mode toggle"       # Local: 100ms, immediate
```

Sigil infers the correct physics from the description. No configuration needed.

## Coexistence with Other Frameworks

Sigil only touches its own files:
- `.claude/rules/sigil-*.md`
- `grimoires/sigil/`
- `.claude/commands/craft.md`

Other frameworks can use their own:
- `.claude/rules/other-framework-*.md`
- `grimoires/other-framework/`
- `.claude/commands/other-command.md`

The `.claude/rules/` pattern is designed for exactly this kind of composition.

## Troubleshooting

### Physics not being applied?

Check that the rules are loaded:
```bash
ls .claude/rules/sigil-*.md
```

If missing, re-run the mount script.

### Conflicts with existing CLAUDE.md?

There shouldn't be any — Sigil doesn't modify `CLAUDE.md`. If you're seeing conflicts, you may have an older version of Sigil that used root `CLAUDE.md`. Update with the mount script to migrate to `.claude/rules/`.

### Want to customize physics?

Edit `grimoires/sigil/constitution.yaml` to adjust:
- Timing values
- Effect keywords
- Product vocabulary
- Animation presets
