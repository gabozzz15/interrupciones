import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProcessControlBlock } from './entities/process.entity';
import { GanttEntry, InterruptionLogEntry, SimulationState } from './entities/simulation-state.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { StartSimulationDto } from './dto/start-simulation.dto';
export declare class SimulationService {
    private eventEmitter;
    private state;
    private tickInterval;
    private quantumCounter;
    constructor(eventEmitter: EventEmitter2);
    private getInitialState;
    private makeRegisters;
    addProcess(dto: CreateProcessDto): ProcessControlBlock;
    startSimulation(dto: StartSimulationDto): SimulationState;
    private scheduleNextProcess;
    private runTick;
    private processTick;
    applyTimerInterrupt(pid: number): object;
    applyIoInterrupt(pid: number, ioDevice: string): object;
    applyHardwareInterrupt(pid: number, ioDevice: string): object;
    blockCurrentProcess(): object;
    private updateMetrics;
    stopSimulation(): void;
    resetSimulation(): SimulationState;
    getSnapshot(): SimulationState;
    getGantt(): GanttEntry[];
    getInterruptionLog(): InterruptionLogEntry[];
    getVectorTable(): {
        vectorTable: {
            vector: number;
            type: string;
            isr: string;
            address: string;
        }[];
    };
}
