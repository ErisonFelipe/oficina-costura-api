import type { FastifyRequest, FastifyReply } from 'fastify';
import { galleryService } from '../services/gallery.service';
import {
  createGalleryImageSchema,
  updateGalleryImageSchema,
} from '../schemas/gallery.schema';
import { saveImage, deleteImage } from '../utils/imageHandler';

export class GalleryController {
  async list(
    req: FastifyRequest<{ Querystring: { category?: string; featured?: string; active?: string } }>,
    reply: FastifyReply
  ) {
    const images = await galleryService.findAll({
      category: req.query.category,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
    });
    return reply.send({ data: images });
  }

  async categories(_: FastifyRequest, reply: FastifyReply) {
    const categories = await galleryService.categories();
    return reply.send({ data: categories });
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const parts = req.parts();
    let imageFile: any = null;
    const fields: Record<string, string> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        imageFile = part;
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    if (!imageFile) {
      return reply.status(400).send({ error: 'Imagem é obrigatória' });
    }

    const parsed = createGalleryImageSchema.safeParse(fields);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const saved = await saveImage(imageFile);

    const image = await galleryService.create(parsed.data, {
      filename: saved.filename,
      originalName: imageFile.filename,
      mimeType: imageFile.mimetype,
      size: saved.size,
      width: saved.width,
      height: saved.height,
    });

    return reply.status(201).send({ data: image });
  }

  async update(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateGalleryImageSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const image = await galleryService.update(req.params.id, parsed.data);
      return reply.send({ data: image });
    } catch {
      return reply.status(404).send({ error: 'Imagem não encontrada' });
    }
  }

  async delete(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const image = await galleryService.findById(req.params.id);
    if (!image) return reply.status(404).send({ error: 'Imagem não encontrada' });

    await deleteImage(image.filename);

    await galleryService.delete(req.params.id);
    return reply.status(204).send();
  }
}

export const galleryController = new GalleryController();
