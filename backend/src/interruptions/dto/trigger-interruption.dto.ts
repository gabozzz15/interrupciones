import { IsString, IsNumber, IsOptional } from 'class-validator';

export class TriggerInterruptionDto {
  @IsString()
  type: 'TIMER' | 'IO_COMPLETED' | 'HARDWARE' | 'SOFTWARE';

  @IsNumber()
  pid: number;

  @IsString()
  @IsOptional()
  ioDevice?: string = 'DISK';

  @IsOptional()
  data?: Record<string, unknown>;
}
