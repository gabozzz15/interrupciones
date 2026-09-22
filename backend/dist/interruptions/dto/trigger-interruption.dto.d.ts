export declare class TriggerInterruptionDto {
    type: 'TIMER' | 'IO_COMPLETED' | 'HARDWARE' | 'SOFTWARE';
    pid: number;
    ioDevice?: string;
    data?: Record<string, unknown>;
}
