import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [StudentsModule, NotificationsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
