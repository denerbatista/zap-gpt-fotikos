import { BadRequestException } from '../../framework';
import { GuardianChannel, GuardianContact } from '../entities/student.entity';
import {
  ensureArray,
  ensureObject,
  ensurePositiveInt,
  ensureString,
  ensureTimeString,
} from '../../utils/validation';

export interface CreateStudentDto {
  name: string;
  grade: string;
  room: string;
  classStartTime: string;
  gracePeriodMinutes: number;
  guardians: GuardianContact[];
  tags?: string[];
}

export const GUARDIAN_CHANNELS: readonly GuardianChannel[] = ['push', 'whatsapp', 'sms', 'email'];

export function parseCreateStudentDto(payload: unknown): CreateStudentDto {
  const data = ensureObject(payload, 'criação de estudante');
  const name = ensureString(data.name, 'name');
  const grade = ensureString(data.grade, 'grade');
  const room = ensureString(data.room, 'room');
  const classStartTime = ensureTimeString(ensureString(data.classStartTime, 'classStartTime'), 'classStartTime');
  const gracePeriodMinutes = ensurePositiveInt(data.gracePeriodMinutes, 'gracePeriodMinutes');

  const guardiansRaw = ensureArray(data.guardians, 'guardians');
  if (guardiansRaw.length === 0) {
    throw new BadRequestException('Informe ao menos um responsável em guardians.');
  }
  const guardians: GuardianContact[] = guardiansRaw.map((guardian, index) => {
    const entity = ensureObject(guardian, `guardian[${index}]`);
    const channelValue = ensureString(entity.channel, `guardian[${index}].channel`) as GuardianChannel;
    if (!GUARDIAN_CHANNELS.includes(channelValue)) {
      throw new BadRequestException(
        `Canal inválido em guardian[${index}].channel. Valores aceitos: ${GUARDIAN_CHANNELS.join(', ')}`
      );
    }
    return {
      name: ensureString(entity.name, `guardian[${index}].name`),
      channel: channelValue,
      value: ensureString(entity.value, `guardian[${index}].value`),
      preferred: entity.preferred === undefined ? undefined : Boolean(entity.preferred),
    };
  });

  const tags = data.tags ? ensureArray(data.tags, 'tags').map((tag, idx) => ensureString(tag, `tags[${idx}]`)) : undefined;

  return {
    name,
    grade,
    room,
    classStartTime,
    gracePeriodMinutes,
    guardians,
    tags,
  };
}
