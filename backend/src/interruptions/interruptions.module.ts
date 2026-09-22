import { Module } from '@nestjs/common';
import { InterruptionsService } from './interruptions.service';
import { InterruptionsController } from './interruptions.controller';
import { SimulationModule } from '../simulation/simulation.module';

@Module({
  imports: [SimulationModule],
  controllers: [InterruptionsController],
  providers: [InterruptionsService],
})
export class InterruptionsModule {}
