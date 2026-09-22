import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SimulationModule } from './simulation/simulation.module';
import { InterruptionsModule } from './interruptions/interruptions.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    SimulationModule,
    InterruptionsModule,
    SchedulerModule,
    StreamModule,
  ],
})
export class AppModule {}
