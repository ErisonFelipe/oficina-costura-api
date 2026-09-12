import { prisma } from '../config/database';
import type { CreateQuoteInput, UpdateQuoteStatusInput } from '../schemas/quote.schema';

export class QuoteService {
  async create(data: CreateQuoteInput) {
    return prisma.quote.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        service: data.service || null,
        message: data.message,
      },
    });
  }

  async findAll(filters?: { status?: string }) {
    return prisma.quote.findMany({
      where: filters?.status ? { status: filters.status as any } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.quote.findUnique({ where: { id } });
  }

  async updateStatus(id: string, data: UpdateQuoteStatusInput) {
    return prisma.quote.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  async delete(id: string) {
    return prisma.quote.delete({ where: { id } });
  }

  async stats() {
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'PENDING' } }),
      prisma.quote.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.quote.count({ where: { status: 'COMPLETED' } }),
    ]);
    return { total, pending, inProgress, completed };
  }
}

export const quoteService = new QuoteService();
