import { BadRequestException } from '../../framework';
import { GuardianContact } from '../entities/student.entity';
import {
  ensureArray,
  ensureObject,
  ensurePositiveInt,
  ensureString,
  ensureTimeString,
} from '../../utils/validation';
import { CreateStudentDto, GUARDIAN_CHANNELS } from './create-student.dto';

export type UpdateStudentDto = Partial<CreateStudentDto>;

export function parseUpdateStudentDto(payload: unknown): UpdateStudentDto {
  const data = ensureObject(payload, 'atualização de estudante');
  const dto: UpdateStudentDto = {};

  if ('name' in data) {
    dto.name = ensureString(data.name, 'name');
  }
  if ('grade' in data) {
    dto.grade = ensureString(data.grade, 'grade');
  }
  if ('room' in data) {
    dto.room = ensureString(data.room, 'room');
  }
  if ('classStartTime' in data) {
    dto.classStartTime = ensureTimeString(ensureString(data.classStartTime, 'classStartTime'), 'classStartTime');
  }
  if ('gracePeriodMinutes' in data) {
    dto.gracePeriodMinutes = ensurePositiveInt(data.gracePeriodMinutes, 'gracePeriodMinutes');
  }
  if ('guardians' in data) {
    const guardiansRaw = ensureArray(data.guardians, 'guardians');
    dto.guardians = guardiansRaw.map((guardian, index) => {
      const entity = ensureObject(guardian, `guardian[${index}]`);
      const channel = ensureString(entity.channel, `guardian[${index}].channel`) as GuardianContact['channel'];
      if (!GUARDIAN_CHANNELS.includes(channel)) {
        throw new BadRequestException(
          `Canal inválido em guardian[${index}].channel. Valores aceitos: ${GUARDIAN_CHANNELS.join(', ')}`
        );
      }
      return {
        name: ensureString(entity.name, `guardian[${index}].name`),
        channel,
        value: ensureString(entity.value, `guardian[${index}].value`),
        preferred: entity.preferred === undefined ? undefined : Boolean(entity.preferred),
      };
    });
  }
  if ('tags' in data) {
    dto.tags = ensureArray(data.tags, 'tags').map((tag, idx) => ensureString(tag, `tags[${idx}]`));
  }

  if (Object.keys(dto).length === 0) {
    throw new BadRequestException('Informe ao menos um campo para atualização.');
  }

  return dto;
}
