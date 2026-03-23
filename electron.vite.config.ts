import { defineConfig } from 'electron-vite';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';
import type { PluginOption } from 'vite';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      },
      outDir: 'dist/main'
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs'
        }
      },
      outDir: 'dist/preload'
    }
  },
  renderer: {
    root: 'src/renderer',
    publicDir: '../assets',
    plugins: (() => {
      const isProd = process.env.NODE_ENV === 'production';
      const enableObfuscation = process.env.NHG_OBFUSCATE === '1';
      const plugins: PluginOption[] = [
        svelte({
          configFile: resolve(__dirname, 'src/renderer/svelte.config.js')
        }),
        tailwindcss()
      ];

      if (isProd && enableObfuscation) {
        plugins.push(
          obfuscatorPlugin({
            options: {
              compact: true,
              stringArray: true,
              stringArrayThreshold: 0.75,
              identifierNamesGenerator: 'hexadecimal',
              sourceMap: false
            }
          })
        );
      }

      return plugins;
    })(),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      },
      outDir: 'dist/renderer'
    }
  }
});
