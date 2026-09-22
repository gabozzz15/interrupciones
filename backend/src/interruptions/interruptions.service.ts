import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SimulationService } from '../simulation/simulation.service';
import { TriggerInterruptionDto } from './dto/trigger-interruption.dto';

@Injectable()
export class InterruptionsService {
  constructor(private readonly simulationService: SimulationService) {}

  trigger(dto: TriggerInterruptionDto): object {
    switch (dto.type) {
      case 'TIMER':
        return this.simulationService.applyTimerInterrupt(dto.pid);
      case 'IO_COMPLETED':
        return this.simulationService.applyIoInterrupt(
          dto.pid,
          dto.ioDevice ?? 'DISK',
        );
      case 'HARDWARE':
        return this.simulationService.applyHardwareInterrupt(
          dto.pid,
          dto.ioDevice ?? 'KEYBOARD',
        );
      case 'SOFTWARE':
        return { message: 'Software interrupt received', pid: dto.pid };
      default:
        return { error: 'Unknown interruption type' };
    }
  }

  getLog() {
    return { log: this.simulationService.getInterruptionLog() };
  }

  getVectorTable() {
    return this.simulationService.getVectorTable();
  }

  @OnEvent('interruption.timer')
  handleTimerEvent(payload: { pid: number; tick: number }) {
    this.simulationService.applyTimerInterrupt(payload.pid);
  }
}
