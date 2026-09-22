import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { StartSimulationDto } from './dto/start-simulation.dto';

@Controller('simulation')
export class SimulationController {
  constructor(
    private readonly simulationService: SimulationService,
  ) {}

  @Post('start')
  start(@Body() dto: StartSimulationDto) {
    return this.simulationService.startSimulation(dto);
  }

  @Get('state')
  getState() {
    return this.simulationService.getSnapshot();
  }

  @Post('process')
  addProcess(@Body() dto: CreateProcessDto) {
    return this.simulationService.addProcess(dto);
  }

  @Post('reset')
  reset() {
    return this.simulationService.resetSimulation();
  }

  @Post('stop')
  stop() {
    this.simulationService.stopSimulation();
    return { message: 'Simulation stopped' };
  }

  @Post('block-current')
  blockCurrent() {
    return this.simulationService.blockCurrentProcess();
  }

  @Get('gantt')
  getGantt() {
    return { gantt: this.simulationService.getGantt() };
  }

  @Get('vector-table')
  getVectorTable() {
    return this.simulationService.getVectorTable();
  }
}
