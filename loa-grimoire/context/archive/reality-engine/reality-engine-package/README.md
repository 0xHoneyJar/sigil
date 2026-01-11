# Reality Engine

> **Culture is the Reality. Code is Just the Medium.**

A design governance framework for products where emergent behavior matters as much as intended design.

## Quick Start

```bash
# 1. Copy to your project
cp -r reality-engine/ your-project/
cp CLAUDE.md your-project/
cp .reality-engine.yaml your-project/
cp -r .claude/ your-project/

# 2. Configure taste owners
vim reality-engine/taste-owners.yaml

# 3. Define your Canon of Flaws
vim reality-engine/soul-binder/canon-of-flaws.yaml

# 4. Start using with Claude
claude  # In your project directory
/soul-check  # Check for flaw violations
```

## What Is This?

The Reality Engine is a design governance system that emerged from 11 architectural iterations, each solving the fatal flaw of the previous.

It's designed for **high-affinity products** where:
- "Bugs" can become beloved features (prayer flicking)
- Community culture matters as much as specs
- Multiple visual "truths" coexist (Vanilla + HD)
- Scale reveals behaviors that small teams can't find

## The Four Pillars

### 1. Soul Binder (Metaphysics)
Protects both **intended** soul (Immutable Values) and **emergent** soul (Canon of Flaws).

The Canon of Flaws is the key innovation: it registers "bugs" that became skill expression and prevents well-meaning optimizations from destroying them.

### 2. Lens Array (Interpretations)
Supports multiple visual truths simultaneously:
- **Nostalgia**: Pure, original, minimal
- **Modern**: HD, shadows, GPU effects
- **Utility**: Accessible, mobile, large targets

All assets must validate in the most constrained lens.

### 3. Consultation Chamber (Soft Poll)
Manages community input without design-by-committee:
- **Strategic**: Major features get binding polls
- **Direction**: Style choices get concept blogs + heatmaps
- **Execution**: Details are dictated by Taste Owners

After direction is decided, execution is LOCKED.

### 4. Proving Grounds (Public Beta)
Validates features at scale before shipping:
- XP/value rate monitoring
- Economy health tracking
- Exploit detection
- 7 days clean → graduates to Canon

## File Structure

```
your-project/
├── CLAUDE.md                    # Agent instructions
├── .reality-engine.yaml         # Configuration
├── .claude/
│   ├── commands/                # Slash commands
│   └── skills/reality-engine/   # Skill definition
└── reality-engine/
    ├── soul-binder/
    │   ├── immutable-values.yaml
    │   ├── canon-of-flaws.yaml
    │   └── visual-soul.yaml
    ├── lens-array/
    │   └── lenses.yaml
    ├── consultation-chamber/
    │   └── config.yaml
    ├── proving-grounds/
    │   └── config.yaml
    ├── canon/gold/              # Gold Standard assets
    └── taste-owners.yaml
```

## Commands

| Command | Purpose |
|---------|---------|
| `/soul-check` | Validate against Canon of Flaws |
| `/lens-validate <asset>` | Multi-lens asset validation |
| `/grit-check <asset>` | Cultural signature check |
| `/consult <feature>` | Start consultation process |
| `/prove <feature>` | Deploy to Proving Grounds |
| `/graduate <feature>` | Check graduation status |

## Key Concepts

### Canon of Flaws
Some bugs are sacred:
- **Prayer Flicking**: Frame-perfect prayer toggling (FLAW-001)
- **Tick Manipulation**: Faster skilling through action combos (FLAW-002)
- **Animation Canceling**: Faster attacks via input timing (FLAW-003)

The agent will BLOCK any code change that would "fix" a Protected Flaw.

### Grit Validation
Technical compliance ≠ soul. Assets can pass every polygon budget while having the "Play-Doh" problem—too smooth, too clean.

The system checks for:
- Edge roughness (0.3+ minimum)
- Color band visibility (0.5+ minimum)
- Texture noise (0.2+ minimum)
- Hand-painted indicators

### Consultation Locking
After direction is consulted and decided:
```
User: "What do players think about the sword being curved?"

Agent: "That's a tactical execution detail.
        Direction was consulted. Execution is locked.
        This is a Taste Owner decision, not a poll."
```

## Configuration

### 1. Define Your Values
Edit `reality-engine/soul-binder/immutable-values.yaml`:
```yaml
values:
  your_value:
    name: "Your Core Value"
    description: "What this means for your product"
    enforcement:
      type: "metric"
      constraints:
        - name: "your_constraint"
          threshold: 100
          action: "block"
```

### 2. Register Your Flaws
Edit `reality-engine/soul-binder/canon-of-flaws.yaml`:
```yaml
flaws:
  - id: "FLAW-XXX"
    name: "Your Sacred Bug"
    type: "bug"
    status: "PROTECTED"
    intended_behavior: "What should happen"
    emergent_behavior: "What actually happens (protected)"
    affected_code_patterns:
      - "*your*pattern*"
```

### 3. Assign Taste Owners
Edit `reality-engine/taste-owners.yaml`:
```yaml
domains:
  your_domain:
    taste_owner:
      name: "Domain Lead"
      placeholder: "@your_lead"
    scope:
      paths:
        - "src/features/your-domain/**"
```

## Philosophy

```
CULTURE IS THE REALITY. CODE IS JUST THE MEDIUM.

PROTECT THE FLAWS
Some bugs are sacred. Don't optimize out the magic.

GRIT OVER SMOOTH
Technical compliance ≠ soul. Watch for Play-Doh.

CONSULT, THEN LOCK
Poll direction, not details. Then stop polling.

SCALE REVEALS TRUTH
Prove in public. 50 people can't find what 1M will.
```

## Origin

This architecture emerged from studying:
- **Old School RuneScape**: Polling, 117HD, Canon of Flaws examples
- **Linear**: Opinionated design, rejecting A/B testing
- **Jagex Polling Charter**: "Asset Visuals will no longer be subject to polls"

## License

MIT License - Use freely, protect your flaws.

---

**The Reality Engine builds products that survive their own community.**
