/**
 * @sigil-workbench A/B Toggle - Iframe Mode
 *
 * Enables physics comparison using side-by-side iframes.
 * Use for full flow testing where hot-swap isn't sufficient.
 *
 * Philosophy: "See the diff. Feel the result."
 * - Load two versions of the same preview
 * - Toggle visibility with Space
 * - Compare complete user flows
 */

export interface IframeToggleConfig {
  urlA: string;  // Before version URL
  urlB: string;  // After version URL
  container: HTMLElement;
}

let iframeA: HTMLIFrameElement | null = null;
let iframeB: HTMLIFrameElement | null = null;
let currentState: 'A' | 'B' = 'A';
let containerEl: HTMLElement | null = null;

/**
 * Initialize iframe-based A/B comparison
 */
export function initIframeToggle(config: IframeToggleConfig): void {
  containerEl = config.container;

  // Create iframe A (visible initially)
  iframeA = createIframe(config.urlA, true);
  iframeA.dataset.sigilAb = 'A';

  // Create iframe B (hidden initially)
  iframeB = createIframe(config.urlB, false);
  iframeB.dataset.sigilAb = 'B';

  // Add to container
  containerEl.appendChild(iframeA);
  containerEl.appendChild(iframeB);

  // Set up keyboard listener
  setupKeyboardListener();

  // Dispatch initial event
  dispatchToggleEvent('A');
}

/**
 * Create styled iframe element
 */
function createIframe(url: string, visible: boolean): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    opacity: ${visible ? '1' : '0'};
    pointer-events: ${visible ? 'auto' : 'none'};
    transition: opacity 0.15s ease;
  `;
  return iframe;
}

/**
 * Toggle between A and B iframes
 */
export function toggle(): 'A' | 'B' {
  if (!iframeA || !iframeB) {
    console.warn('[sigil] Iframe toggle not initialized. Call initIframeToggle first.');
    return currentState;
  }

  currentState = currentState === 'A' ? 'B' : 'A';

  if (currentState === 'A') {
    iframeA.style.opacity = '1';
    iframeA.style.pointerEvents = 'auto';
    iframeB.style.opacity = '0';
    iframeB.style.pointerEvents = 'none';
  } else {
    iframeA.style.opacity = '0';
    iframeA.style.pointerEvents = 'none';
    iframeB.style.opacity = '1';
    iframeB.style.pointerEvents = 'auto';
  }

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
    detail: { state, mode: 'iframe' },
  });
  document.dispatchEvent(event);
}

/**
 * Subscribe to toggle changes
 */
export function onToggle(callback: (state: 'A' | 'B') => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ state: 'A' | 'B' }>;
    callback(customEvent.detail.state);
  };

  document.addEventListener('sigil:ab-toggle', handler);
  return () => document.removeEventListener('sigil:ab-toggle', handler);
}

/**
 * Reload both iframes
 */
export function reload(): void {
  if (iframeA) iframeA.contentWindow?.location.reload();
  if (iframeB) iframeB.contentWindow?.location.reload();
}

/**
 * Update iframe URLs
 */
export function updateUrls(urlA: string, urlB: string): void {
  if (iframeA) iframeA.src = urlA;
  if (iframeB) iframeB.src = urlB;
}

/**
 * Clean up iframe toggle
 */
export function destroyIframeToggle(): void {
  if (iframeA) iframeA.remove();
  if (iframeB) iframeB.remove();
  iframeA = null;
  iframeB = null;
  containerEl = null;
  currentState = 'A';
}

// Export default for convenience
export default {
  init: initIframeToggle,
  toggle,
  getState,
  onToggle,
  reload,
  updateUrls,
  destroy: destroyIframeToggle,
};
