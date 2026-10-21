// @ts-nocheck
import type { UserDto } from './userDto';

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}
