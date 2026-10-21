// @ts-nocheck

export interface LoginDto {
  email: string;
  /** @minLength 4 */
  password: string;
}
