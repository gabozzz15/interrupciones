import { Controller, Post, Get, Body } from '@nestjs/common';
import { InterruptionsService } from './interruptions.service';
import { TriggerInterruptionDto } from './dto/trigger-interruption.dto';

@Controller('interruptions')
export class InterruptionsController {
  constructor(private readonly interruptionsService: InterruptionsService) {}

  @Post('trigger')
  trigger(@Body() dto: TriggerInterruptionDto) {
    return this.interruptionsService.trigger(dto);
  }

  @Get('log')
  getLog() {
    return this.interruptionsService.getLog();
  }

  @Get('vector-table')
  getVectorTable() {
    return this.interruptionsService.getVectorTable();
  }
}
