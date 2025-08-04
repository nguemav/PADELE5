import { channels } from 'channels';
import { initializePlayer } from './player.js';
import { initializeUI } from './ui.js';

document.addEventListener('DOMContentLoaded', function () {
    try {
        /* @tweakable CSS animation for the splash screen logo. Set to 'none' for a static logo. Example: 'pulse 2s infinite' */
        const splashAnimation = 'none';
        document.documentElement.style.setProperty('--splash-animation', splashAnimation);

        const appContainer = document.getElementById('app-container');
        const splashScreen = document.getElementById('splash-screen');

        /* @tweakable Duration of the splash screen in milliseconds */
        const splashScreenDuration = 3000;

        setTimeout(() => {
            if (splashScreen) {
                splashScreen.style.transition = 'opacity 0.5s ease-out';
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500); // Wait for transition to finish
            }
            if (appContainer) {
                appContainer.style.display = 'flex';
            }

            const player = initializePlayer();
            initializeUI(channels, player);

        }, splashScreenDuration);
    } catch (e) {
        console.error("Erreur critique lors de l'initialisation de l'application:", e);
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
                <h1>Erreur d'initialisation</h1>
                <p>Impossible de démarrer l'application. Vérifiez la console pour plus de détails.</p>
                <pre>${e.stack}</pre>
            </div>`;
        }
    }
});