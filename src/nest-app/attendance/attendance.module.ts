import { Module } from '../framework';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FaceRecognitionService } from './face-recognition.service';

@Module({
  imports: [StudentsModule, NotificationsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, FaceRecognitionService],
})
export class AttendanceModule {}
