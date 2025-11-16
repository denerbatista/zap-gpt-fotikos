import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @IsString()
  studentId!: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  timestamp?: string;
}
