// src/utils/logger.ts
import { CONFIG } from '../config/constants';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = CONFIG.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogMessage {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  private print(logMessage: LogMessage): void {
    if (!this.isDevelopment) return;

    const { timestamp, level, message, data } = logMessage;

    const colorize = (str: string, color: string) => `${color}${str}\x1b[0m`;

    const colors = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[35m',   // Magenta
    };

    const prefix = colorize(`[${level.toUpperCase()}]`, colors[level]);
    const time = colorize(timestamp, '\x1b[90m'); // Gray

    console.log(`${time} ${prefix} ${message}`);

    if (data) {
      if (level === 'error' && data instanceof Error) {
        console.log(colorize('Error Stack:', colors.error));
        console.log(data.stack);
      } else {
        console.log(colorize('Additional Data:', colors[level]));
        console.dir(data, { depth: null, colors: true });
      }
    }
  }

  info(message: string, data?: any): void {
    this.print(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any): void {
    this.print(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: Error | any): void {
    this.print(this.formatMessage('error', message, error));
  }

  debug(message: string, data?: any): void {
    this.print(this.formatMessage('debug', message, data));
  }

  req(req: any, message: string = 'Incoming Request'): void {
    if (!this.isDevelopment) return;

    this.info(message, {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    });
  }

  res(res: any, message: string = 'Outgoing Response'): void {
    if (!this.isDevelopment) return;

    this.info(message, {
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body,
    });
  }
}

export const logger = new Logger();
