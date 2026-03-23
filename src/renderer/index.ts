// Renderer process entry point (base template)
import './index.css';

const APP_MOUNT_ID = 'template-app';

const setBootMessage = (message: string): void => {
	const mount = document.getElementById(APP_MOUNT_ID);
	if (!mount) return;

	mount.textContent = message;
};

const initializeTemplate = (): void => {
	setBootMessage('Base template ready. Replace this screen with your next game flow.');
	console.log('Renderer initialized in base template mode.');
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeTemplate, { once: true });
} else {
	initializeTemplate();
}
