export type GuardianChannel = 'push' | 'whatsapp' | 'sms' | 'email';

export interface GuardianContact {
  name: string;
  channel: GuardianChannel;
  value: string;
  preferred?: boolean;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  room: string;
  classStartTime: string; // HH:mm
  gracePeriodMinutes: number;
  guardians: GuardianContact[];
  tags?: string[];
}
