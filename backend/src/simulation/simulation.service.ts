import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ProcessControlBlock,
  ProcessState,
  Registers,
} from './entities/process.entity';
import {
  GanttEntry,
  InterruptionLogEntry,
  InterruptionType,
  SimulationState,
} from './entities/simulation-state.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { StartSimulationDto } from './dto/start-simulation.dto';

const PROCESS_COLORS = [
  '#6C63FF',
  '#FF6584',
  '#43E97B',
  '#F7971E',
  '#4FACFE',
  '#FA709A',
  '#30CFD0',
  '#A18CD1',
  '#FBC2EB',
  '#84FAB0',
];

@Injectable()
export class SimulationService {
  private state: SimulationState = this.getInitialState();
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private quantumCounter = 0;

  constructor(private eventEmitter: EventEmitter2) {}

  private getInitialState(): SimulationState {
    return {
      tick: 0,
      running: false,
      algorithm: 'ROUND_ROBIN',
      globalQuantum: 4,
      runningProcess: null,
      readyQueue: [],
      blockedQueue: [],
      terminatedQueue: [],
      gantt: [],
      interruptionLog: [],
      metrics: {
        totalInterruptions: 0,
        avgWaitingTime: 0,
        avgTurnaroundTime: 0,
        cpuUtilization: 0,
      },
    };
  }

  private makeRegisters(input?: Partial<Registers>): Registers {
    return {
      PC: input?.PC ?? '0x0000',
      SP: input?.SP ?? '0xFF00',
      AX: input?.AX ?? 0,
      BX: input?.BX ?? 0,
    };
  }

  addProcess(dto: CreateProcessDto): ProcessControlBlock {
    const colorIndex = this.state.readyQueue.length % PROCESS_COLORS.length;
    const pcb: ProcessControlBlock = {
      pid: dto.pid,
      name: dto.name,
      state: ProcessState.READY,
      burstTime: dto.burstTime,
      remainingBurst: dto.burstTime,
      arrivalTime: dto.arrivalTime ?? 0,
      priority: dto.priority ?? 1,
      quantum: dto.quantum ?? this.state.globalQuantum,
      registers: this.makeRegisters(dto.registers),
      waitingTime: 0,
      turnaroundTime: 0,
      color: PROCESS_COLORS[colorIndex],
    };
    this.state.readyQueue.push(pcb);
    this.eventEmitter.emit('simulation.update', this.getSnapshot());
    return pcb;
  }

  startSimulation(dto: StartSimulationDto): SimulationState {
    this.stopSimulation();
    this.state = this.getInitialState();
    this.state.algorithm = dto.algorithm ?? 'ROUND_ROBIN';
    this.state.globalQuantum = dto.quantum ?? 4;

    dto.processes.forEach((p, idx) => {
      const pcb: ProcessControlBlock = {
        pid: p.pid,
        name: p.name,
        state: ProcessState.READY,
        burstTime: p.burstTime,
        remainingBurst: p.burstTime,
        arrivalTime: p.arrivalTime ?? 0,
        priority: p.priority ?? 1,
        quantum: dto.quantum ?? 4,
        registers: this.makeRegisters(),
        waitingTime: 0,
        turnaroundTime: 0,
        color: PROCESS_COLORS[idx % PROCESS_COLORS.length],
      };
      this.state.readyQueue.push(pcb);
    });

    this.state.running = true;
    this.quantumCounter = 0;
    this.scheduleNextProcess();
    this.runTick();
    return this.getSnapshot();
  }

  private scheduleNextProcess() {
    if (this.state.runningProcess) return;
    if (this.state.readyQueue.length === 0) return;

    const next = this.state.readyQueue.shift()!;
    next.state = ProcessState.RUNNING;
    this.state.runningProcess = next;
    this.quantumCounter = 0;
  }

