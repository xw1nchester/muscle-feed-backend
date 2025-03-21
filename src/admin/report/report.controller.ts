import { Response } from 'express';

import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { DateValidationPipe } from '@validators';

import { ReportService } from './report.service';

@UseGuards(RoleGuard)
@Role(RoleEnum.MODERATOR)
// @Public()
@Controller('admin/report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}
    @Get('route-list')
    async getRouteList(
        @Res() res: Response,
        @Query('start_date', DateValidationPipe) startDate: Date,
        @Query('end_date', DateValidationPipe) endDate: Date
    ) {
        return await this.reportService.getRouteList(res, startDate, endDate);
    }

    @Get('insert')
    async getInserts(@Query('date', DateValidationPipe) date: Date) {
        return await this.reportService.getInserts(date);
    }

    @Get('dish')
    async getDishReport(
        @Res() res: Response,
        @Query('start_date', DateValidationPipe) startDate: Date,
        @Query('end_date', DateValidationPipe) endDate: Date
    ) {
        return await this.reportService.getDishReport(res, startDate, endDate);
    }
}
