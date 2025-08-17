import { defaultChannels } from 'channels';
import { parseM3u } from 'm3u-parser';
import { playStream } from 'player';
import { updateChannelListUI, setActiveChannel } from 'ui';

// --- Main script logic ---

/* @tweakable Delay in milliseconds before filtering the channel list after user input. */
const searchDebounceMs = 300;
/* @tweakable Key used to save the playlist in the browser's local storage. */
const localStorageKey = 'nguema5tv-playlist';

let channels = [];
let currentChannelIndex = -1;
let searchTimeout;

function savePlaylist(playlist) {
    try {
        localStorage.setItem(localStorageKey, JSON.stringify(playlist));
    } catch (error) {
        console.error("Could not save playlist to local storage:", error);
    }
}

function loadSavedPlaylist() {
    try {
        const savedPlaylist = localStorage.getItem(localStorageKey);
        if (savedPlaylist) {
            return JSON.parse(savedPlaylist);
        }
    } catch (error) {
        console.error("Could not load playlist from local storage:", error);
        localStorage.removeItem(localStorageKey);
    }
    return null;
}

function setPlaylist(newChannels) {
    channels = newChannels;
    savePlaylist(channels);
    const searchInput = document.getElementById('search-input');
    updateChannelListUI(channels, searchInput.value || '');
    if (channels.length > 0) {
        playChannel(0);
    } else {
        playStream(null); 
        setActiveChannel(-1); 
    }
}

function playChannel(index) {
    if (index < 0 || index >= channels.length) return;
    
    currentChannelIndex = index;
    const channel = channels[index];
    playStream(channel.url);
    setActiveChannel(index);
}

function loadInitialPlaylist() {
    const savedChannels = loadSavedPlaylist();
    if (Array.isArray(savedChannels) && savedChannels.length > 0) {
        channels = savedChannels;
    } else {
        channels = defaultChannels || [];
        if (savedChannels === null) {
             savePlaylist(channels);
        }
    }
    updateChannelListUI(channels, '');
    if (channels.length > 0) {
        playChannel(0); // Autoplay the first channel
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const prevChannelBtn = document.getElementById('prev-channel');
    const nextChannelBtn = document.getElementById('next-channel');
    const channelListContainer = document.getElementById('channel-list-container');
    const m3uFileInput = document.getElementById('m3u-file-input');
    const loadM3uBtn = document.getElementById('load-m3u-btn');

    m3uFileInput.addEventListener('change', () => {
        loadM3uBtn.disabled = m3uFileInput.files.length === 0;
    });

    loadM3uBtn.addEventListener('click', () => {
        const file = m3uFileInput.files[0];
        if (!file) {
            alert("Please select an M3U file first.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            try {
                const newChannels = parseM3u(content);
                if (newChannels.length > 0) {
                    setPlaylist(newChannels);
                    alert(`${newChannels.length} channels loaded successfully.`);
                } else {
                    alert("No valid channels found in the playlist.");
                }
            } catch(e) {
                console.error("Failed to parse M3U file:", e);
                alert("Error parsing M3U file. Please check the file format and console for details.");
            }
        };
        reader.onerror = () => {
            alert("Error reading file.");
        };
        reader.readAsText(file);
    });

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateChannelListUI(channels, searchInput.value);
            setActiveChannel(currentChannelIndex);
        }, searchDebounceMs);
    });

    prevChannelBtn.addEventListener('click', () => {
        if (channels.length === 0) return;
        let newIndex = currentChannelIndex - 1;
        if (newIndex < 0) {
            newIndex = channels.length - 1;
        }
        playChannel(newIndex);
    });

    nextChannelBtn.addEventListener('click', () => {
        if (channels.length === 0) return;
        let newIndex = currentChannelIndex + 1;
        if (newIndex >= channels.length) {
            newIndex = 0;
        }
        playChannel(newIndex);
    });

    channelListContainer.addEventListener('channel-click', (event) => {
        const { index } = event.detail;
        if (typeof index === 'number') {
            playChannel(index);
        }
    });

    loadM3uBtn.disabled = true;
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadInitialPlaylist();
    setupEventListeners();
});