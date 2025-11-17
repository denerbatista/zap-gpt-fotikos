import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
});

export interface AttendanceRecord {
  id: string;
  studentId: string;
  timestamp: string;
  status: 'ON_TIME' | 'LATE' | 'ABSENT';
  minutesLate?: number;
  notifiedChannels: string[];
  reason?: string;
  student: {
    id: string;
    name: string;
    grade: string;
    room: string;
  };
}

export const fetchAttendanceFeed = async (): Promise<AttendanceRecord[]> => {
  const response = await api.get<AttendanceRecord[]>('/attendance/feed');
  return response.data;
};

export const triggerCheckIn = async (studentId: string) => {
  const response = await api.post<AttendanceRecord>('/attendance/check-in', {
    studentId,
  });
  return response.data;
};

export const markAbsences = async () => {
  const response = await api.post<AttendanceRecord[]>('/attendance/mark-absences', {});
  return response.data;
};

export interface FaceEnrollmentResponse {
  student: AttendanceRecord['student'];
  registeredAt: string;
  templateVersion: string;
  vectorSize: number;
}

export const registerFaceTemplate = async (studentId: string, imageBase64: string) => {
  const response = await api.post<FaceEnrollmentResponse>('/attendance/face/register', {
    studentId,
    imageBase64,
  });
  return response.data;
};

export const checkInByFace = async (imageBase64: string) => {
  const response = await api.post<AttendanceRecord>('/attendance/face/check-in', {
    imageBase64,
  });
  return response.data;
};
