/**
 * @sigil-workbench A/B Toggle - Hot-Swap Mode
 *
 * Enables real-time physics comparison by swapping CSS custom properties.
 * Press Space to toggle between Before (A) and After (B) physics values.
 *
 * Philosophy: "Numbers gain meaning through your fingers"
 * - See the diff in the terminal
 * - Feel the result in the browser
 * - Toggle A/B to compare
 */

export interface PhysicsValues {
  stiffness: number;
  damping: number;
  duration?: number;
  delay?: number;
}

export interface ABToggleConfig {
  before: PhysicsValues;
  after: PhysicsValues;
}

// Current toggle state
let currentState: 'A' | 'B' = 'A';
let config: ABToggleConfig | null = null;

/**
 * Initialize A/B toggle with physics values to compare
 */
export function initABToggle(before: PhysicsValues, after: PhysicsValues): void {
  config = { before, after };
  applyPhysics(before); // Start with A (before)
  setupKeyboardListener();
  dispatchToggleEvent('A');
}

/**
 * Apply physics values to CSS custom properties
 */
function applyPhysics(physics: PhysicsValues): void {
  const root = document.documentElement;

  root.style.setProperty('--sigil-stiffness', String(physics.stiffness));
  root.style.setProperty('--sigil-damping', String(physics.damping));

  if (physics.duration !== undefined) {
    root.style.setProperty('--sigil-duration', `${physics.duration}ms`);
  }

  if (physics.delay !== undefined) {
    root.style.setProperty('--sigil-delay', `${physics.delay}ms`);
  }
}

/**
 * Toggle between A and B states
 */
export function toggle(): 'A' | 'B' {
  if (!config) {
    console.warn('[sigil] A/B toggle not initialized. Call initABToggle first.');
    return currentState;
  }

  currentState = currentState === 'A' ? 'B' : 'A';
  const physics = currentState === 'A' ? config.before : config.after;
  applyPhysics(physics);
  dispatchToggleEvent(currentState);

  return currentState;
}

/**
 * Get current toggle state
 */
export function getState(): 'A' | 'B' {
  return currentState;
}

/**
 * Set up keyboard listener for Space key
 */
function setupKeyboardListener(): void {
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isInputFocused()) {
      event.preventDefault();
      toggle();
    }
  });
}

/**
 * Check if an input element is focused
 */
function isInputFocused(): boolean {
  const active = document.activeElement;
  return active instanceof HTMLInputElement ||
         active instanceof HTMLTextAreaElement ||
         active instanceof HTMLSelectElement ||
         active?.hasAttribute('contenteditable');
}

/**
 * Dispatch custom event for external listeners
 */
function dispatchToggleEvent(state: 'A' | 'B'): void {
  const event = new CustomEvent('sigil:ab-toggle', {
    detail: {
      state,
      physics: config ? (state === 'A' ? config.before : config.after) : null,
    },
  });
  document.dispatchEvent(event);
}

/**
 * Subscribe to toggle changes
 */
export function onToggle(callback: (state: 'A' | 'B', physics: PhysicsValues) => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ state: 'A' | 'B'; physics: PhysicsValues }>;
    callback(customEvent.detail.state, customEvent.detail.physics);
  };

  document.addEventListener('sigil:ab-toggle', handler);

  return () => document.removeEventListener('sigil:ab-toggle', handler);
}

/**
 * Clean up A/B toggle
 */
export function destroyABToggle(): void {
  config = null;
  currentState = 'A';

  // Remove CSS custom properties
  const root = document.documentElement;
  root.style.removeProperty('--sigil-stiffness');
  root.style.removeProperty('--sigil-damping');
  root.style.removeProperty('--sigil-duration');
  root.style.removeProperty('--sigil-delay');
}

// Export default for convenience
export default {
  init: initABToggle,
  toggle,
  getState,
  onToggle,
  destroy: destroyABToggle,
};
