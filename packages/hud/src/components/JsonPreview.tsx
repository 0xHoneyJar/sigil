/**
 * JSON Preview Component
 *
 * Displays JSON data with a sticky copy header.
 * Designed to fix #46 - JSON preview requires horizontal scroll,
 * copy button placement forces scrolling.
 */

import { useState, useCallback, useMemo } from 'react'
import { colors, typography, spacing, radii } from '../styles/theme'

/**
 * Props for JsonPreview component
 */
export interface JsonPreviewProps {
  /** Data to display as JSON */
  data: unknown
  /** Optional title for the preview */
  title?: string
  /** Maximum height before scrolling (default: 300) */
  maxHeight?: number
  /** Show copy button (default: true) */
  copyable?: boolean
}

/**
 * Styles for JsonPreview component
 */
const styles = {
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: radii.lg,
    border: `1px solid ${colors.borderSubtle}`,
    overflow: 'hidden',
    fontFamily: typography.fontFamily,
    fontSize: typography.sm,
  } as const,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.backgroundHover,
    borderBottom: `1px solid ${colors.borderSubtle}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 1,
  } as const,

  title: {
    color: colors.textMuted,
    fontWeight: typography.medium,
    fontSize: typography.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacingWide,
  } as const,

  copyButton: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    border: `1px solid ${colors.primaryBorder}`,
    borderRadius: radii.sm,
    padding: `${spacing.xs} ${spacing.md}`,
    cursor: 'pointer',
    fontSize: typography.xs,
    fontWeight: typography.medium,
    fontFamily: typography.fontFamily,
    transition: 'opacity 0.2s',
  } as const,

  copyButtonHover: {
    opacity: 0.8,
  } as const,

  content: {
    padding: spacing.lg,
    overflowX: 'auto' as const,
    overflowY: 'auto' as const,
  } as const,

  pre: {
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    color: colors.text,
    lineHeight: typography.lineHeightRelaxed,
    fontFamily: typography.fontFamily,
    fontSize: typography.sm,
  } as const,

  // Syntax highlighting colors
  key: {
    color: colors.info,
  } as const,

  string: {
    color: colors.success,
  } as const,

  number: {
    color: colors.warning,
  } as const,

  boolean: {
    color: colors.primary,
  } as const,

  null: {
    color: colors.textDim,
  } as const,
}

/**
 * Simple JSON syntax highlighter
 */
function highlightJson(json: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = []
  let i = 0

  // Regex patterns for JSON tokens
  const patterns = [
    { regex: /"([^"\\]|\\.)*"(?=\s*:)/g, style: styles.key, name: 'key' }, // Keys
    { regex: /"([^"\\]|\\.)*"/g, style: styles.string, name: 'string' }, // Strings
    { regex: /-?\d+\.?\d*([eE][+-]?\d+)?/g, style: styles.number, name: 'number' }, // Numbers
    { regex: /\b(true|false)\b/g, style: styles.boolean, name: 'boolean' }, // Booleans
    { regex: /\bnull\b/g, style: styles.null, name: 'null' }, // Null
  ]

  while (i < json.length) {
    let matched = false

    for (const { regex, style, name } of patterns) {
      regex.lastIndex = i
      const match = regex.exec(json)

      if (match && match.index === i) {
        // Add any preceding plain text
        if (tokens.length === 0 || typeof tokens[tokens.length - 1] !== 'string') {
          // This is fine
        }

        tokens.push(
          <span key={`${name}-${i}`} style={style}>
            {match[0]}
          </span>
        )
        i += match[0].length
        matched = true
        break
      }
    }

    if (!matched) {
      // Add plain character
      const lastToken = tokens[tokens.length - 1]
      if (typeof lastToken === 'string') {
        tokens[tokens.length - 1] = lastToken + json[i]
      } else {
        tokens.push(json[i])
      }
      i++
    }
  }

  return tokens
}

/**
 * JSON Preview component with sticky copy header
 *
 * Addresses GitHub issue #46:
 * - Uses `white-space: pre-wrap` to avoid horizontal scroll
 * - Copy button is in a sticky header, always visible
 * - Syntax highlighting for better readability
 *
 * @example
 * ```tsx
 * <JsonPreview
 *   title="Response"
 *   data={{ user: { name: "Alice", balance: 1000 } }}
 *   maxHeight={400}
 * />
 * ```
 */
export function JsonPreview({
  data,
  title,
  maxHeight = 300,
  copyable = true,
}: JsonPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const json = useMemo(() => JSON.stringify(data, null, 2), [data])

  const highlighted = useMemo(() => highlightJson(json), [json])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = json
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [json])

  const showHeader = title || copyable

  return (
    <div style={styles.container} data-sigil-hud="json-preview">
      {showHeader && (
        <div style={styles.header}>
          {title && <span style={styles.title}>{title}</span>}
          {!title && <span />}
          {copyable && (
            <button
              onClick={handleCopy}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                ...styles.copyButton,
                ...(isHovering ? styles.copyButtonHover : {}),
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <div style={{ ...styles.content, maxHeight }}>
        <pre style={styles.pre}>{highlighted}</pre>
      </div>
    </div>
  )
}
