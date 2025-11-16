import { Body, Controller, Get, Post, Query } from '../framework';
import { AttendanceService } from './attendance.service';
import { parseCheckInDto } from './dto/check-in.dto';
import { parseMarkAbsencesDto } from './dto/mark-absences.dto';

@Controller('attendance')
export class AttendanceController {
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
}
