import { Student } from './entities/student.entity';

export const seedStudents: Student[] = [
  {
    id: 'stu-001',
    name: 'Ana Paula',
    grade: '3º ano',
    room: '3A',
    classStartTime: '07:30',
    gracePeriodMinutes: 5,
    guardians: [
      {
        name: 'Carla',
        channel: 'whatsapp',
        value: '+55 27 99999-1111',
        preferred: true,
      },
      { name: 'Carla', channel: 'email', value: 'carla@example.com' },
    ],
    tags: ['piloto', 'manhã'],
  },
  {
    id: 'stu-002',
    name: 'Bruno Nascimento',
    grade: '5º ano',
    room: '5B',
    classStartTime: '13:00',
    gracePeriodMinutes: 3,
    guardians: [
      {
        name: 'Marcelo',
        channel: 'push',
        value: 'expo-push-token-xyz',
        preferred: true,
      },
      { name: 'Marcelo', channel: 'sms', value: '+55 27 98888-4444' },
    ],
    tags: ['piloto', 'tarde'],
  },
];
