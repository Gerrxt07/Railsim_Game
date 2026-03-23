const { createHash } = require('node:crypto');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const hashFile = (filePath) => {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex');
};

const verifyAsarUnpackIntegrity = (baseDir, manifestRelativePath = 'dist/security/asar-integrity.json') => {
  const manifestPath = join(baseDir, manifestRelativePath);

  if (!existsSync(manifestPath)) {
    return { ok: false, reason: `Integrity manifest not found: ${manifestPath}` };
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? `Failed to parse manifest: ${error.message}` : 'Failed to parse manifest'
    };
  }

  const files = manifest && typeof manifest === 'object' && manifest.files && typeof manifest.files === 'object'
    ? manifest.files
    : null;

  if (!files || Object.keys(files).length === 0) {
    return { ok: false, reason: 'Integrity manifest has no files' };
  }

  for (const [relativePath, expectedHash] of Object.entries(files)) {
    if (typeof expectedHash !== 'string' || expectedHash.length === 0) {
      return { ok: false, reason: `Invalid hash entry for ${relativePath}` };
    }

    const absolutePath = join(baseDir, relativePath);
    if (!existsSync(absolutePath)) {
      return { ok: false, reason: `Missing protected file: ${relativePath}`, failedFile: relativePath };
    }

    const actualHash = hashFile(absolutePath);
    if (actualHash !== expectedHash) {
      return { ok: false, reason: `Hash mismatch for ${relativePath}`, failedFile: relativePath };
    }
  }

  return { ok: true };
};

module.exports = {
  verifyAsarUnpackIntegrity
};
