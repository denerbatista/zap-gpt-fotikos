import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { GuardianChannel } from '../entities/student.entity';

class GuardianContactDto {
  @IsString()
  @MaxLength(60)
  name!: string;

  @IsIn(['push', 'whatsapp', 'sms', 'email'])
  channel!: GuardianChannel;

  @IsString()
  @MaxLength(80)
  value!: string;

  @IsOptional()
  preferred?: boolean;
}

export class CreateStudentDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsString()
  @MaxLength(15)
  grade!: string;

  @IsString()
  @MaxLength(5)
  room!: string;

  @Matches(/^\d{2}:\d{2}$/)
  classStartTime!: string;

  @Min(0)
  gracePeriodMinutes = 5;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => GuardianContactDto)
  guardians!: GuardianContactDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
