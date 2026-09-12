import { prisma } from '../config/database';
import type {
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
} from '../schemas/gallery.schema';

interface ImageMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export class GalleryService {
  async create(data: CreateGalleryImageInput, image: ImageMetadata) {
    return prisma.galleryImage.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        featured: data.featured,
        order: data.order,
        filename: image.filename,
        originalName: image.originalName,
        mimeType: image.mimeType,
        size: image.size,
        width: image.width,
        height: image.height,
      },
    });
  }

  async findAll(filters?: { category?: string; featured?: boolean; active?: boolean }) {
    return prisma.galleryImage.findMany({
      where: {
        ...(filters?.category && { category: filters.category }),
        ...(filters?.featured !== undefined && { featured: filters.featured }),
        active: filters?.active !== undefined ? filters.active : true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    return prisma.galleryImage.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateGalleryImageInput) {
    return prisma.galleryImage.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.galleryImage.delete({ where: { id } });
  }

  async categories() {
    const result = await prisma.galleryImage.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ['category'],
    });
    return result.map((r) => r.category);
  }
}

export const galleryService = new GalleryService();
