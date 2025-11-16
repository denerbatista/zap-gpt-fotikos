import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { MarkAbsencesDto } from './dto/mark-absences.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(dto);
  }

  @Post('mark-absences')
  markAbsences(@Body() dto: MarkAbsencesDto) {
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
