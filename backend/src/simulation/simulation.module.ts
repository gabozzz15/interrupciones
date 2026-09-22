import { Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { SimulationGateway } from './simulation.gateway';

@Module({
  controllers: [SimulationController],
  providers: [SimulationService, SimulationGateway],
  exports: [SimulationService],
})
export class SimulationModule {}
