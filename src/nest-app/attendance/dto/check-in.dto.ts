import { ensureObject, ensureOptionalISODate, ensureString } from '../../utils/validation';
import { CheckInDto } from '../types';

export function parseCheckInDto(payload: unknown): CheckInDto {
  const data = ensureObject(payload, 'check-in');
  const studentId = ensureString(data.studentId, 'studentId');
  const timestamp = ensureOptionalISODate(data.timestamp, 'timestamp');
  return {
    studentId,
    timestamp,
  };
}
