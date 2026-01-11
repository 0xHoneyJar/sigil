/**
 * @sigil-recipe decisive/ConfirmFlow
 * @physics spring(150, 14), timing(600ms between steps), deliberate
 * @zone checkout, transaction, destructive
 * @sync server_authoritative
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ConfirmFlowProps {
  /** Trigger element (usually a button) */
  trigger: ReactNode;
  
  /** Title shown in confirmation dialog */
  title: string;
  
  /** Description of what will happen */
  description: string;
  
  /** Label for confirm button */
  confirmLabel?: string;
  
  /** Label for cancel button */
  cancelLabel?: string;
  
  /** Async action to execute on confirm */
  onConfirm: () => Promise<void>;
  
  /** Called when user cancels */
  onCancel?: () => void;
  
  /** Variant affects confirm button styling */
  variant?: 'default' | 'danger';
}

// ============================================================================
// Physics Constants
// ============================================================================

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 14,
};

const STEP_DELAY = 600; // ms between steps - deliberate pacing

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const dialogVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: SPRING_CONFIG,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// ============================================================================
// Component
// ============================================================================

export function ConfirmFlow({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState<'initial' | 'confirming' | 'complete'>('initial');

  const handleOpen = () => {
    setIsOpen(true);
    setStep('initial');
  };

  const handleCancel = () => {
    setIsOpen(false);
    setStep('initial');
    onCancel?.();
  };

  const handleConfirm = async () => {
    setIsPending(true);
    setStep('confirming');
    
    try {
      await onConfirm();
      setStep('complete');
      
      // Close after showing completion
      setTimeout(() => {
        setIsOpen(false);
        setStep('initial');
      }, STEP_DELAY);
    } catch (error) {
      setStep('initial');
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <div onClick={handleOpen}>
        {trigger}
      </div>

      {/* Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleCancel}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AnimatePresence mode="wait">
                {step === 'initial' && (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {description}
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {cancelLabel}
                      </button>
                      <motion.button
                        onClick={handleConfirm}
                        disabled={isPending}
                        whileTap={{ scale: 0.98 }}
                        transition={SPRING_CONFIG}
                        className={`
                          px-4 py-2 rounded-lg font-medium
                          ${variant === 'danger' 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          }
                          disabled:opacity-50
                        `}
                      >
                        {confirmLabel}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {step === 'confirming' && (
                  <motion.div
                    key="confirming"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 text-center"
                  >
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Processing...</p>
                  </motion.div>
                )}

                {step === 'complete' && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={SPRING_CONFIG}
                    className="py-8 text-center"
                  >
                    <CheckIcon />
                    <p className="mt-4 text-gray-900 font-medium">Complete</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function LoadingSpinner() {
  return (
    <motion.div
      className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function CheckIcon() {
  return (
    <motion.svg
      className="w-12 h-12 text-green-600 mx-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </motion.svg>
  );
}

export default ConfirmFlow;
