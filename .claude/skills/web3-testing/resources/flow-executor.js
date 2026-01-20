/**
 * Flow Executor Module
 *
 * Executes flow steps in browser context with state management.
 * Called by agent-browser with evaluateOnNewDocument.
 *
 * Template placeholders:
 * - __SIGIL_FLOW_STEPS_PLACEHOLDER__ - Array of step definitions
 * - __SIGIL_INITIAL_STATE_PLACEHOLDER__ - Initial state object
 * - __SIGIL_FORK_RPC_URL_PLACEHOLDER__ - Fork RPC URL (null for mock)
 */
(function() {
  'use strict';

  // Load the main injection script first (must be already injected)
  if (!window.__SIGIL_MOCK_STORE__) {
    console.error('[Sigil Flow] Mock store not found. Injection script must be loaded first.');
    return;
  }

  const store = window.__SIGIL_MOCK_STORE__;
  const FLOW_STEPS = __SIGIL_FLOW_STEPS_PLACEHOLDER__;

  // Flow execution state
  const flowState = {
    currentStep: 0,
    results: [],
    startTime: Date.now(),
    screenshots: [],
    errors: []
  };

  // Expose for external control
  window.__SIGIL_FLOW__ = {
    get state() { return flowState; },
    get steps() { return FLOW_STEPS; },

    // Execute next step
    async next() {
      if (flowState.currentStep >= FLOW_STEPS.length) {
        return { done: true, results: flowState.results };
      }

      const step = FLOW_STEPS[flowState.currentStep];
      const stepStart = Date.now();

      try {
        const result = await executeStep(step);
        flowState.results.push({
          step: flowState.currentStep,
          action: step.action,
          success: true,
          duration: Date.now() - stepStart,
          ...result
        });
      } catch (error) {
        flowState.results.push({
          step: flowState.currentStep,
          action: step.action,
          success: false,
          duration: Date.now() - stepStart,
          error: error.message
        });
        flowState.errors.push({
          step: flowState.currentStep,
          error
        });
      }

      flowState.currentStep++;
      return {
        done: flowState.currentStep >= FLOW_STEPS.length,
        stepResult: flowState.results[flowState.results.length - 1]
      };
    },

    // Execute all remaining steps
    async runAll() {
      while (flowState.currentStep < FLOW_STEPS.length) {
        const { done, stepResult } = await this.next();
        if (stepResult && !stepResult.success) {
          console.error('[Sigil Flow] Step failed:', stepResult);
        }
      }
      return this.getReport();
    },

    // Get execution report
    getReport() {
      return {
        totalSteps: FLOW_STEPS.length,
        completed: flowState.currentStep,
        passed: flowState.results.filter(r => r.success).length,
        failed: flowState.results.filter(r => !r.success).length,
        duration: Date.now() - flowState.startTime,
        results: flowState.results,
        errors: flowState.errors,
        screenshots: flowState.screenshots
      };
    },

    // Reset flow
    reset() {
      flowState.currentStep = 0;
      flowState.results = [];
      flowState.startTime = Date.now();
      flowState.screenshots = [];
      flowState.errors = [];
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Step Executors
  // ═══════════════════════════════════════════════════════════════════════════

  async function executeStep(step) {
    const { action } = step;

    switch (action) {
      case 'inject':
        return executeInject(step);

      case 'update':
        return executeUpdate(step);

      case 'click':
        return executeClick(step);

      case 'fill':
        return executeFill(step);

      case 'navigate':
        return executeNavigate(step);

      case 'wait':
        return executeWait(step);

      case 'screenshot':
        return executeScreenshot(step);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  function executeInject(step) {
    const { state, preset } = step;

    if (preset) {
      // Presets are resolved at template generation time
      // This is a fallback for runtime preset loading
      console.log('[Sigil Flow] Inject from preset:', preset);
    }

    if (state) {
      store.update(state);
    }

    return {
      state: store.state
    };
  }

  function executeUpdate(step) {
    const { state } = step;

    if (!state) {
      throw new Error('Update step requires state object');
    }

    store.update(state);

    return {
      updated: Object.keys(state),
      newState: store.state
    };
  }

  async function executeClick(step) {
    const { selector } = step;

    if (!selector) {
      throw new Error('Click step requires selector');
    }

    // Support multiple selector options (first match wins)
    const selectors = selector.split(', ');
    let element = null;

    for (const sel of selectors) {
      element = document.querySelector(sel.trim());
      if (element) break;
    }

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Simulate realistic click
    element.focus();
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Wait for any immediate re-renders
    await sleep(100);

    return {
      clicked: selector,
      tagName: element.tagName,
      textContent: element.textContent?.slice(0, 50)
    };
  }

  async function executeFill(step) {
    const { selector, value } = step;

    if (!selector || value === undefined) {
      throw new Error('Fill step requires selector and value');
    }

    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Clear and fill
    element.focus();
    element.value = '';

    // Simulate typing
    for (const char of String(value)) {
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(20);
    }

    element.dispatchEvent(new Event('change', { bubbles: true }));

    return {
      filled: selector,
      value
    };
  }

  function executeNavigate(step) {
    const { path } = step;

    if (!path) {
      throw new Error('Navigate step requires path');
    }

    // Build full URL from current origin
    const url = new URL(path, window.location.origin);
    window.location.href = url.href;

    return {
      navigated: path,
      fullUrl: url.href
    };
  }

  async function executeWait(step) {
    const { duration, selector } = step;

    if (duration) {
      await sleep(duration);
      return { waited: duration };
    }

    if (selector) {
      const maxWait = 10000; // 10 second timeout
      const interval = 100;
      let waited = 0;

      while (waited < maxWait) {
        if (document.querySelector(selector)) {
          return { waitedFor: selector, duration: waited };
        }
        await sleep(interval);
        waited += interval;
      }

      throw new Error(`Timeout waiting for: ${selector}`);
    }

    throw new Error('Wait step requires duration or selector');
  }

  function executeScreenshot(step) {
    const { name } = step;

    // Screenshots are actually captured by the outer agent-browser
    // We just record the intention here
    flowState.screenshots.push({
      name: name || `step-${flowState.currentStep}`,
      timestamp: Date.now(),
      url: window.location.href,
      state: { ...store.state }
    });

    return {
      screenshotRequested: name,
      // Signal to agent-browser to capture
      _capture: true
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Utilities
  // ═══════════════════════════════════════════════════════════════════════════

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Log initialization
  console.log('[Sigil Flow] Executor loaded', {
    steps: FLOW_STEPS.length,
    storeAvailable: !!store
  });
})();
