import type { FastifyRequest, FastifyReply } from 'fastify';
import { quoteService } from '../services/quote.service';
import { createQuoteSchema, updateQuoteStatusSchema } from '../schemas/quote.schema';
import { sendQuoteNotification } from '../utils/mailer';

export class QuoteController {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const parsed = createQuoteSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const quote = await quoteService.create(parsed.data);

    sendQuoteNotification(quote).catch((err) =>
      console.error('Erro ao enviar notificação:', err)
    );

    return reply.status(201).send({
      message: 'Orçamento recebido com sucesso! Entraremos em contato em breve.',
      data: quote,
    });
  }

  async list(req: FastifyRequest<{ Querystring: { status?: string } }>, reply: FastifyReply) {
    const quotes = await quoteService.findAll({ status: req.query.status });
    return reply.send({ data: quotes });
  }

  async show(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const quote = await quoteService.findById(req.params.id);
    if (!quote) return reply.status(404).send({ error: 'Orçamento não encontrado' });
    return reply.send({ data: quote });
  }

  async updateStatus(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateQuoteStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const quote = await quoteService.updateStatus(req.params.id, parsed.data);
      return reply.send({ data: quote });
    } catch {
      return reply.status(404).send({ error: 'Orçamento não encontrado' });
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await quoteService.delete(req.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Orçamento não encontrado' });
    }
  }

  async stats(_: FastifyRequest, reply: FastifyReply) {
    const stats = await quoteService.stats();
    return reply.send({ data: stats });
  }
}

export const quoteController = new QuoteController();
