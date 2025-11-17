import { BadRequestException } from '../../framework';
import { ensureObject, ensureString } from '../../utils/validation';

export interface RegisterFaceDto {
  studentId: string;
  imageBase64: string;
}

export function parseRegisterFaceDto(payload: unknown): RegisterFaceDto {
  const data = ensureObject(payload, 'cadastro facial');
  const studentId = ensureString(data.studentId, 'studentId');
  const imageBase64 = ensureString(data.imageBase64, 'imageBase64');

  if (!imageBase64.includes('base64,')) {
    throw new BadRequestException(
      'imageBase64 precisa conter um payload em base64 (ex.: data:image/jpeg;base64,...).'
    );
  }

  return {
    studentId,
    imageBase64,
  };
}
