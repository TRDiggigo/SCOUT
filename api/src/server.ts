import { app } from './app.js';
import { logger } from './util/logger.js';

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '0.0.0.0';

async function startServer(): Promise<void> {
  const port = Number(process.env.API_PORT ?? DEFAULT_PORT);
  const host = process.env.API_HOST ?? DEFAULT_HOST;

  try {
    await app.listen({ port, host });
    logger.info('SCOUT API started', { host, port });
  } catch (error) {
    logger.error('SCOUT API failed to start', {
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    process.exit(1);
  }
}

void startServer();
