import type { LogLevel } from '../../shared/ipc';

class Logger {
	private log(level: LogLevel, message: string, context?: string) {
		// Log to renderer console for dev
		const consoleLvl = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
		console[consoleLvl](`[${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`);
		
		// Send to main process
		if (window.electronAPI && window.electronAPI.logMessage) {
			window.electronAPI.logMessage({ level, message, context });
		}
	}

	debug(message: string, context?: string) {
		this.log('debug', message, context);
	}

	info(message: string, context?: string) {
		this.log('info', message, context);
	}

	warn(message: string, context?: string) {
		this.log('warn', message, context);
	}

	error(message: string | Error, context?: string) {
		const msg = message instanceof Error ? (message.stack || message.message) : message;
		this.log('error', msg, context);
	}
}

export const logger = new Logger();
