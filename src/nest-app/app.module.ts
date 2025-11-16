import { Module } from './framework';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [StudentsModule, NotificationsModule, AttendanceModule],
})
export class AppModule {}
