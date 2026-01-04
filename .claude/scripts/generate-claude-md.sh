#!/usr/bin/env bash
# generate-claude-md.sh - Generate CLAUDE.md from sigil-mark/ state
# Part of Sigil v11 Soul Engine
# Usage: ./generate-claude-md.sh [output_path]

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

SIGIL_MARK="${SIGIL_MARK:-sigil-mark}"
OUTPUT_FILE="${1:-CLAUDE.md}"

# Check for required files
check_files() {
    local missing=0

    if [[ ! -d "$SIGIL_MARK" ]]; then
        echo "Error: sigil-mark/ directory not found"
        echo "Run /setup to initialize Sigil first"
        exit 1
    fi

    # Check kernel files
    for f in kernel/physics.yaml kernel/sync.yaml kernel/fidelity-ceiling.yaml; do
        if [[ ! -f "$SIGIL_MARK/$f" ]]; then
            echo "Warning: Missing $SIGIL_MARK/$f"
            missing=1
        fi
    done

    # Check soul files
    for f in soul/materials.yaml soul/zones.yaml soul/tensions.yaml soul/essence.yaml; do
        if [[ ! -f "$SIGIL_MARK/$f" ]]; then
            echo "Warning: Missing $SIGIL_MARK/$f"
            missing=1
        fi
    done

    return $missing
}

# ═══════════════════════════════════════════════════════════════════════════════
# YAML PARSING HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

# Extract value from YAML (simple parser)
yaml_get() {
    local file="$1"
    local key="$2"
    grep -E "^${key}:" "$file" 2>/dev/null | sed 's/^[^:]*: *//' | tr -d '"' || echo ""
}

