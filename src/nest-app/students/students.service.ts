import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { seedStudents } from './students.seed';

@Injectable()
export class StudentsService {
  private readonly students = new Map<string, Student>();

  constructor() {
    seedStudents.forEach((student) => this.students.set(student.id, student));
  }

  findAll(): Student[] {
    return Array.from(this.students.values());
  }

  findOne(id: string): Student {
    const student = this.students.get(id);
    if (!student) {
      throw new NotFoundException(`Estudante ${id} não encontrado`);
    }
    return student;
  }

  create(dto: CreateStudentDto): Student {
    const id = `stu-${randomUUID()}`;
    const student: Student = { ...dto, id };
    this.students.set(id, student);
    return student;
  }

  update(id: string, dto: UpdateStudentDto): Student {
    const existing = this.findOne(id);
    const updated: Student = { ...existing, ...dto };
    this.students.set(id, updated);
    return updated;
  }

  upsertMany(students: Student[]): void {
    students.forEach((student) => this.students.set(student.id, student));
  }
}