  private runTick() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      this.processTick();
    }, 500);
  }

  private processTick() {
    if (!this.state.running) return;

    this.state.tick++;

    // Increment waiting time for all ready-queue processes
    this.state.readyQueue.forEach((p) => {
      p.waitingTime++;
    });

    if (!this.state.runningProcess) {
      this.scheduleNextProcess();
      if (!this.state.runningProcess) {
        // CPU idle — check if we're done
        if (
          this.state.readyQueue.length === 0 &&
          this.state.blockedQueue.length === 0
        ) {
          this.stopSimulation();
        }
        this.eventEmitter.emit('simulation.update', this.getSnapshot());
        return;
      }
    }

    const proc = this.state.runningProcess!;
    proc.remainingBurst--;
    this.quantumCounter++;

    // Update PC register to simulate execution
    const pcVal = parseInt(proc.registers.PC, 16) + 2;
    proc.registers.PC = '0x' + pcVal.toString(16).toUpperCase().padStart(4, '0');
    proc.registers.AX = Math.floor(Math.random() * 100);

    // Record Gantt
    const lastGantt = this.state.gantt[this.state.gantt.length - 1];
    if (lastGantt && lastGantt.pid === proc.pid) {
      lastGantt.end = this.state.tick;
    } else {
      this.state.gantt.push({
        pid: proc.pid,
        name: proc.name,
        start: this.state.tick - 1,
        end: this.state.tick,
        color: proc.color,
      });
    }

    // Check process completion
    if (proc.remainingBurst <= 0) {
      proc.state = ProcessState.TERMINATED;
      proc.turnaroundTime = this.state.tick - proc.arrivalTime;
      this.state.terminatedQueue.push(proc);
      this.state.runningProcess = null;
      this.quantumCounter = 0;
      this.updateMetrics();
      this.scheduleNextProcess();
      this.eventEmitter.emit('simulation.update', this.getSnapshot());
      if (
        this.state.readyQueue.length === 0 &&
        this.state.blockedQueue.length === 0 &&
        !this.state.runningProcess
      ) {
        this.stopSimulation();
      }
      return;
    }

    // Check quantum expiry → TIMER interrupt
    if (this.quantumCounter >= this.state.globalQuantum) {
      this.eventEmitter.emit('interruption.timer', {
        pid: proc.pid,
        tick: this.state.tick,
      });
      return; // ISR will call back to emit snapshot
    }

    this.eventEmitter.emit('simulation.update', this.getSnapshot());
  }

  applyTimerInterrupt(pid: number): object {
    const proc = this.state.runningProcess;
    if (!proc || proc.pid !== pid) {
      return { error: 'Process is not currently running' };
    }

    const savedContext = {
      pid: proc.pid,
      registers: { ...proc.registers },
      savedAt: this.state.tick,
      reason: InterruptionType.TIMER,
    };

    proc.state = ProcessState.INTERRUPTED;

    const isrSteps = [
      `1. CPU detecta señal de interrupción del temporizador (quantum=${this.state.globalQuantum} ticks)`,
      `2. Finaliza instrucción actual del proceso ${proc.name} (PID ${proc.pid})`,
      `3. Guarda contexto de ${proc.name} en su PCB → PC=${proc.registers.PC}, AX=${proc.registers.AX}`,
      `4. Carga dirección de timer_isr desde vector de interrupciones [vector=0, addr=0x1000]`,
      `5. Ejecuta timer_isr: mueve ${proc.name} al final de la cola de listos (Round Robin)`,
      `6. timer_isr selecciona siguiente proceso de la cola de listos`,
      `7. Restaura contexto del siguiente proceso desde su PCB`,
      `8. CPU retoma ejecución del nuevo proceso`,
    ];

    proc.state = ProcessState.READY;
    this.state.readyQueue.push(proc);
    this.state.runningProcess = null;
    this.quantumCounter = 0;

    const logEntry: InterruptionLogEntry = {
      tick: this.state.tick,
      type: InterruptionType.TIMER,
      pid: proc.pid,
      action: 'context_switch',
    };
    this.state.interruptionLog.push(logEntry);
    this.state.metrics.totalInterruptions++;

    this.scheduleNextProcess();

    const nextProc = this.state.runningProcess as ProcessControlBlock | null;
    const restoredContext = nextProc
      ? {
          pid: nextProc.pid,
          registers: { ...nextProc.registers },
        }
      : null;


    const snapshot = {
      ...this.getSnapshot(),
      event: InterruptionType.TIMER,
      savedContext,
      isr: {
        name: 'timer_isr',
        steps: isrSteps,
        duration: 2,
        vectorAddress: '0x1000',
      },
      restoredContext,
    };

    this.eventEmitter.emit('simulation.update', snapshot);
    return snapshot;
  }

  applyIoInterrupt(
    pid: number,
    ioDevice: string,
  ): object {
    const savedContext = {
      pid,
      registers: { PC: '0x0000', SP: '0xFF00', AX: 0, BX: 0 },
      savedAt: this.state.tick,
      reason: InterruptionType.IO_COMPLETED,
    };

    // Check if process is blocked — unblock it
    const blockedIdx = this.state.blockedQueue.findIndex((p) => p.pid === pid);
    let affectedProcess: any = null;

    if (blockedIdx !== -1) {
      const proc = this.state.blockedQueue.splice(blockedIdx, 1)[0];
      savedContext.registers = { ...proc.registers };
      proc.state = ProcessState.READY;
      this.state.readyQueue.push(proc);
      affectedProcess = {
        pid: proc.pid,
        name: proc.name,
        previousState: ProcessState.BLOCKED,
        newState: ProcessState.READY,
      };
    } else if (
      this.state.runningProcess &&
      this.state.runningProcess.pid === pid
    ) {
      const proc = this.state.runningProcess;
      savedContext.registers = { ...proc.registers };
      affectedProcess = {
        pid: proc.pid,
        name: proc.name,
        previousState: ProcessState.RUNNING,
        newState: ProcessState.BLOCKED,
      };
      proc.state = ProcessState.BLOCKED;
      this.state.blockedQueue.push(proc);
      this.state.runningProcess = null;
      this.quantumCounter = 0;
      this.scheduleNextProcess();
    } else {
      affectedProcess = { pid, previousState: 'UNKNOWN', newState: 'READY' };
    }

    const isrSteps = [
      `1. Controlador de ${ioDevice} envía señal de interrupción al PIC`,
      `2. PIC (Programmable Interrupt Controller) notifica a la CPU`,
      `3. CPU interrumpe proceso actual y finaliza instrucción en curso`,
      `4. Guarda contexto del proceso actual en su PCB`,
      `5. Ejecuta io_isr: procesa señal de ${ioDevice} completado`,
      `6. io_isr: marca proceso PID ${pid} como READY (operación de E/S finalizada)`,
      `7. Transfiere datos del buffer de ${ioDevice} al espacio de memoria del proceso`,
      `8. Restaura contexto y continúa planificación normal`,
    ];

    const logEntry: InterruptionLogEntry = {
      tick: this.state.tick,
      type: InterruptionType.IO_COMPLETED,
      pid,
      action: 'io_unblock',
      ioDevice,
    };
    this.state.interruptionLog.push(logEntry);
    this.state.metrics.totalInterruptions++;

    const snapshot = {
      ...this.getSnapshot(),
      event: InterruptionType.IO_COMPLETED,
      ioDevice,
      savedContext,
      isr: {
        name: 'io_isr',
        steps: isrSteps,
        duration: 1,
        vectorAddress: '0x1010',
      },
      affectedProcess,
    };

    this.eventEmitter.emit('simulation.update', snapshot);
    return snapshot;
  }

  applyHardwareInterrupt(pid: number, ioDevice: string): object {
    const proc = this.state.runningProcess;
    const savedContext = proc
      ? {
          pid: proc.pid,
          registers: { ...proc.registers },
          savedAt: this.state.tick,
          reason: InterruptionType.HARDWARE,
        }
      : { pid, registers: {}, savedAt: this.state.tick, reason: 'HARDWARE' };

    const isrSteps = [
      `1. Dispositivo de hardware ${ioDevice} genera señal de interrupción`,
      `2. PIC prioriza y envía señal a la CPU`,
      `3. CPU finaliza instrucción actual`,
      `4. Guarda contexto del proceso en ejecución en su PCB`,
      `5. Carga dirección de hardware_isr desde vector de interrupciones`,
      `6. Ejecuta hardware_isr: atiende evento de ${ioDevice}`,
      `7. Lee datos del registro de datos del controlador de ${ioDevice}`,
      `8. Restaura contexto y retorna al proceso interrumpido`,
    ];

    const logEntry: InterruptionLogEntry = {
      tick: this.state.tick,
      type: InterruptionType.HARDWARE,
      pid: proc?.pid ?? pid,
      action: 'hardware_service',
      ioDevice,
    };
    this.state.interruptionLog.push(logEntry);
    this.state.metrics.totalInterruptions++;

    const snapshot = {
      ...this.getSnapshot(),
      event: InterruptionType.HARDWARE,
      ioDevice,
      savedContext,
      isr: {
        name: 'hardware_isr',
        steps: isrSteps,
        duration: 1,
        vectorAddress: '0x1020',
      },
    };

    this.eventEmitter.emit('simulation.update', snapshot);
    return snapshot;
  }

  blockCurrentProcess(): object {
    const proc = this.state.runningProcess;
    if (!proc) return { error: 'No process running' };

    proc.state = ProcessState.BLOCKED;
    this.state.blockedQueue.push(proc);
    this.state.runningProcess = null;
    this.quantumCounter = 0;
    this.scheduleNextProcess();
    this.eventEmitter.emit('simulation.update', this.getSnapshot());
    return { message: `Process ${proc.pid} blocked (waiting for I/O)`, ...this.getSnapshot() };
  }

  private updateMetrics() {
    const terminated = this.state.terminatedQueue;
    if (terminated.length === 0) return;
    const totalWait = terminated.reduce((s, p) => s + p.waitingTime, 0);
    const totalTurn = terminated.reduce((s, p) => s + p.turnaroundTime, 0);
    this.state.metrics.avgWaitingTime =
      Math.round((totalWait / terminated.length) * 100) / 100;
    this.state.metrics.avgTurnaroundTime =
      Math.round((totalTurn / terminated.length) * 100) / 100;
    const busyTicks = this.state.gantt.reduce(
      (s, g) => s + (g.end - g.start),
      0,
    );
    this.state.metrics.cpuUtilization =
      this.state.tick > 0
        ? Math.round((busyTicks / this.state.tick) * 100)
        : 0;
  }

  stopSimulation() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.state.running = false;
    this.updateMetrics();
    this.eventEmitter.emit('simulation.update', { ...this.getSnapshot(), event: 'SIMULATION_COMPLETE' });
  }

  resetSimulation() {
    this.stopSimulation();
    this.state = this.getInitialState();
    this.quantumCounter = 0;
    this.eventEmitter.emit('simulation.update', this.getSnapshot());
    return this.getSnapshot();
  }

  getSnapshot(): SimulationState {
    return {
      ...this.state,
      readyQueue: this.state.readyQueue.map((p) => ({ ...p })),
      blockedQueue: this.state.blockedQueue.map((p) => ({ ...p })),
      terminatedQueue: this.state.terminatedQueue.map((p) => ({ ...p })),
      gantt: [...this.state.gantt],
      interruptionLog: [...this.state.interruptionLog],
    };
  }

  getGantt(): GanttEntry[] {
    return this.state.gantt;
  }

  getInterruptionLog(): InterruptionLogEntry[] {
    return this.state.interruptionLog;
  }

  getVectorTable() {
    return {
      vectorTable: [
        { vector: 0,  type: 'TIMER',       isr: 'timer_isr',    address: '0x1000' },
        { vector: 1,  type: 'IO_DISK',     isr: 'io_isr',       address: '0x1010' },
        { vector: 2,  type: 'IO_KEYBOARD', isr: 'keyboard_isr', address: '0x1020' },
        { vector: 3,  type: 'IO_NETWORK',  isr: 'network_isr',  address: '0x1030' },
        { vector: 4,  type: 'HARDWARE',    isr: 'hardware_isr', address: '0x1040' },
        { vector: 14, type: 'PAGE_FAULT',  isr: 'pagefault_isr',address: '0x10E0' },
      ],
    };
  }
}
