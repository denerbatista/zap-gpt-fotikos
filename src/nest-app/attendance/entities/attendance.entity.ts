import { GuardianChannel } from '../../students/entities/student.entity';

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  timestamp: string;
  status: AttendanceStatus;
  notifiedChannels: GuardianChannel[];
  reason?: string;
  minutesLate?: number;
  student: {
    id: string;
    name: string;
    grade: string;
    room: string;
  };
}

export interface AttendanceReport {
  date: string;
  totals: Record<AttendanceStatus, number> & { overall: number };
  delays: {
    studentId: string;
    studentName: string;
    minutesLate: number;
  }[];
}
