import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StudentsService } from '../students/students.service';
import { AttendanceRecord, AttendanceReport } from './entities/attendance.entity';
import { CheckInDto } from './dto/check-in.dto';
import { MarkAbsencesDto } from './dto/mark-absences.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AttendanceService {
  private readonly records = new Map<string, AttendanceRecord[]>();

  constructor(
    private readonly studentsService: StudentsService,
    private readonly notificationsService: NotificationsService
  ) {}

  checkIn({ studentId, timestamp }: CheckInDto): AttendanceRecord {
    const student = this.studentsService.findOne(studentId);
    const checkInTime = timestamp ? new Date(timestamp) : new Date();
    const dateKey = this.getDateKey(checkInTime);
    const minutesLate = this.getMinutesLate(student.classStartTime, checkInTime);
    const status = minutesLate > student.gracePeriodMinutes ? 'LATE' : 'ON_TIME';

    const record: AttendanceRecord = {
      id: randomUUID(),
      studentId: student.id,
      timestamp: checkInTime.toISOString(),
      status,
      notifiedChannels: [],
      minutesLate: minutesLate > 0 ? minutesLate : undefined,
    };

    if (status === 'LATE') {
      const notification = this.notificationsService.notifyDelay({
        student,
        minutesLate,
        occurredAt: record.timestamp,
      });
      record.notifiedChannels = notification.channels;
    }

    this.persistRecord(dateKey, record);
    return record;
  }

  markAbsences({ timestamp, room }: MarkAbsencesDto) {
    const now = timestamp ? new Date(timestamp) : new Date();
    const dateKey = this.getDateKey(now);
    const todaysRecords = this.getRecords(dateKey);
    const presentStudents = new Set(todaysRecords.map((record) => record.studentId));

    const candidates = this.studentsService
      .findAll()
      .filter((student) => (room ? student.room === room : true));

    const created: AttendanceRecord[] = [];

    candidates
      .filter((student) => !presentStudents.has(student.id))
      .forEach((student) => {
        const record: AttendanceRecord = {
          id: randomUUID(),
          studentId: student.id,
          timestamp: now.toISOString(),
          status: 'ABSENT',
          notifiedChannels: [],
          reason: 'Ausência confirmada após fechamento da chamada',
        };
        const notification = this.notificationsService.notifyAbsence({
          student,
          occurredAt: record.timestamp,
        });
        record.notifiedChannels = notification.channels;
        created.push(record);
        this.persistRecord(dateKey, record);
      });

    return created;
  }

  getDailyReport(date?: string): AttendanceReport {
    const target = date ? new Date(date) : new Date();
    const dateKey = this.getDateKey(target);
    const records = this.getRecords(dateKey);
    const totals = {
      ON_TIME: 0,
      LATE: 0,
      ABSENT: 0,
      overall: records.length,
    } as AttendanceReport['totals'];

    records.forEach((record) => {
      totals[record.status] += 1;
    });

    const delays = records
      .filter((record) => record.status === 'LATE' && record.minutesLate)
      .map((record) => {
        const student = this.studentsService.findOne(record.studentId);
        return {
          studentId: student.id,
          studentName: student.name,
          minutesLate: record.minutesLate ?? 0,
        };
      });

    return {
      date: dateKey,
      totals,
      delays,
    };
  }

  getFeed(date?: string): AttendanceRecord[] {
    const target = date ? new Date(date) : new Date();
    const dateKey = this.getDateKey(target);
    return this.getRecords(dateKey);
  }

  private getRecords(dateKey: string) {
    if (!this.records.has(dateKey)) {
      this.records.set(dateKey, []);
    }
    return this.records.get(dateKey)!;
  }

  private persistRecord(dateKey: string, record: AttendanceRecord) {
    const records = this.getRecords(dateKey);
    const alreadyExists = records.some((existing) => existing.id === record.id);
    if (!alreadyExists) {
      records.push(record);
    }
  }

  private getDateKey(date: Date) {
    return date.toISOString().split('T')[0];
  }

  private getMinutesLate(classStartTime: string, checkInTime: Date) {
    const [hours, minutes] = classStartTime.split(':').map(Number);
    const scheduled = new Date(checkInTime);
    scheduled.setHours(hours, minutes, 0, 0);
    return Math.floor((checkInTime.getTime() - scheduled.getTime()) / 60000);
  }
}
