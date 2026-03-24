import { app, BrowserWindow, Menu, ipcMain, screen, shell, protocol } from 'electron';
import { fileURLToPath } from 'node:url';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname } from 'node:path';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { registerAppControlIpc } from './ipc/app-control';
import { fileExists, readJson, writeJson } from '../lib';
import { appendMainLog, initMainLogging } from './logging';
import {
  APPLY_VIDEO_MODE_CHANNEL,
  type ApplyVideoModeRequest,
  type ApplyVideoModeResponse,
  type DisplayOption,
  GET_APP_VERSION_CHANNEL,
  GET_DISPLAY_OPTIONS_CHANNEL,
  GET_OS_BUILD_INFO_CHANNEL,
  type GetDisplayOptionsResponse,
  type GetOsBuildInfoResponse,
  HAS_SAVE_GAME_CHANNEL,
  isLanguage,
  LOAD_LANGUAGE_CHANNEL,
  OPEN_EXTERNAL_URL_CHANNEL,
  SAVE_LANGUAGE_CHANNEL,
  type GetAppVersionResponse,
  type HasSaveGameResponse,
  type LoadLanguageResponse,
  type OpenExternalUrlRequest,
  type OpenExternalUrlResponse,
  type SaveLanguageRequest,
  type SaveLanguageResponse,
  LIST_SAVES_CHANNEL,
  CREATE_SAVE_CHANNEL,
  DELETE_SAVE_CHANNEL,
  LOAD_SAVE_CHANNEL,
  LOG_MESSAGE_CHANNEL,
  type LogMessageRequest,
  type ListSavesResponse,
  type CreateSaveRequest,
  type CreateSaveResponse,
  type DeleteSaveRequest,
  type DeleteSaveResponse,
  type LoadSaveRequest,
  type LoadSaveResponse,
} from '../shared';

import { readdirSync, unlinkSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let mainWindow: BrowserWindow | null = null;
const TAMPER_EXIT_CODE = 173;

type IntegrityVerificationResult = {
  ok: boolean;
  reason?: string;
  failedFile?: string;
};

type IntegrityCheckResult =
  | { ok: true }
  | { ok: false; reason: string; failedFile?: string };

type IntegrityVerifierModule = {
  verifyAsarUnpackIntegrity: (baseDir: string, manifestRelativePath?: string) => IntegrityVerificationResult;
};

const loadIntegrityVerifier = (unpackedResourcesDir: string): IntegrityVerifierModule => {
  const bytecodePath = join(unpackedResourcesDir, 'dist/security/runtime-integrity.jsc');
  const sourcePath = join(unpackedResourcesDir, 'dist/security/runtime-integrity.cjs');

  try {
    require('bytenode');
  } catch {
    return require(sourcePath) as IntegrityVerifierModule;
  }

  try {
    return require(bytecodePath) as IntegrityVerifierModule;
  } catch {
    return require(sourcePath) as IntegrityVerifierModule;
  }
};

const isDevToolsShortcut = (input: Electron.Input): boolean => {
  const key = input.key.toLowerCase();
  const hasCtrlOrMeta = input.control || input.meta;

  if (key === 'f12') return true;
  if (hasCtrlOrMeta && input.shift && (key === 'i' || key === 'j' || key === 'c')) return true;

  return false;
};

const applyPackagedSecurity = (window: BrowserWindow): void => {
  window.webContents.on('before-input-event', (event, input) => {
    if (isDevToolsShortcut(input)) {
      event.preventDefault();
    }
  });

  window.webContents.on('devtools-opened', () => {
    window.webContents.closeDevTools();
  });
};

const verifyPackagedIntegrity = (): IntegrityCheckResult => {
  if (!app.isPackaged) return { ok: true };

  try {
    const unpackedResourcesDir = join(process.resourcesPath, 'app.asar.unpacked');
    const bytecodePath = join(unpackedResourcesDir, 'dist/security/runtime-integrity.jsc');
    const sourcePath = join(unpackedResourcesDir, 'dist/security/runtime-integrity.cjs');

    if (!existsSync(bytecodePath) || !existsSync(sourcePath)) {
      return {
        ok: false,
        reason: 'Integrity verifier not found',
        failedFile: !existsSync(bytecodePath) ? bytecodePath : sourcePath,
      };
    }

    const verifierModule = loadIntegrityVerifier(unpackedResourcesDir);
    const verification = verifierModule.verifyAsarUnpackIntegrity(
      unpackedResourcesDir,
      'dist/security/asar-integrity.json'
    );

    if (!verification.ok) {
      return {
        ok: false,
        reason: verification.reason ?? 'Integrity verification failed',
        failedFile: verification.failedFile,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? `Integrity verification error: ${error.message}` : 'Integrity verification error',
    };
  }
};

const respondToTamperDetection = (result: Extract<IntegrityCheckResult, { ok: false }>): void => {
  try {
    const securityDir = join(app.getPath('userData'), 'security');
    mkdirSync(securityDir, { recursive: true });

    const event = {
      timestamp: new Date().toISOString(),
      appVersion: app.getVersion(),
      platform: process.platform,
      reason: result.reason,
      failedFile: result.failedFile ?? null,
    };

    appendFileSync(join(securityDir, 'tamper-events.log'), `${JSON.stringify(event)}\n`, 'utf8');
  } catch {
    // Intentionally ignore secondary logging failures.
  }

  console.error('Tamper detection triggered, terminating process.', result.reason, result.failedFile ?? '');
  app.exit(TAMPER_EXIT_CODE);
};

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.json': 'application/json',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
};

const registerAppProtocol = (rendererRoot: string): void => {
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    const relativePath = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    const filePath = join(rendererRoot, relativePath || 'index.html');
    const mime = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

    let fileBuffer: Buffer;
    try {
      fileBuffer = readFileSync(filePath);
    } catch (e) {
      console.error('[app-protocol] 404:', filePath, e);
      return new Response('Not found', { status: 404 });
    }

    const totalSize = fileBuffer.length;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
      const start = match?.[1] ? parseInt(match[1], 10) : 0;
      const end = match?.[2] ? parseInt(match[2], 10) : totalSize - 1;
      const chunkSize = end - start + 1;
      const chunk = fileBuffer.subarray(start, end + 1);
      return new Response(new Uint8Array(chunk), {
        status: 206,
        headers: {
          'Content-Type': mime,
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
        },
      });
    }

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(totalSize),
      },
    });
  });
};

