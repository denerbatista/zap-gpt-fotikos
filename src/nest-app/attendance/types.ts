export interface CheckInDto {
  studentId: string;
  timestamp?: string;
}

export interface MarkAbsencesDto {
  timestamp?: string;
  room?: string;
}
