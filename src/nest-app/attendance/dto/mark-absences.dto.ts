import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class MarkAbsencesDto {
  @IsOptional()
  @IsISO8601({ strict: true })
  timestamp?: string;

  @IsOptional()
  @IsString()
  room?: string;
}
