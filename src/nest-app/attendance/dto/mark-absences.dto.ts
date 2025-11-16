import { ensureObject, ensureOptionalISODate, ensureOptionalString } from '../../utils/validation';
import { MarkAbsencesDto } from '../types';

export function parseMarkAbsencesDto(payload: unknown): MarkAbsencesDto {
  const data = ensureObject(payload ?? {}, 'marcação de faltas');
  const timestamp = ensureOptionalISODate(data.timestamp, 'timestamp');
  const room = ensureOptionalString(data.room, 'room');
  return {
    timestamp,
    room,
  };
}
