import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(currentDir, '..');
const baseDir = resolve(rootDir, 'dist');
const outputDir = resolve(baseDir, 'security');
const outputFile = resolve(outputDir, 'asar-integrity.json');

const resolveExistingFile = (fileCandidates) => {
  for (const candidate of fileCandidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Missing protected build file: ${fileCandidates.join(' or ')}`);
};

const protectedFiles = [
  resolve(baseDir, 'main/index.js'),
  resolveExistingFile([
    resolve(baseDir, 'preload/index.cjs'),
    resolve(baseDir, 'preload/index.mjs')
  ]),
  resolve(baseDir, 'security/runtime-integrity.jsc'),
  resolve(baseDir, 'security/runtime-integrity.cjs')
];

const hashFile = (filePath) => createHash('sha256').update(readFileSync(filePath)).digest('hex');

const files = {};

for (const absoluteFile of protectedFiles) {
  if (!existsSync(absoluteFile)) {
    throw new Error(`Missing protected build file: ${absoluteFile}`);
  }

  const relPath = relative(rootDir, absoluteFile).replace(/\\/g, '/');
  files[relPath] = hashFile(absoluteFile);
}

mkdirSync(outputDir, { recursive: true });

writeFileSync(
  outputFile,
  JSON.stringify(
    {
      algorithm: 'sha256',
      generatedAt: new Date().toISOString(),
      files
    },
    null,
    2
  )
);

console.log(`Wrote integrity manifest: ${outputFile}`);
