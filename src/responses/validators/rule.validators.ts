import { BadRequestException } from '@nestjs/common';

type RuleValidator = (
  value: any,
  ruleValue: string | null,
  errorMessage: string,
  fieldLabel: string,
) => void;

export const ruleValidators: Record<string, RuleValidator> = {

  MIN_LENGTH: (value, ruleValue, errorMessage, fieldLabel) => {
    const min     = Number(ruleValue);
    const current = typeof value === 'string' ? value.length : 0;
    if (current < min) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" tiene ${current} caracteres, mínimo requerido: ${min}`,
      );
    }
  },

  MAX_LENGTH: (value, ruleValue, errorMessage, fieldLabel) => {
    const max     = Number(ruleValue);
    const current = typeof value === 'string' ? value.length : 0;
    if (current > max) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" tiene ${current} caracteres, máximo permitido: ${max}`,
      );
    }
  },

  PATTERN: (value, ruleValue, errorMessage, fieldLabel) => {
    if (typeof value === 'string' && ruleValue) {
      if (!new RegExp(ruleValue).test(value)) {
        throw new BadRequestException(
          `${errorMessage} — "${fieldLabel}" recibió el valor "${value}" ` +
          `que no cumple el formato requerido`,
        );
      }
    }
  },

  MIN_VALUE: (value, ruleValue, errorMessage, fieldLabel) => {
    const min     = Number(ruleValue);
    const current = Number(value);
    if (current < min) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" recibió ${current}, mínimo permitido: ${min}`,
      );
    }
  },

  MAX_VALUE: (value, ruleValue, errorMessage, fieldLabel) => {
    const max     = Number(ruleValue);
    const current = Number(value);
    if (current > max) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" recibió ${current}, máximo permitido: ${max}`,
      );
    }
  },

  IS_INTEGER: (value, _, errorMessage, fieldLabel) => {
    if (!Number.isInteger(Number(value))) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" recibió "${value}" que no es un número entero`,
      );
    }
  },

  MIN_SELECTIONS: (value, ruleValue, errorMessage, fieldLabel) => {
    const min     = Number(ruleValue);
    const current = Array.isArray(value) ? value.length : 0;
    if (current < min) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" tiene ${current} selecciones, mínimo requerido: ${min}`,
      );
    }
  },

  MAX_SELECTIONS: (value, ruleValue, errorMessage, fieldLabel) => {
    const max     = Number(ruleValue);
    const current = Array.isArray(value) ? value.length : 0;
    if (current > max) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" tiene ${current} selecciones, máximo permitido: ${max}`,
      );
    }
  },

  FUTURE_DATE_ONLY: (value, _, errorMessage, fieldLabel) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `"${fieldLabel}" contiene una fecha inválida: "${value}"`,
      );
    }
    if (date <= new Date()) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" recibió "${value}" ` +
        `que es una fecha pasada o actual`,
      );
    }
  },

  PAST_DATE_ONLY: (value, _, errorMessage, fieldLabel) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `"${fieldLabel}" contiene una fecha inválida: "${value}"`,
      );
    }
    if (date >= new Date()) {
      throw new BadRequestException(
        `${errorMessage} — "${fieldLabel}" recibió "${value}" ` +
        `que es una fecha futura o actual`,
      );
    }
  },

  ALLOWED_EXTENSIONS: (value, ruleValue, errorMessage, fieldLabel) => {
    const allowed = (ruleValue ?? '').split(',').map((e) => e.trim().toLowerCase());
    const files   = Array.isArray(value) ? value : [value];

    for (const file of files) {
      const ext = (file?.fileName ?? '').split('.').pop()?.toLowerCase();
      if (!allowed.includes(ext)) {
        throw new BadRequestException(
          `${errorMessage} — "${fieldLabel}": el archivo "${file?.fileName}" ` +
          `tiene extensión ".${ext}" que no está permitida. ` +
          `Extensiones permitidas: ${allowed.map((e) => `.${e}`).join(', ')}`,
        );
      }
    }
  },

  MAX_FILE_SIZE_MB: (value, ruleValue, errorMessage, fieldLabel) => {
    const maxMb = Number(ruleValue);
    const files = Array.isArray(value) ? value : [value];

    for (const file of files) {
      const sizeMb = (file?.fileSizeBytes ?? 0) / (1024 * 1024);
      if (sizeMb > maxMb) {
        throw new BadRequestException(
          `${errorMessage} — "${fieldLabel}": el archivo "${file?.fileName}" ` +
          `pesa ${sizeMb.toFixed(2)} MB, máximo permitido: ${maxMb} MB`,
        );
      }
    }
  },
};