import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { App, BrowserWindow } from 'electron';

const ensureLogDir = (app: App): string => {
	const dir = join(app.getPath('userData'), 'logs');
	mkdirSync(dir, { recursive: true });
	return dir;
};

const formatLine = (level: string, message: string): string => {
	const timestamp = new Date().toISOString();
	return `[${timestamp}] [${level}] ${message}\n`;
};

export const appendMainLog = (app: App, level: string, message: string): void => {
	try {
		const dir = ensureLogDir(app);
		const logPath = join(dir, 'main.log');
		appendFileSync(logPath, formatLine(level, message), 'utf8');
	} catch {
		// Ignore logging failures to avoid crash loops.
	}
};

export const initMainLogging = (app: App, window: BrowserWindow): void => {
	appendMainLog(app, 'info', 'Main process logging initialized.');

	process.on('uncaughtException', (error) => {
		appendMainLog(app, 'error', `Uncaught exception: ${error.stack ?? error.message}`);
	});

	process.on('unhandledRejection', (reason) => {
		appendMainLog(app, 'error', `Unhandled rejection: ${String(reason)}`);
	});

	window.webContents.on('did-finish-load', () => {
		appendMainLog(app, 'info', 'Renderer finished load.');
	});

	window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
		appendMainLog(app, 'error', `Renderer failed to load: ${errorCode} ${errorDescription} (${validatedURL})`);
	});

	window.webContents.on('render-process-gone', (_event, details) => {
		appendMainLog(app, 'error', `Renderer process gone: ${details.reason} (exitCode=${details.exitCode})`);
	});
};
