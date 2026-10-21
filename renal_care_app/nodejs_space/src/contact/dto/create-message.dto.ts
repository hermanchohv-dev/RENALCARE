import { IsString, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(10)
  message!: string;
}
