import { ensureObject, ensureString } from '../../utils/validation';

export interface FaceCheckInDto {
  imageBase64: string;
  timestamp?: string;
}

export function parseFaceCheckInDto(payload: unknown): FaceCheckInDto {
  const data = ensureObject(payload, 'check-in facial');
  const imageBase64 = ensureString(data.imageBase64, 'imageBase64');
  const dto: FaceCheckInDto = {
    imageBase64,
  };

  if (data.timestamp) {
    dto.timestamp = ensureString(data.timestamp, 'timestamp');
  }

  return dto;
}
