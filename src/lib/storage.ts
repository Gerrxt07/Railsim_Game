import { access, readFile, writeFile } from 'node:fs/promises';

const getBun = (): typeof Bun | null => {
	const maybeBun = (globalThis as { Bun?: typeof Bun }).Bun;
	return typeof maybeBun === 'undefined' ? null : maybeBun;
};

export const writeJson = async (filePath: string, data: unknown): Promise<void> => {
	const bun = getBun();
	const payload = JSON.stringify(data);

	if (bun) {
		await bun.write(filePath, payload);
		return;
	}

	await writeFile(filePath, payload, 'utf8');
};

export const readJson = async <T>(filePath: string): Promise<T | null> => {
	const bun = getBun();

	if (bun) {
		const file = bun.file(filePath);
		if (!(await file.exists())) {
			return null;
		}
		return (await file.json()) as T;
	}

	try {
		const content = await readFile(filePath, 'utf8');
		return JSON.parse(content) as T;
	} catch (error) {
		if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}
		throw error;
	}
};

export const fileExists = async (filePath: string): Promise<boolean> => {
	const bun = getBun();
	if (bun) {
		return await bun.file(filePath).exists();
	}

	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
};
