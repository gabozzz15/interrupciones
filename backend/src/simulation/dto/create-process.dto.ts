import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class CreateProcessDto {
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
  priority?: number = 1;

  @IsNumber()
  @IsOptional()
  arrivalTime?: number = 0;

  @IsNumber()
  @IsOptional()
  quantum?: number = 4;

  @IsObject()
  @IsOptional()
  registers?: {
    PC?: string;
    SP?: string;
    AX?: number;
    BX?: number;
  };
}
