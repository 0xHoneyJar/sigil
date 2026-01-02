#!/usr/bin/env bash
# Infer design patterns from codebase
# Usage: infer-patterns.sh [component-dir] [--json]
set -e

DIR="${1:-.}"
JSON_OUTPUT=false

if [[ "${2:-}" == "--json" ]]; then
  JSON_OUTPUT=true
fi

# Colors - find Tailwind color classes
find_colors() {
  grep -rho 'bg-[a-z]*-[0-9]*\|text-[a-z]*-[0-9]*\|border-[a-z]*-[0-9]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -10
}

# Typography - find text size and font classes
find_typography() {
  grep -rho 'text-[a-z]*\|font-[a-z]*' "$DIR" 2>/dev/null | grep -v 'text-[a-z]*-[0-9]*' | sort | uniq -c | sort -rn | head -10
}

# Spacing - find padding, margin, gap classes
find_spacing() {
  grep -rho 'p-[0-9]*\|px-[0-9]*\|py-[0-9]*\|m-[0-9]*\|mx-[0-9]*\|my-[0-9]*\|gap-[0-9]*\|space-[xy]-[0-9]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -10
}

# Motion - find animation libraries and patterns
find_motion() {
  # Check for animation libraries
  echo "Libraries:"
  grep -rl 'framer-motion\|react-spring\|@react-spring' "$DIR" 2>/dev/null | head -5 || echo "  None found"

  echo ""
  echo "Patterns:"
  # Find transition/animation values
  grep -rho 'duration-[0-9]*\|transition-[a-z]*\|animate-[a-z]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -5 || echo "  None found"

  # Find spring/easing configs
  grep -rho 'stiffness:\s*[0-9]*\|damping:\s*[0-9]*\|duration:\s*[0-9.]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -5 || true
}

# CSS Variables - find custom properties
find_css_vars() {
  grep -rho 'var(--[a-z-]*)' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -10 || echo "  None found"
}

if [[ "$JSON_OUTPUT" == "true" ]]; then
  # JSON output mode
  echo "{"
  echo "  \"colors\": ["
  find_colors | awk '{print "    {\"count\": " $1 ", \"class\": \"" $2 "\"},"}' | sed '$ s/,$//'
  echo "  ],"
  echo "  \"typography\": ["
  find_typography | awk '{print "    {\"count\": " $1 ", \"class\": \"" $2 "\"},"}' | sed '$ s/,$//'
  echo "  ],"
  echo "  \"spacing\": ["
  find_spacing | awk '{print "    {\"count\": " $1 ", \"class\": \"" $2 "\"},"}' | sed '$ s/,$//'
  echo "  ]"
  echo "}"
else
  # Human-readable output
  echo "=== Design Pattern Analysis ==="
  echo "Directory: $DIR"
  echo ""

  echo "--- Colors ---"
  find_colors || echo "  No Tailwind colors found"
  echo ""

  echo "--- Typography ---"
  find_typography || echo "  No typography classes found"
  echo ""

  echo "--- Spacing ---"
  find_spacing || echo "  No spacing classes found"
  echo ""

  echo "--- Motion ---"
  find_motion
  echo ""

  echo "--- CSS Variables ---"
  find_css_vars
  echo ""

  echo "=== Analysis Complete ==="
fi
