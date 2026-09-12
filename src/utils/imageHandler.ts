import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../config/env';

interface MultipartFile {
  filename: string;
  mimetype: string;
  file: NodeJS.ReadableStream;
}

export interface SavedImage {
  filename: string;
  size: number;
  width: number;
  height: number;
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export async function saveImage(file: MultipartFile): Promise<SavedImage> {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    throw new Error('Formato inválido. Use JPEG, PNG ou WebP.');
  }

  const ext = file.mimetype.split('/')[1].replace('jpeg', 'jpg');
  const filename = `${randomUUID()}.${ext}`;
  const galleryDir = path.join(env.UPLOAD_DIR, 'gallery');
  const filepath = path.join(galleryDir, filename);

  await mkdir(galleryDir, { recursive: true });

  const tempPath = `${filepath}.tmp`;
  await pipeline(file.file, createWriteStream(tempPath));

  const finalFilename = `${path.basename(filename, `.${ext}`)}.webp`;
  const optimizedPath = path.join(galleryDir, finalFilename);

  const info = await sharp(tempPath)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(optimizedPath);

  await unlink(tempPath);

  return {
    filename: finalFilename,
    size: info.size,
    width: info.width,
    height: info.height,
  };
}

export async function deleteImage(filename: string) {
  const filepath = path.join(env.UPLOAD_DIR, 'gallery', filename);
  try {
    await unlink(filepath);
  } catch {
    // Arquivo já removido ou não existe
  }
}
