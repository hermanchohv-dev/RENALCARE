import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) {}

  async createMessage(userId: string, subject: string, message: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const msg = await this.prisma.contact_message.create({
      data: {
        patientId: patient.id,
        subject,
        message,
        status: 'enviado',
      },
    });

    this.logger.log(`Contact message sent by patient ${patient.fullName} to contactonefrologia@riojasalud.es`);

    return {
      id: msg.id,
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      createdAt: msg.createdAt.toISOString(),
    };
  }

  async getMessages(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const messages = await this.prisma.contact_message.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: messages.map((m) => ({
        id: m.id,
        subject: m.subject,
        message: m.message,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }
}
