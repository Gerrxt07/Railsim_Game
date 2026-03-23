const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');

const resolveElectronBinaryPath = (context) => {
  const { appOutDir, electronPlatformName, packager } = context;
  const productFilename = packager?.appInfo?.productFilename;
  const executableName = packager?.executableName || productFilename;

  if (!appOutDir || !electronPlatformName || !productFilename || !executableName) {
    throw new Error('Missing required packaging context to resolve Electron binary path.');
  }

  const candidates = [];

  if (electronPlatformName === 'win32') {
    candidates.push(
      join(appOutDir, `${executableName}.exe`),
      join(appOutDir, `${productFilename}.exe`)
    );
  } else if (electronPlatformName === 'darwin') {
    candidates.push(
      join(appOutDir, `${productFilename}.app`, 'Contents', 'MacOS', productFilename),
      join(appOutDir, `${executableName}.app`, 'Contents', 'MacOS', executableName)
    );
  } else {
    candidates.push(join(appOutDir, executableName), join(appOutDir, productFilename));
  }

  const binaryPath = candidates.find((candidate) => existsSync(candidate));
  if (!binaryPath) {
    throw new Error(`Unable to resolve Electron binary path. Checked: ${candidates.join(', ')}`);
  }

  return binaryPath;
};

module.exports = async (context) => {
  const binaryPath = resolveElectronBinaryPath(context);

  await flipFuses(binaryPath, {
    version: FuseVersion.V1,
    strictlyRequireAllFuses: true,
    resetAdHocDarwinSignature: context.electronPlatformName === 'darwin',
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
    [FuseV1Options.OnlyLoadAppFromAsar]: false,
    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,
    [FuseV1Options.GrantFileProtocolExtraPrivileges]: false
  });

  console.log(`[security] Electron fuses hardened for ${context.electronPlatformName}: ${binaryPath}`);
};