const getDisplayLabel = (display: Electron.Display, index: number): string => {
  const bounds = `${display.bounds.width}x${display.bounds.height}`;
  const position = `(${display.bounds.x}, ${display.bounds.y})`;
  return display.label?.trim() ? `${display.label} · ${bounds} ${position}` : `Display ${index + 1} · ${bounds} ${position}`;
};

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: !app.isPackaged,
      autoplayPolicy: 'no-user-gesture-required',
    },
    show: false,
  });

  // if (!app.isPackaged) {
  //   mainWindow.webContents.openDevTools();
  // }

  if (app.isPackaged) {
    applyPackagedSecurity(mainWindow);
  }

  initMainLogging(app, mainWindow);

  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.setTitle('Railsim Base Template');

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    const rendererRoot = app.isPackaged
      ? join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'renderer')
      : join(__dirname, '../renderer');
    registerAppProtocol(rendererRoot);
    mainWindow.loadURL('app://-/index.html');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

app.whenReady().then(() => {
  const integrityResult = verifyPackagedIntegrity();
  if (!integrityResult.ok) {
    respondToTamperDetection(integrityResult);
    return;
  }

  // Language storage handlers
  const languageFilePath = join(app.getPath('userData'), 'language.json');
  const saveGameFilePath = join(app.getPath('userData'), 'savegame.json');

  ipcMain.handle(SAVE_LANGUAGE_CHANNEL, async (_event, request: SaveLanguageRequest): Promise<SaveLanguageResponse> => {
    try {
      if (!isLanguage(request?.language)) {
        return { ok: false, error: 'Unsupported language' };
      }

      await writeJson(languageFilePath, { language: request.language });
      return { ok: true };
    } catch (error) {
      console.error('Failed to save language:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle(LOAD_LANGUAGE_CHANNEL, async (): Promise<LoadLanguageResponse> => {
    try {
      const data = await readJson<{ language?: unknown }>(languageFilePath);
      if (data && isLanguage(data.language)) {
        return data.language;
      }
      return 'en';
    } catch (error) {
      console.error('Failed to load language:', error);
      return 'en';
    }
  });

  ipcMain.handle(HAS_SAVE_GAME_CHANNEL, async (): Promise<HasSaveGameResponse> => {
    try {
      return await fileExists(saveGameFilePath);
    } catch (error) {
      console.error('Failed to check save game:', error);
      return false;
    }
  });

  ipcMain.handle(GET_APP_VERSION_CHANNEL, (): GetAppVersionResponse => {
    return app.getVersion();
  });

  ipcMain.on(LOG_MESSAGE_CHANNEL, (_event, request: LogMessageRequest) => {
    appendMainLog(app, request.level, request.message, request.context);
  });

  ipcMain.handle(GET_OS_BUILD_INFO_CHANNEL, (): GetOsBuildInfoResponse => {
    return {
      platform: process.platform,
      release: os.release(),
      arch: process.arch,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      bun: process.versions.bun,
    };
  });

  ipcMain.handle(GET_DISPLAY_OPTIONS_CHANNEL, (): GetDisplayOptionsResponse => {
    return screen.getAllDisplays().map((display, index): DisplayOption => ({
      id: display.id,
      label: getDisplayLabel(display, index),
      bounds: {
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
      },
      isPrimary: display.id === screen.getPrimaryDisplay().id,
    }));
  });

  ipcMain.handle(APPLY_VIDEO_MODE_CHANNEL, (_event, request: ApplyVideoModeRequest): ApplyVideoModeResponse => {
    try {
      if (!mainWindow || mainWindow.isDestroyed()) {
        return { ok: false, error: 'Main window is not available' };
      }

      const display = screen.getAllDisplays().find((candidate) => candidate.id === request.displayId) ?? screen.getPrimaryDisplay();

      if (request.mode === 'fullscreen') {
        mainWindow.setBounds(display.bounds);
        mainWindow.setFullScreen(true);
        return { ok: true };
      }

      mainWindow.setFullScreen(false);

      const width = Math.min(1600, display.workArea.width);
      const height = Math.min(900, display.workArea.height);
      const x = Math.round(display.workArea.x + (display.workArea.width - width) / 2);
      const y = Math.round(display.workArea.y + (display.workArea.height - height) / 2);

      mainWindow.setBounds({ x, y, width, height });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to apply video mode',
      };
    }
  });

  ipcMain.handle(OPEN_EXTERNAL_URL_CHANNEL, async (_event, request: OpenExternalUrlRequest): Promise<OpenExternalUrlResponse> => {
    try {
      const target = new URL(request.url);
      if (!['https:', 'http:'].includes(target.protocol)) {
        return { ok: false, error: 'Only HTTP/HTTPS URLs are allowed' };
      }

      await shell.openExternal(target.toString());
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to open URL',
      };
    }
  });

  const savesDir = join(app.getPath('userData'), 'saves');
  if (!existsSync(savesDir)) {
    mkdirSync(savesDir, { recursive: true });
  }

  ipcMain.handle(LIST_SAVES_CHANNEL, async (): Promise<ListSavesResponse> => {
    try {
      const files = readdirSync(savesDir).filter(f => f.endsWith('.json'));
      const saves = [];
      for (const file of files) {
        const filePath = join(savesDir, file);
        const content = readFileSync(filePath, 'utf8');
        try {
          const data = JSON.parse(content);
          if (data && data.meta) {
            saves.push({
              filename: file,
              playerName: data.meta.playerName || 'Unknown',
              createdAt: data.meta.createdAt,
              updatedAt: data.meta.updatedAt
            });
          }
        } catch {
          // ignore corrupted saves in list
        }
      }
      return saves.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
  });

  ipcMain.handle(CREATE_SAVE_CHANNEL, async (_event, request: CreateSaveRequest): Promise<CreateSaveResponse> => {
    try {
      const date = new Date();
      const dateString = date.toISOString().replace(/[:.]/g, '-');
      const filename = `${request.playerName.replace(/[^a-zA-Z0-9_-]/g, '')}_${dateString}.json`;
      const filePath = join(savesDir, filename);

      const newSave = {
        version: 1,
        meta: {
          version: 1,
          playerName: request.playerName,
          createdAt: date.toISOString(),
          updatedAt: date.toISOString()
        },
        network: {
          nodes: [],
          edges: []
        },
        simulation: {
          trains: [],
          tickCount: 0
        }
      };

      await writeJson(filePath, newSave);
      return { ok: true, filename };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  });

  ipcMain.handle(DELETE_SAVE_CHANNEL, async (_event, request: DeleteSaveRequest): Promise<DeleteSaveResponse> => {
    try {
      const filePath = join(savesDir, request.filename);
      unlinkSync(filePath);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  });

  ipcMain.handle(LOAD_SAVE_CHANNEL, async (_event, request: LoadSaveRequest): Promise<LoadSaveResponse> => {
    try {
      const filePath = join(savesDir, request.filename);
      const data = await readJson<unknown>(filePath);
      
      // Update last played time
      if (data && typeof data === 'object' && 'meta' in data) {
        const d = data as { meta: { updatedAt: string } };
        if (d.meta) {
          d.meta.updatedAt = new Date().toISOString();
          await writeJson(filePath, data);
        }
      }
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  });

  registerAppControlIpc(() => mainWindow);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
