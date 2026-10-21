import { ApiProperty } from '@nestjs/swagger';

export class ContactMessageResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() subject!: string;
  @ApiProperty() message!: string;
  @ApiProperty() status!: string;
  @ApiProperty() createdAt!: string;
}

export class ContactMessagesListDto {
  @ApiProperty({ type: () => [ContactMessageResponseDto] })
  items!: ContactMessageResponseDto[];
}
