import { z } from 'zod';

export const createGalleryImageSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  category: z.string().min(2).max(50),
  featured: z.coerce.boolean().default(false),
  order: z.coerce.number().int().default(0),
});

export const updateGalleryImageSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).optional(),
  category: z.string().min(2).max(50).optional(),
  featured: z.coerce.boolean().optional(),
  order: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional(),
});

export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;
