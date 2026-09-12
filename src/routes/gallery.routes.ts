import type { FastifyInstance } from 'fastify';
import { galleryController } from '../controllers/gallery.controller';

export async function galleryRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: { tags: ['Galeria'], summary: 'Listar imagens da galeria' },
    handler: galleryController.list.bind(galleryController),
  });

  app.get('/categories', {
    schema: { tags: ['Galeria'], summary: 'Listar categorias disponíveis' },
    handler: galleryController.categories.bind(galleryController),
  });

  app.post('/', {
    schema: { tags: ['Galeria'], summary: 'Upload de nova imagem' },
    handler: galleryController.create.bind(galleryController),
  });

  app.patch('/:id', {
    schema: { tags: ['Galeria'], summary: 'Atualizar metadados da imagem' },
    handler: galleryController.update.bind(galleryController),
  });

  app.delete('/:id', {
    schema: { tags: ['Galeria'], summary: 'Deletar imagem' },
    handler: galleryController.delete.bind(galleryController),
  });
}
