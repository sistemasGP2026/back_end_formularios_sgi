import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResponseStatus } from '../schemas/response.schema';

export class ApproveResponseDto {
  @IsEnum([ResponseStatus.APPROVED, ResponseStatus.REJECTED])
  status: ResponseStatus.APPROVED | ResponseStatus.REJECTED;

  @IsString()
  @IsOptional()
  rejectionReason?: string; 
}