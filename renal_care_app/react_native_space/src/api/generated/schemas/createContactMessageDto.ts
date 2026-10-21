// @ts-nocheck

export interface CreateContactMessageDto {
  /** @minLength 1 */
  subject: string;
  /** @minLength 10 */
  message: string;
}
