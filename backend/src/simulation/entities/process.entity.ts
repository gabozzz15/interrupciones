export enum ProcessState {
  NEW = 'NEW',
  READY = 'READY',
  RUNNING = 'RUNNING',
  BLOCKED = 'BLOCKED',
  INTERRUPTED = 'INTERRUPTED',
  TERMINATED = 'TERMINATED',
}

export interface Registers {
  PC: string;
  SP: string;
  AX: number;
  BX: number;
  CX?: number;
  DX?: number;
}

export interface ProcessControlBlock {
  pid: number;
  name: string;
  state: ProcessState;
  burstTime: number;
  remainingBurst: number;
  arrivalTime: number;
  priority: number;
  quantum: number;
  registers: Registers;
  waitingTime: number;
  turnaroundTime: number;
  color: string;
}
