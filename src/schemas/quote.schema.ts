import { z } from 'zod';

export const createQuoteSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido').max(150),
  phone: z.string().max(20).optional().or(z.literal('')),
  service: z.string().max(50).optional().or(z.literal('')),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(2000),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().max(1000).optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
