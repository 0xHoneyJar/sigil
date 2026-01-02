#!/usr/bin/env bash
# Parse design rules from sigil-mark/rules.md
# Usage: parse-rules.sh [--section <name>] [--json]
# Sections: colors, typography, spacing, motion, components
set -e

RULES_FILE="sigil-mark/rules.md"
SECTION=""
JSON_OUTPUT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --section)
      SECTION="$2"
      shift 2
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

if [[ ! -f "$RULES_FILE" ]]; then
  echo "ERROR: Rules file not found at $RULES_FILE"
  echo "Run /codify to create design rules."
  exit 1
fi

# Extract a section from the rules file
extract_section() {
  local section_name="$1"
  local in_section=false
  local found=false

  while IFS= read -r line; do
    # Check for section header (## Section)
    if [[ "$line" =~ ^##[[:space:]]+(.*) ]]; then
      section_header="${BASH_REMATCH[1]}"
      # Normalize to lowercase for comparison
      section_lower=$(echo "$section_header" | tr '[:upper:]' '[:lower:]')
      target_lower=$(echo "$section_name" | tr '[:upper:]' '[:lower:]')

      if [[ "$section_lower" == "$target_lower" ]]; then
        in_section=true
        found=true
        continue
      elif [[ "$in_section" == "true" ]]; then
        # Hit next section, stop
        break
      fi
    fi

    if [[ "$in_section" == "true" ]]; then
      echo "$line"
    fi
  done < "$RULES_FILE"

  if [[ "$found" == "false" ]]; then
    echo "Section '$section_name' not found"
    return 1
  fi
}

# Parse table to JSON
table_to_json() {
  local first_line=true
  local headers=()
  local in_table=false

  echo "["

  while IFS= read -r line; do
    # Skip empty lines
    [[ -z "$line" ]] && continue

    # Check for table row
    if [[ "$line" =~ ^\|.*\|$ ]]; then
      # Remove leading/trailing pipes and split
      line="${line#|}"
      line="${line%|}"

      # Skip separator line (contains ---)
      if [[ "$line" =~ --- ]]; then
        continue
      fi

      IFS='|' read -ra cells <<< "$line"

      if [[ "$first_line" == "true" ]]; then
        # Header row
        for cell in "${cells[@]}"; do
          cell=$(echo "$cell" | xargs) # trim whitespace
          headers+=("$cell")
        done
        first_line=false
        in_table=true
      else
        # Data row
        [[ "$in_table" == "true" ]] || continue

        echo -n "  {"
        local i=0
        local first_field=true
        for cell in "${cells[@]}"; do
          cell=$(echo "$cell" | xargs) # trim whitespace
          header="${headers[$i]:-field$i}"
          header=$(echo "$header" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')

          [[ "$first_field" == "true" ]] || echo -n ", "
          echo -n "\"$header\": \"$cell\""
          first_field=false
          ((i++))
        done
        echo "},"
      fi
    fi
  done

  echo "]"
}

# Main logic
if [[ -n "$SECTION" ]]; then
  content=$(extract_section "$SECTION")
  if [[ "$JSON_OUTPUT" == "true" ]]; then
    echo "$content" | table_to_json | sed '$ s/,$//'
  else
    echo "$content"
  fi
else
  # No section specified, show available sections
  echo "Available sections in $RULES_FILE:"
  grep -E '^## ' "$RULES_FILE" | sed 's/## /  - /'
  echo ""
  echo "Usage: parse-rules.sh --section <name> [--json]"
fi
