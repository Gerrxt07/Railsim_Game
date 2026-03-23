import './index.css';
import { mount } from 'svelte';
import App from './App.svelte';

const appTarget = document.getElementById('app');

if (!appTarget) {
  throw new Error('Konnte Mount-Point #app nicht finden!');
}

// Svelte 5 Mount-Syntax
const app = mount(App, {
  target: appTarget
});

export default app;