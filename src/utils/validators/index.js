// src/utils/validators/index.js
// Funciones de validación reutilizables

import { VALIDATION_RULES } from '../constants';

/**
 * Valida un email
 */
export const validateEmail = (email) => {
  if (!email) return 'El email es requerido';
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) return 'Email inválido';
  return null;
};

/**
 * Valida una contraseña
 */
export const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} caracteres`;
  }
  return null;
};

/**
 * Valida un nombre
 */
export const validateName = (name) => {
  if (!name) return 'El nombre es requerido';
  if (name.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    return `El nombre no puede exceder ${VALIDATION_RULES.MAX_NAME_LENGTH} caracteres`;
  }
  if (name.trim().length === 0) return 'El nombre no puede estar vacío';
  return null;
};

/**
 * Valida un teléfono
 */
export const validatePhone = (phone) => {
  if (!phone) return null; // Opcional
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) return 'Teléfono inválido';
  return null;
};

/**
 * Valida un número requerido
 */
export const validateRequiredNumber = (value, fieldName = 'valor') => {
  if (value === null || value === undefined || value === '') {
    return `El ${fieldName} es requerido`;
  }
  const num = Number(value);
  if (isNaN(num)) return `El ${fieldName} debe ser un número válido`;
  return null;
};

/**
 * Valida que un valor esté en un rango
 */
export const validateRange = (value, min, max, fieldName = 'valor') => {
  const num = Number(value);
  if (isNaN(num)) return `El ${fieldName} debe ser un número válido`;
  if (num < min) return `El ${fieldName} debe ser al menos ${min}`;
  if (num > max) return `El ${fieldName} no puede ser mayor que ${max}`;
  return null;
};

/**
 * Valida URL
 */
export const validateUrl = (url) => {
  if (!url) return null; // Opcional
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL inválida';
  }
};

/**
 * Valida formulario completo
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];

    for (const rule of fieldRules) {
      const error = rule(value, data);
      if (error) {
        errors[field] = error;
        break; // Solo el primer error por campo
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Reglas de validación comunes para formularios
 */
export const commonValidationRules = {
  email: [validateEmail],
  password: [validatePassword],
  name: [validateName],
  phone: [validatePhone],
  required: [(value) => !value ? 'Este campo es requerido' : null],
  url: [validateUrl]
};
