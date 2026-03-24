import './index.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { logger } from './utils/logger';

window.addEventListener('error', (event) => {
  logger.error(`Uncaught Error: ${event.message} at ${event.filename}:${event.lineno}`, 'renderer');
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error(`Unhandled Promise Rejection: ${event.reason}`, 'renderer');
});

logger.info('Renderer app starting...', 'renderer');

const appTarget = document.getElementById('app');

if (!appTarget) {
  throw new Error('Konnte Mount-Point #app nicht finden!');
}

// Svelte 5 Mount-Syntax
const app = mount(App, {
  target: appTarget
});

export default app;