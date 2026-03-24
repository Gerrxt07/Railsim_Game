import { contextBridge, ipcRenderer } from 'electron';
import { exposeAppControl } from './ipc/app-control';
import {
  APPLY_VIDEO_MODE_CHANNEL,
  type ApplyVideoModeRequest,
  type ApplyVideoModeResponse,
  GET_APP_VERSION_CHANNEL,
  GET_DISPLAY_OPTIONS_CHANNEL,
  GET_OS_BUILD_INFO_CHANNEL,
  type GetDisplayOptionsResponse,
  type GetOsBuildInfoResponse,
  HAS_SAVE_GAME_CHANNEL,
  LOAD_LANGUAGE_CHANNEL,
  OPEN_EXTERNAL_URL_CHANNEL,
  type OpenExternalUrlRequest,
  type OpenExternalUrlResponse,
  SAVE_LANGUAGE_CHANNEL,
  type GetAppVersionResponse,
  type HasSaveGameResponse,
  type Language,
  type LoadLanguageResponse,
  type SaveLanguageRequest,
  type SaveLanguageResponse,
  LIST_SAVES_CHANNEL,
  CREATE_SAVE_CHANNEL,
  DELETE_SAVE_CHANNEL,
  LOAD_SAVE_CHANNEL,
  type ListSavesResponse,
  type CreateSaveRequest,
  type CreateSaveResponse,
  type DeleteSaveRequest,
  type DeleteSaveResponse,
  type LoadSaveRequest,
  type LoadSaveResponse,
} from '../shared';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  saveLanguage: (language: Language): Promise<SaveLanguageResponse> =>
        ipcRenderer.invoke(SAVE_LANGUAGE_CHANNEL, { language } satisfies SaveLanguageRequest),
  loadLanguage: (): Promise<LoadLanguageResponse> => ipcRenderer.invoke(LOAD_LANGUAGE_CHANNEL),
  hasSaveGame: (): Promise<HasSaveGameResponse> => ipcRenderer.invoke(HAS_SAVE_GAME_CHANNEL),
  getAppVersion: (): Promise<GetAppVersionResponse> => ipcRenderer.invoke(GET_APP_VERSION_CHANNEL),
  getOsBuildInfo: (): Promise<GetOsBuildInfoResponse> => ipcRenderer.invoke(GET_OS_BUILD_INFO_CHANNEL),
  getDisplayOptions: (): Promise<GetDisplayOptionsResponse> => ipcRenderer.invoke(GET_DISPLAY_OPTIONS_CHANNEL),
  applyVideoMode: (request: ApplyVideoModeRequest): Promise<ApplyVideoModeResponse> =>
        ipcRenderer.invoke(APPLY_VIDEO_MODE_CHANNEL, request),
  openExternalUrl: (request: OpenExternalUrlRequest): Promise<OpenExternalUrlResponse> =>
        ipcRenderer.invoke(OPEN_EXTERNAL_URL_CHANNEL, request),
  listSaves: (): Promise<ListSavesResponse> => ipcRenderer.invoke(LIST_SAVES_CHANNEL),
  createSave: (playerName: string): Promise<CreateSaveResponse> => ipcRenderer.invoke(CREATE_SAVE_CHANNEL, { playerName } satisfies CreateSaveRequest),
  deleteSave: (filename: string): Promise<DeleteSaveResponse> => ipcRenderer.invoke(DELETE_SAVE_CHANNEL, { filename } satisfies DeleteSaveRequest),
  loadSave: (filename: string): Promise<LoadSaveResponse> => ipcRenderer.invoke(LOAD_SAVE_CHANNEL, { filename } satisfies LoadSaveRequest),
});

exposeAppControl();
