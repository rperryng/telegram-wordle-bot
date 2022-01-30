import 'source-map-support/register';
import { logger } from '../logger';

process.on('unhandledRejection', logger.error);
