import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'node:path';
import { env } from './config/env';
import { prisma } from './config/database';
import { quoteRoutes } from './routes/quote.routes';
import { galleryRoutes } from './routes/gallery.routes';

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // ===== PLUGINS =====
await app.register(cors, {
  origin: [env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE,
    },
  });

  await app.register(fastifyStatic, {
    root: path.join(__dirname, '..', env.UPLOAD_DIR),
    prefix: '/uploads/',
  });

  // ===== SWAGGER =====
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Linha & Ponto — API',
        description: 'API da oficina de costura Linha & Ponto',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Desenvolvimento',
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // ===== ROTAS =====
  await app.register(quoteRoutes, { prefix: '/api/quotes' });
  await app.register(galleryRoutes, { prefix: '/api/gallery' });

  // ===== HEALTH CHECK =====
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // ===== ERROR HANDLER =====
  app.setErrorHandler((error: FastifyError, request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: 'Erro de validação',
        details: error.validation,
      });
    }

    reply.status(error.statusCode || 500).send({
      error: error.message || 'Erro interno do servidor',
    });
  });

  // ===== START =====
  try {
    await prisma.$connect();
    app.log.info('✅ Banco de dados conectado');

    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 Servidor rodando em http://localhost:${env.PORT}`);
    app.log.info(`📚 Documentação: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // ===== GRACEFUL SHUTDOWN =====
  const shutdown = async (signal: string) => {
    app.log.info(`\n${signal} recebido. Encerrando...`);
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap();
