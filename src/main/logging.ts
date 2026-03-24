import { mkdirSync, createWriteStream, WriteStream, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { App, BrowserWindow } from 'electron';

let logStream: WriteStream | null = null;
let currentLogDate: string | null = null;
let savedLogDir: string | null = null;

const ensureLogDir = (app: App): string => {
	if (savedLogDir) return savedLogDir;
	const dir = join(app.getPath('userData'), 'logs');
	mkdirSync(dir, { recursive: true });
	savedLogDir = dir;
	return dir;
};

const getLogDate = (): string => {
	const now = new Date();
	return now.toISOString().split('T')[0];
};

const cleanOldLogs = (dir: string) => {
	try {
		const MAX_LOGS = 14; // Keep 14 days of logs
		const files = readdirSync(dir);
		const logFiles = files
			.filter(f => f.startsWith('game-') && f.endsWith('.log'))
			.map(name => ({
				name,
				time: statSync(join(dir, name)).mtime.getTime()
			}))
			.sort((a, b) => b.time - a.time);

		if (logFiles.length > MAX_LOGS) {
			for (let i = MAX_LOGS; i < logFiles.length; i++) {
				unlinkSync(join(dir, logFiles[i].name));
			}
		}
	} catch {
		// Ignore
	}
};

const getLogStream = (app: App): WriteStream => {
	const dir = ensureLogDir(app);
	const dateStr = getLogDate();
	
	if (currentLogDate !== dateStr || !logStream) {
		if (logStream) {
			logStream.end();
		}
		currentLogDate = dateStr;
		const logPath = join(dir, `game-${dateStr}.log`);
		logStream = createWriteStream(logPath, { flags: 'a', encoding: 'utf8' });
		cleanOldLogs(dir);
	}
	return logStream;
};

const formatLine = (level: string, message: string, context?: string): string => {
	const timestamp = new Date().toISOString();
	const ctxStr = context ? ` [${context}]` : '';
	return `[${timestamp}] [${level.toUpperCase()}]${ctxStr} ${message}\n`;
};

export const appendMainLog = (app: App, level: string, message: string, context?: string): void => {
	try {
		const stream = getLogStream(app);
		stream.write(formatLine(level, message, context));
		
		if (!app.isPackaged) {
			if (level === 'error') console.error(`[${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`);
			else if (level === 'warn') console.warn(`[${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`);
			else console.log(`[${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`);
		}
	} catch {
		// Ignore logging failures to avoid crash loops.
	}
};

export const initMainLogging = (app: App, window: BrowserWindow): void => {
	appendMainLog(app, 'info', 'Main process logging initialized.', 'main');

	process.on('uncaughtException', (error) => {
		appendMainLog(app, 'error', `Uncaught exception: ${error.stack ?? error.message}`, 'main');
	});

	process.on('unhandledRejection', (reason) => {
		appendMainLog(app, 'error', `Unhandled rejection: ${String(reason)}`, 'main');
	});

	window.webContents.on('did-finish-load', () => {
		appendMainLog(app, 'info', 'Renderer finished load.', 'main');
	});

	window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
		appendMainLog(app, 'error', `Renderer failed to load: ${errorCode} ${errorDescription} (${validatedURL})`, 'main');
	});

	window.webContents.on('render-process-gone', (_event, details) => {
		appendMainLog(app, 'error', `Renderer process gone: ${details.reason} (exitCode=${details.exitCode})`, 'main');
	});
};
