import * as Sentry from '@sentry/react';
import { environment } from '../../config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

export class Logger {
  private context: string;
  private static instance: Logger;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = this.formatMessage(level, message, data);

    if (environment.production) {
      // In production, send to logging service
      this.sendToLoggingService(logEntry);
    } else {
      // In development, use console
      console[level](
        `[${logEntry.timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.context}]:`,
        message,
        data || ''
      );
    }
  }

  private sendToLoggingService(logEntry: LogEntry) {
    if (logEntry.level === 'error') {
      Sentry.captureException(new Error(logEntry.message), {
        extra: logEntry.data,
        tags: {
          context: logEntry.context,
        },
      });
    } else {
      Sentry.addBreadcrumb({
        category: logEntry.context,
        message: logEntry.message,
        level: logEntry.level as Sentry.SeverityLevel,
        data: logEntry.data,
      });
    }
  }

  public debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  public info(message: string, data?: any) {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any) {
    this.log('error', message, data);
  }
}