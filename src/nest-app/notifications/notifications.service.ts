import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Student } from '../students/entities/student.entity';

export type NotificationType = 'DELAY' | 'ABSENCE';

export interface NotificationEvent {
  id: string;
  studentId: string;
  studentName: string;
  type: NotificationType;
  channels: Student['guardians'][number]['channel'][];
  message: string;
  occurredAt: string;
  sentAt: string;
}

@Injectable()
export class NotificationsService {
  private readonly events: NotificationEvent[] = [];

  notifyDelay({
    student,
    minutesLate,
    occurredAt,
  }: {
    student: Student;
    minutesLate: number;
    occurredAt: string;
  }): NotificationEvent {
    const message = `Aluno(a) ${student.name} registrou atraso de ${minutesLate} minuto(s).`;
    return this.persistEvent({
      student,
      occurredAt,
      message,
      type: 'DELAY',
    });
  }

  notifyAbsence({
    student,
    occurredAt,
  }: {
    student: Student;
    occurredAt: string;
  }): NotificationEvent {
    const message = `Aluno(a) ${student.name} não registrou presença até o fechamento da chamada.`;
    return this.persistEvent({
      student,
      occurredAt,
      message,
      type: 'ABSENCE',
    });
  }

  listEvents() {
    return this.events;
  }

  private persistEvent({
    student,
    occurredAt,
    message,
    type,
  }: {
    student: Student;
    occurredAt: string;
    message: string;
    type: NotificationType;
  }): NotificationEvent {
    const channels = student.guardians.map((guardian) => guardian.channel);
    const event: NotificationEvent = {
      id: randomUUID(),
      studentId: student.id,
      studentName: student.name,
      type,
      channels,
      message,
      occurredAt,
      sentAt: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }
}
