import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProcessInputDto {
  @IsNumber()
  pid: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  burstTime: number;

  @IsNumber()
  @IsOptional()
  arrivalTime?: number = 0;

  @IsNumber()
  @IsOptional()
  priority?: number = 1;
}

export class StartSimulationDto {
  @IsString()
  @IsOptional()
  algorithm?: string = 'ROUND_ROBIN';

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  quantum?: number = 4;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessInputDto)
  processes: ProcessInputDto[];
}
