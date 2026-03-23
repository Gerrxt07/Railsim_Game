const { copyFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const bytenode = require('bytenode');

const rootDir = resolve(__dirname, '..');
const sourceFile = resolve(rootDir, 'scripts/runtime-integrity.cjs');
const outputDir = resolve(rootDir, 'dist/security');
const outputFile = resolve(outputDir, 'runtime-integrity.jsc');
const outputSourceFile = resolve(outputDir, 'runtime-integrity.cjs');

mkdirSync(outputDir, { recursive: true });

bytenode.compileFile({
  filename: sourceFile,
  output: outputFile
});

copyFileSync(sourceFile, outputSourceFile);

console.log(`Compiled bytecode: ${outputFile}`);
console.log(`Copied source: ${outputSourceFile}`);
