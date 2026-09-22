import { ProcessControlBlock } from './process.entity';

export enum InterruptionType {
  TIMER = 'TIMER',
  IO_COMPLETED = 'IO_COMPLETED',
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
}

export interface GanttEntry {
  pid: number;
  name: string;
  start: number;
  end: number;
  color: string;
}

export interface InterruptionLogEntry {
  tick: number;
  type: InterruptionType | string;
  pid: number;
  action: string;
  ioDevice?: string;
}

export interface SimulationState {
  tick: number;
  running: boolean;
  algorithm: string;
  globalQuantum: number;
  runningProcess: ProcessControlBlock | null;
  readyQueue: ProcessControlBlock[];
  blockedQueue: ProcessControlBlock[];
  terminatedQueue: ProcessControlBlock[];
  gantt: GanttEntry[];
  interruptionLog: InterruptionLogEntry[];
  metrics: {
    totalInterruptions: number;
    avgWaitingTime: number;
    avgTurnaroundTime: number;
    cpuUtilization: number;
  };
}
