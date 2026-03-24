export const APP_CONTROL_CHANNEL = 'app:control' as const;

export const SAVE_LANGUAGE_CHANNEL = 'save-language' as const;
export const LOAD_LANGUAGE_CHANNEL = 'load-language' as const;
export const HAS_SAVE_GAME_CHANNEL = 'has-save-game' as const;
export const GET_APP_VERSION_CHANNEL = 'get-app-version' as const;
export const GET_OS_BUILD_INFO_CHANNEL = 'get-os-build-info' as const;
export const GET_DISPLAY_OPTIONS_CHANNEL = 'get-display-options' as const;
export const APPLY_VIDEO_MODE_CHANNEL = 'apply-video-mode' as const;
export const OPEN_EXTERNAL_URL_CHANNEL = 'open-external-url' as const;

export const LIST_SAVES_CHANNEL = 'list-saves' as const;
export const CREATE_SAVE_CHANNEL = 'create-save' as const;
export const DELETE_SAVE_CHANNEL = 'delete-save' as const;
export const LOAD_SAVE_CHANNEL = 'load-save' as const;

export type SaveFileMeta = {
        filename: string;
        playerName: string;
        createdAt: string;
        updatedAt: string;
};

export type ListSavesResponse = SaveFileMeta[];

export type CreateSaveRequest = {
        playerName: string;
};

export type CreateSaveResponse =
        | { ok: true; filename: string }
        | { ok: false; error: string };

export type DeleteSaveRequest = {
        filename: string;
};

export type DeleteSaveResponse =
        | { ok: true }
        | { ok: false; error: string };

export type LoadSaveRequest = {
        filename: string;
};

export type LoadSaveResponse =
        | { ok: true; data: unknown }
        | { ok: false; error: string };

export const SUPPORTED_LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const isLanguage = (value: unknown): value is Language => {
	return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language);
};

export type SaveLanguageRequest = {
	language: Language;
};

export type SaveLanguageResponse =
	| {
			ok: true;
	  }
	| {
			ok: false;
			error: string;
	  };

export type LoadLanguageResponse = Language;
export type HasSaveGameResponse = boolean;
export type GetAppVersionResponse = string;

export type OsBuildInfo = {
	platform: string;
	release: string;
	arch: string;
	electron: string;
	chrome: string;
	node: string;
	bun?: string;

};

export type GetOsBuildInfoResponse = OsBuildInfo;

export type DisplayOption = {
	id: number;
	label: string;
	bounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	isPrimary: boolean;
};

export type GetDisplayOptionsResponse = DisplayOption[];

export type VideoMode = 'fullscreen' | 'windowed';

export type ApplyVideoModeRequest = {
	mode: VideoMode;
	displayId: number;
};

export type ApplyVideoModeResponse =
	| {
			ok: true;
	  }
	| {
			ok: false;
			error: string;
	  };

export type OpenExternalUrlRequest = {
	url: string;
};

export type OpenExternalUrlResponse =
	| {
			ok: true;
	  }
	| {
			ok: false;
			error: string;
	  };

export type AppControlRequest = {
	type: 'app/quit';
};

export type AppControlResponse =
	| {
			ok: true;
		}
	| {
			ok: false;
			error: string;
		};
