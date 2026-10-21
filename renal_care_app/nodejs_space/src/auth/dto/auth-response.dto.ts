import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;
}

export class LoginResponseDto {
  @ApiProperty()
  token!: string;

  @ApiProperty({ type: () => UserDto })
  user!: UserDto;
}

export class MeResponseDto {
  @ApiProperty({ type: () => UserDto })
  user!: UserDto;
}
