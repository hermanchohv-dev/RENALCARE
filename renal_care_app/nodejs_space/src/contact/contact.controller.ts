import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-message.dto';
import { ContactMessageResponseDto, ContactMessagesListDto } from './dto/contact-response.dto';

@ApiTags('Contact')
@UseGuards(AuthGuard('jwt'))
@Controller('api/contact-messages')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateContactMessageDto): Promise<ContactMessageResponseDto> {
    const user = req.user as { id: string };
    return this.contactService.createMessage(user.id, dto.subject, dto.message);
  }

  @Get()
  async list(@Req() req: Request): Promise<ContactMessagesListDto> {
    const user = req.user as { id: string };
    return this.contactService.getMessages(user.id);
  }
}
