/**
 * @sigil-recipe decisive/ConfirmFlow
 * @physics spring(150, 14), 600ms between steps
 * @zone checkout, transaction, critical
 * @sync server_authoritative
 *
 * Multi-step confirmation dialog for high-stakes actions.
 * Deliberate pacing gives users time to reconsider.
 *
 * Physics rationale:
 * - stiffness: 150 — Moderate, not rushed
 * - damping: 14 — Controlled, no bounce
 * - 600ms delay — Deliberate pause between states
 *
 * States:
 * - initial: Shows action button
 * - confirming: Shows "Are you sure?" with confirm/cancel
 * - complete: Shows success state
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServerTick } from '../../hooks';

export type ConfirmFlowState = 'initial' | 'confirming' | 'complete';

export interface ConfirmFlowProps {
  /** Label for initial action button */
  actionLabel: string;
  /** Confirmation message */
  confirmMessage?: string;
  /** Label for confirm button */
  confirmLabel?: string;
  /** Label for cancel button */
  cancelLabel?: string;
  /** Success message */
  successMessage?: string;
  /** Async action to execute on confirm */
  onConfirm: () => Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Callback when flow completes */
  onComplete?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'danger';
  /** Additional class names */
  className?: string;
  /** Auto-reset to initial after completion (ms), 0 to disable */
  autoResetMs?: number;
}

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 14,
};

const STEP_DELAY_MS = 600;

const VARIANT_CLASSES = {
  primary: {
    action: 'bg-neutral-900 text-white hover:bg-neutral-800',
    confirm: 'bg-neutral-900 text-white hover:bg-neutral-800',
  },
  danger: {
    action: 'bg-red-600 text-white hover:bg-red-700',
    confirm: 'bg-red-600 text-white hover:bg-red-700',
  },
};

/**
 * Multi-step Confirmation Flow
 *
 * @example
 * ```tsx
 * import { ConfirmFlow } from '@sigil/recipes/decisive';
 *
 * <ConfirmFlow
 *   actionLabel="Delete Account"
 *   confirmMessage="This action cannot be undone. Are you sure?"
 *   onConfirm={handleDeleteAccount}
 *   variant="danger"
 * />
 * ```
 */
export function ConfirmFlow({
  actionLabel,
  confirmMessage = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  successMessage = 'Done',
  onConfirm,
  onCancel,
  onComplete,
  variant = 'primary',
  className = '',
  autoResetMs = 2000,
}: ConfirmFlowProps) {
  const [state, setState] = useState<ConfirmFlowState>('initial');

  const { execute, isPending, error } = useServerTick(async () => {
    await onConfirm();
  });

  const handleInitialClick = useCallback(() => {
    setState('confirming');
  }, []);

  const handleCancel = useCallback(() => {
    setState('initial');
    onCancel?.();
  }, [onCancel]);

  const handleConfirm = useCallback(async () => {
    await execute();

    // Wait for deliberate pause before showing complete
    await new Promise(resolve => setTimeout(resolve, STEP_DELAY_MS));

    setState('complete');
    onComplete?.();

    // Auto-reset if configured
    if (autoResetMs > 0) {
      setTimeout(() => {
        setState('initial');
      }, autoResetMs);
    }
  }, [execute, onComplete, autoResetMs]);

  const variants = VARIANT_CLASSES[variant];

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {state === 'initial' && (
          <motion.button
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SPRING_CONFIG}
            onClick={handleInitialClick}
            className={`
              px-4 py-2 font-medium rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${variants.action}
            `.trim().replace(/\s+/g, ' ')}
          >
            {actionLabel}
          </motion.button>
        )}

        {state === 'confirming' && (
          <motion.div
            key="confirming"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SPRING_CONFIG}
            className="flex flex-col gap-3"
          >
            <p className="text-sm text-neutral-600">{confirmMessage}</p>
            {error && (
              <p className="text-sm text-red-600">{error.message}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg
                  disabled:opacity-50
                  ${variants.confirm}
                `.trim().replace(/\s+/g, ' ')}
              >
                {isPending ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SPRING_CONFIG}
            className="flex items-center gap-2 text-green-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConfirmFlow;
