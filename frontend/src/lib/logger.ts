/** Provides a structured, colorized logger for the browser console. */

const LEVELS = {
  FATAL:   { value: 0, color: 'background: #dc2626; color: white; padding: 2px 4px; border-radius: 2px; font-weight: bold;' },
  ERROR:   { value: 1, color: 'color: #dc2626; font-weight: bold;' },
  WARN:    { value: 2, color: 'color: #d97706; font-weight: bold;' },
  SUCCESS: { value: 3, color: 'color: #16a34a; font-weight: bold;' },
  INFO:    { value: 4, color: 'color: #0284c7; font-weight: bold;' },
  DEBUG:   { value: 5, color: 'color: #6b7280; font-weight: bold;' },
  TRACE:   { value: 6, color: 'color: #9ca3af;' }
};

const CURRENT_LEVEL = LEVELS.DEBUG.value;

/** Formats output for the browser console. */
function log(levelName: keyof typeof LEVELS, category: string, message: string, metadata?: any) {
  const level = LEVELS[levelName];
  if (level.value > CURRENT_LEVEL) return;

  const timestamp = new Date().toISOString().split('T')[1].replace('Z', '');
  
  const prefix = `%c[${timestamp}] [${levelName}] [${category}]`;
  const styles = level.color;
  
  let method = 'log';
  if (levelName === 'ERROR' || levelName === 'FATAL') method = 'error';
  else if (levelName === 'WARN') method = 'warn';
  else if (levelName === 'INFO' || levelName === 'SUCCESS') method = 'info';
  else if (levelName === 'DEBUG' || levelName === 'TRACE') method = 'debug';

  if (metadata) {
    (console as any)[method](`${prefix} ${message}`, styles, metadata);
  } else {
    (console as any)[method](`${prefix} ${message}`, styles);
  }
}

export const logger = {
  CATEGORIES: {
    UI: 'UI',
    API: 'API',
    SOCKET: 'SOCKET',
    SYSTEM: 'SYSTEM',
    AUTH: 'AUTH',
    ROUTER: 'ROUTER',
  },

  fatal:   (msg: string, meta?: any) => log('FATAL',   meta?.category || logger.CATEGORIES.UI, msg, meta),
  error:   (msg: string, meta?: any) => log('ERROR',   meta?.category || logger.CATEGORIES.UI, msg, meta),
  warn:    (msg: string, meta?: any) => log('WARN',    meta?.category || logger.CATEGORIES.UI, msg, meta),
  success: (msg: string, meta?: any) => log('SUCCESS', meta?.category || logger.CATEGORIES.UI, msg, meta),
  info:    (msg: string, meta?: any) => log('INFO',    meta?.category || logger.CATEGORIES.UI, msg, meta),
  debug:   (msg: string, meta?: any) => log('DEBUG',   meta?.category || logger.CATEGORIES.UI, msg, meta),
  trace:   (msg: string, meta?: any) => log('TRACE',   meta?.category || logger.CATEGORIES.UI, msg, meta),
};
