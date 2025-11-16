import { BadRequestException } from '../framework/http';

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function ensureObject(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new BadRequestException(`Payload inválido para ${context}`);
  }
  return value as Record<string, unknown>;
}

export function ensureString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestException(`Campo "${field}" é obrigatório.`);
  }
  return value.trim();
}

export function ensureOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new BadRequestException(`Campo opcional "${field}" deve ser texto.`);
  }
  return value.trim();
}

export function ensureNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new BadRequestException(`Campo "${field}" deve ser numérico.`);
  }
  return value;
}

export function ensurePositiveInt(value: unknown, field: string): number {
  const parsed = ensureNumber(value, field);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new BadRequestException(`Campo "${field}" deve ser um número inteiro positivo.`);
  }
  return parsed;
}

export function ensureArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`Campo "${field}" deve ser uma lista.`);
  }
  return value;
}

export function ensureEnum<T extends readonly string[]>(value: unknown, field: string, allowed: T): T[number] {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new BadRequestException(
      `Campo "${field}" deve ser um dos valores: ${allowed.join(', ')}.`
    );
  }
  return value as T[number];
}

export function ensureTimeString(value: string, field: string): string {
  if (!TIME_REGEX.test(value)) {
    throw new BadRequestException(`Campo "${field}" deve estar no formato HH:mm.`);
  }
  return value;
}

export function ensureISODate(value: string, field: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new BadRequestException(`Campo "${field}" deve estar no formato ISO 8601.`);
  }
  return new Date(parsed).toISOString();
}

export function ensureOptionalISODate(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new BadRequestException(`Campo opcional "${field}" deve ser uma data ISO.`);
  }
  return ensureISODate(value, field);
}
