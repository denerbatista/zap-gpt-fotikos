import { Body, Controller, Get, Param, Patch, Post } from '../framework';
import { parseCreateStudentDto } from './dto/create-student.dto';
import { parseUpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  static inject = [StudentsService];
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  create(@Body() payload: unknown) {
    const dto = parseCreateStudentDto(payload);
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: unknown) {
    const dto = parseUpdateStudentDto(payload);
    return this.studentsService.update(id, dto);
  }
}
