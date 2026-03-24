/// <reference types="vite/client" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

interface Window {
        electronAPI?: {
                saveLanguage: (language: import("../shared").Language) => Promise<import("../shared").SaveLanguageResponse>;
                loadLanguage: () => Promise<import("../shared").LoadLanguageResponse>;
                hasSaveGame: () => Promise<import("../shared").HasSaveGameResponse>;
                getAppVersion: () => Promise<import("../shared").GetAppVersionResponse>;
                getOsBuildInfo: () => Promise<import("../shared").GetOsBuildInfoResponse>;
                getDisplayOptions: () => Promise<import("../shared").GetDisplayOptionsResponse>;
                applyVideoMode: (request: import("../shared").ApplyVideoModeRequest) => Promise<import("../shared").ApplyVideoModeResponse>;
                openExternalUrl: (request: import("../shared").OpenExternalUrlRequest) => Promise<import("../shared").OpenExternalUrlResponse>;
                listSaves: () => Promise<import("../shared").ListSavesResponse>;
                createSave: (playerName: string) => Promise<import("../shared").CreateSaveResponse>;
                deleteSave: (filename: string) => Promise<import("../shared").DeleteSaveResponse>;
                loadSave: (filename: string) => Promise<import("../shared").LoadSaveResponse>;
                logMessage: (request: import("../shared").LogMessageRequest) => void;
        };
        appControl?: {
                quit: () => Promise<import("../shared").AppControlResponse>;
        };
}
