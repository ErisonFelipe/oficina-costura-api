import type { FastifyInstance } from 'fastify';
import { quoteController } from '../controllers/quote.controller';

export async function quoteRoutes(app: FastifyInstance) {
  app.post('/', {
    schema: { tags: ['Orçamentos'], summary: 'Criar novo orçamento' },
    handler: quoteController.create.bind(quoteController),
  });

  app.get('/', {
    schema: { tags: ['Orçamentos'], summary: 'Listar todos os orçamentos' },
    handler: quoteController.list.bind(quoteController),
  });

  app.get('/stats', {
    schema: { tags: ['Orçamentos'], summary: 'Estatísticas dos orçamentos' },
    handler: quoteController.stats.bind(quoteController),
  });

  app.get('/:id', {
    schema: { tags: ['Orçamentos'], summary: 'Buscar orçamento por ID' },
    handler: quoteController.show.bind(quoteController),
  });

  app.patch('/:id/status', {
    schema: { tags: ['Orçamentos'], summary: 'Atualizar status do orçamento' },
    handler: quoteController.updateStatus.bind(quoteController),
  });

  app.delete('/:id', {
    schema: { tags: ['Orçamentos'], summary: 'Deletar orçamento' },
    handler: quoteController.delete.bind(quoteController),
  });
}
