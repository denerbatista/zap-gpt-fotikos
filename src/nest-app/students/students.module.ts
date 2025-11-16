import { Module } from '../framework';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
