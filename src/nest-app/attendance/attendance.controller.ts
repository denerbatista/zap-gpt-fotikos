import { Body, Controller, Get, Post, Query } from '../framework';
import { AttendanceService } from './attendance.service';
import { parseCheckInDto } from './dto/check-in.dto';
import { parseMarkAbsencesDto } from './dto/mark-absences.dto';
import { parseRegisterFaceDto } from './dto/register-face.dto';
import { parseFaceCheckInDto } from './dto/face-check-in.dto';

@Controller('attendance')
export class AttendanceController {
  static inject = [AttendanceService];
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Body() payload: unknown) {
    const dto = parseCheckInDto(payload);
    return this.attendanceService.checkIn(dto);
  }

  @Post('mark-absences')
  markAbsences(@Body() payload: unknown) {
    const dto = parseMarkAbsencesDto(payload);
    return this.attendanceService.markAbsences(dto);
  }

  @Get('feed')
  getFeed(@Query('date') date?: string) {
    return this.attendanceService.getFeed(date);
  }

  @Get('reports/daily')
  getDailyReport(@Query('date') date?: string) {
    return this.attendanceService.getDailyReport(date);
  }

  @Post('face/register')
  registerFace(@Body() payload: unknown) {
    const dto = parseRegisterFaceDto(payload);
    return this.attendanceService.registerFaceTemplate(dto);
  }

  @Post('face/check-in')
  checkInWithFace(@Body() payload: unknown) {
    const dto = parseFaceCheckInDto(payload);
    return this.attendanceService.checkInWithFace(dto);
  }
}
