import * as api from './api.js';
import * as ui from './ui.js';
import * as player from './player.js';
import * as comments from './comments.js';

// --- STATE ---
let allChannels = [];
let projectId;

// --- DOM ELEMENTS ---
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const splashScreen = document.getElementById('splash-screen');

// --- FUNCTIONS ---

/**
 * Main initialization function.
 */
async function init() {
    try {
        const project = await window.websim.getCurrentProject();
        projectId = project.id;
        comments.initializeComments(projectId);
    } catch (e) {
        console.error("Error getting project info:", e);
        // Continue without comment functionality if this fails
    }

    try {
        allChannels = await api.getChannels();
        ui.renderChannels(allChannels, onChannelClick);
    } catch (e) {
        console.error("Error loading channels:", e);
        ui.showChannelError();
    }
}

/**
 * Handles filtering channels based on search input.
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredChannels = allChannels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm) ||
        channel.category.toLowerCase().includes(searchTerm) ||
        channel.country.toLowerCase().includes(searchTerm)
    );
    ui.renderChannels(filteredChannels, onChannelClick);
}

/**
 * Handles clicking on a channel card to open the player.
 * @param {object} channel - The channel object to play.
 */
function onChannelClick(channel) {
    ui.openPlayerModal(channel);
    player.startPlayback(channel);
    comments.loadAndRenderComments(projectId);
}

/**
 * Closes the video player modal and cleans up resources.
 */
function closePlayerModal() {
    ui.closePlayerModal();
    player.destroyPlayer();
    comments.clearComments();
}

// --- EVENT LISTENERS ---

// Search input
searchInput.addEventListener('input', handleSearch);

// Modal close events
closeModalBtn.addEventListener('click', closePlayerModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closePlayerModal();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closePlayerModal();
    }
});

// Splash screen and initial load
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    }, 1500);

    init();
});