# Extract multi-line value
yaml_get_block() {
    local file="$1"
    local key="$2"
    sed -n "/^${key}:/,/^[a-z]/p" "$file" 2>/dev/null | head -n -1 | tail -n +2 || echo ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# GENERATION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

generate_header() {
    cat << 'EOF'
# Sigil Design Context

> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

This file is auto-generated from `sigil-mark/` by `/sync`. Do not edit directly.

---

EOF
}

generate_three_laws() {
    cat << 'EOF'
## The Three Laws

1. **Server-tick data MUST show pending state** — Never optimistic for money/inventory/trades
2. **Fidelity ceiling cannot be exceeded** — "Better" is often "worse"
3. **Visuals are dictated, never polled** — Taste Owner decides pixels

---

EOF
}

generate_materials_section() {
    local materials_file="$SIGIL_MARK/soul/materials.yaml"

    if [[ ! -f "$materials_file" ]]; then
        return
    fi

    cat << 'EOF'
## Materials

Materials define physics, not just styles. Each has specific primitives and forbidden patterns.

EOF

    # Extract material names and descriptions
    for material in glass clay machinery; do
        local desc=$(grep -A5 "^  ${material}:" "$materials_file" | grep "description:" | sed 's/.*description: *//' | tr -d '"')
        if [[ -n "$desc" ]]; then
            echo "### ${material^}"
            echo "$desc"
            echo ""

            # Get forbidden patterns
            echo "**Forbidden:**"
            sed -n "/^  ${material}:/,/^  [a-z]/p" "$materials_file" | grep -A20 "forbidden:" | grep "^      -" | head -5 | sed 's/^      - /- /'
            echo ""
        fi
    done

    echo "---"
    echo ""
}

generate_zones_section() {
    local zones_file="$SIGIL_MARK/soul/zones.yaml"

    if [[ ! -f "$zones_file" ]]; then
        return
    fi

    cat << 'EOF'
## Zones

Zones determine material, sync strategy, and motion style based on file path.

| Zone | Material | Sync | Motion |
|------|----------|------|--------|
EOF

    for zone in critical transactional exploratory marketing celebration; do
        local material=$(sed -n "/^  ${zone}:/,/^  [a-z]/p" "$zones_file" | grep "material:" | head -1 | sed 's/.*material: *//' | tr -d '"')
        local sync=$(sed -n "/^  ${zone}:/,/^  [a-z]/p" "$zones_file" | grep "sync:" | head -1 | sed 's/.*sync: *//' | tr -d '"')
        local motion=$(sed -n "/^  ${zone}:/,/^  [a-z]/p" "$zones_file" | grep "style:" | head -1 | sed 's/.*style: *//' | tr -d '"')

        if [[ -n "$material" ]]; then
            echo "| ${zone^} | $material | $sync | $motion |"
        fi
    done

    echo ""
    echo "---"
    echo ""
}

generate_fidelity_section() {
    local fidelity_file="$SIGIL_MARK/kernel/fidelity-ceiling.yaml"

    if [[ ! -f "$fidelity_file" ]]; then
        return
    fi

    cat << 'EOF'
## Fidelity Ceiling

The Mod Ghost Rule: "Better" is often "worse." This protects the soul.

### Constraints

EOF

    # Visual constraints
    echo "**Visual:**"
    echo "- Max gradient stops: 2"
    echo "- Max shadow layers: 3"
    echo "- Max border radius: 16px"
    echo ""

    echo "**Animation:**"
    echo "- Max duration: 800ms"
    echo "- Max properties animated: 3"
    echo ""

    echo "**Forbidden Techniques:**"
    grep "^  - " "$fidelity_file" 2>/dev/null | head -10 | sed 's/^  //' || echo "- See fidelity-ceiling.yaml"
    echo ""

    echo "---"
    echo ""
}

generate_sync_section() {
    local sync_file="$SIGIL_MARK/kernel/sync.yaml"

    if [[ ! -f "$sync_file" ]]; then
        return
    fi

    cat << 'EOF'
## Sync Strategies

| Strategy | Optimistic | Use Cases |
|----------|------------|-----------|
| server_tick | NEVER | Money, trades, inventory |
| crdt | Yes | Documents, comments, chat |
| lww | Yes | Settings, preferences, UI state |
| local_only | Yes | Modals, dropdowns, hover |

### Server-Tick (CRITICAL)

For money/inventory/trades, UI MUST:
1. Show pending state immediately
2. Never update optimistically
3. Wait for server confirmation
4. Show success animation (xp_drop style)

---

EOF
}

generate_agent_protocol() {
    cat << 'EOF'
## Agent Protocol

### Before Generating UI Code

1. **Detect zone** from file path
2. **Load material** for that zone
3. **Check sync strategy** for data involved
4. **Apply fidelity constraints**
5. **Run constitution check** after generation

### Zone Detection

```
1. Get current file path
2. Match against zone patterns in zones.yaml
3. Return material, sync, and motion defaults
4. Apply to generated code
```

### Constitution Check

After generation, verify:
- Does this respect the soul statement?
- Does this violate any invariants?
- Does this match the feel for this context?
- Does this exceed the fidelity ceiling?

---

EOF
}

generate_commands_section() {
    cat << 'EOF'
## Commands Reference

| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Sigil on a repo |
| `/envision` | Capture product soul (interview) |
| `/codify` | Define materials and lock kernel |
| `/zone` | Configure path-based zones |
| `/craft` | Get design guidance during implementation |
| `/validate` | Check against fidelity ceiling |
| `/garden` | Track paper cuts (3:1 ratio) |
| `/approve` | Taste Owner sign-off |
| `/greenlight` | Community concept poll |
| `/prove` | Register feature for proving |

---

EOF
}

generate_footer() {
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    cat << EOF
## Version

Generated: $timestamp
Framework: Sigil v11 Soul Engine

---

*"Culture is the Reality. Code is Just the Medium."*
EOF
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

main() {
    echo "Generating CLAUDE.md from sigil-mark/..."

    check_files || true

    {
        generate_header
        generate_three_laws
        generate_materials_section
        generate_zones_section
        generate_fidelity_section
        generate_sync_section
        generate_agent_protocol
        generate_commands_section
        generate_footer
    } > "$OUTPUT_FILE"

    echo "✓ Generated $OUTPUT_FILE"
    echo "  - Three Laws section"
    echo "  - Materials from materials.yaml"
    echo "  - Zones from zones.yaml"
    echo "  - Fidelity constraints from fidelity-ceiling.yaml"
    echo "  - Sync strategies from sync.yaml"
    echo "  - Agent protocol"
    echo "  - Commands reference"
}

main "$@"
