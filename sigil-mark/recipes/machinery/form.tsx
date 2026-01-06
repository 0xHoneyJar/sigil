/**
 * @sigil-recipe machinery/Form
 * @physics none (instant validation)
 * @zone admin, settings, data-entry
 * @sync client_authoritative
 *
 * Form wrapper with instant validation feedback.
 * No animation delays - efficiency is the priority.
 *
 * Physics rationale:
 * - No springs - validation appears instantly
 * - No transitions - error states are immediate
 * - Focus on function over form
 */

import React, { useCallback, useState } from 'react';

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormProps<T> {
  /** Initial form values */
  initialValues: T;
  /** Form submission handler */
  onSubmit: (values: T) => Promise<void> | void;
  /** Validation function - returns errors or empty array */
  validate?: (values: T) => FormFieldError[];
  /** Children render function with form state */
  children: (state: FormState<T>) => React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Validate on change (vs only on submit) */
  validateOnChange?: boolean;
}

export interface FormState<T> {
  /** Current form values */
  values: T;
  /** Field-level errors */
  errors: Record<string, string>;
  /** Is form submitting */
  isSubmitting: boolean;
  /** Has form been touched */
  isDirty: boolean;
  /** Update a field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Update multiple field values */
  setValues: (values: Partial<T>) => void;
  /** Set a field error manually */
  setError: (field: string, message: string) => void;
  /** Clear all errors */
  clearErrors: () => void;
  /** Reset form to initial values */
  reset: () => void;
  /** Submit the form */
  submit: () => void;
}

/**
 * Efficient Form Wrapper
 *
 * @example
 * ```tsx
 * import { Form } from '@sigil/recipes/machinery';
 *
 * <Form
 *   initialValues={{ email: '', name: '' }}
 *   validate={(values) => {
 *     const errors = [];
 *     if (!values.email) errors.push({ field: 'email', message: 'Required' });
 *     return errors;
 *   }}
 *   onSubmit={async (values) => {
 *     await api.createUser(values);
 *   }}
 * >
 *   {({ values, errors, setValue, isSubmitting, submit }) => (
 *     <>
 *       <input
 *         value={values.email}
 *         onChange={(e) => setValue('email', e.target.value)}
 *       />
 *       {errors.email && <span className="text-red-600">{errors.email}</span>}
 *       <button onClick={submit} disabled={isSubmitting}>
 *         {isSubmitting ? 'Saving...' : 'Save'}
 *       </button>
 *     </>
 *   )}
 * </Form>
 * ```
 */
export function Form<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
  children,
  className = '',
  validateOnChange = false,
}: FormProps<T>) {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const runValidation = useCallback(
    (valuesToValidate: T): Record<string, string> => {
      if (!validate) return {};
      const fieldErrors = validate(valuesToValidate);
      const errorMap: Record<string, string> = {};
      fieldErrors.forEach(({ field, message }) => {
        errorMap[field] = message;
      });
      return errorMap;
    },
    [validate]
  );

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => {
        const next = { ...prev, [field]: value };
        if (validateOnChange) {
          setErrors(runValidation(next));
        }
        return next;
      });
      setIsDirty(true);
    },
    [validateOnChange, runValidation]
  );

  const setValuesMultiple = useCallback(
    (newValues: Partial<T>) => {
      setValuesState((prev) => {
        const next = { ...prev, ...newValues };
        if (validateOnChange) {
          setErrors(runValidation(next));
        }
        return next;
      });
      setIsDirty(true);
    },
    [validateOnChange, runValidation]
  );

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setIsDirty(false);
  }, [initialValues]);

  const submit = useCallback(async () => {
    const validationErrors = runValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, runValidation, onSubmit]);

  const handleFormSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      submit();
    },
    [submit]
  );

  const state: FormState<T> = {
    values,
    errors,
    isSubmitting,
    isDirty,
    setValue,
    setValues: setValuesMultiple,
    setError,
    clearErrors,
    reset,
    submit,
  };

  return (
    <form onSubmit={handleFormSubmit} className={className}>
      {children(state)}
    </form>
  );
}

export default Form;
