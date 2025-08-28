import { channels } from './data.js';
import * as ui from './ui.js';
import * as player from './player.js';
import * as comments from './comments.js';

/**
 * Filters channels based on the search input and re-renders the channel grid.
 */
function filterChannels() {
    const searchTerm = ui.searchInput.value.toLowerCase();
    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm) ||
        channel.category.toLowerCase().includes(searchTerm) ||
        channel.country.toLowerCase().includes(searchTerm)
    );
    ui.renderChannels(filteredChannels, player.openPlayer);
}

/**
 * Initializes the application, sets up event listeners, and renders the initial view.
 */
function initialize() {
    comments.init();
    ui.renderChannels(channels, player.openPlayer);
    
    // Setup event listeners
    ui.searchInput.addEventListener('input', filterChannels);
    ui.closeModalBtn.addEventListener('click', player.closeModal);
    ui.modal.addEventListener('click', (e) => {
        if (e.target === ui.modal) {
            player.closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !ui.modal.classList.contains('hidden')) {
            player.closeModal();
        }
    });
    comments.setupEventListeners();
    player.setupPlayerEventListeners();
}

// Splash screen and app startup logic
window.addEventListener('load', () => {
    setTimeout(() => {
        ui.splashScreen.style.opacity = '0';
        setTimeout(() => {
            ui.splashScreen.style.display = 'none';
        }, 500);
    }, 2000);

    initialize();
});