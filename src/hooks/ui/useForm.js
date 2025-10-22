// src/hooks/ui/useForm.js
import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejo de formularios
 */
export const useForm = (initialValues = {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const setValuesFromObject = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  const setError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const setFieldTouched = useCallback((field, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  const handleChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setValue(field, value);
  }, [setValue]);

  const handleBlur = useCallback((field) => () => {
    setFieldTouched(field, true);
  }, [setFieldTouched]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const validateField = useCallback((field) => {
    if (!validate) return null;

    const fieldValidators = validate[field];
    if (!fieldValidators) return null;

    for (const validator of fieldValidators) {
      const error = validator(values[field], values);
      if (error) return error;
    }

    return null;
  }, [values, validate]);

  const validateForm = useCallback(() => {
    if (!validate) return { isValid: true, errors: {} };

    const newErrors = {};
    let isValid = true;

    Object.keys(validate).forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [validate, validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(values).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validar formulario
    const validation = validateForm();

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(values);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setValuesFromObject,
    setError,
    setFieldTouched,
    handleChange,
    handleBlur,
    reset,
    validateField,
    validateForm,
    handleSubmit,
    // Computed properties
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0
  };
};

export default useForm;
