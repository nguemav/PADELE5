const channelGrid = document.getElementById('channel-grid');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');
const modal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('video-player');
const playerChannelTitle = document.getElementById('player-channel-title');
const closeModalBtn = document.getElementById('close-modal-btn');
const streamButtonsContainer = document.getElementById('stream-buttons');
const audioTrackControls = document.getElementById('audio-track-controls');
const audioTrackButtonsContainer = document.getElementById('audio-track-buttons');
const splashScreen = document.getElementById('splash-screen');

let hls;

function renderChannels(channelList) {
    channelGrid.innerHTML = '';
    if (channelList.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }
    noResults.classList.add('hidden');

    channelList.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <div class="channel-logo-container">
                <img src="${channel.logo}" alt="${channel.name} Logo" class="channel-logo" loading="lazy">
            </div>
            <div class="channel-info">
                <h3 class="channel-name">${channel.name}</h3>
                <p class="channel-meta">${channel.category} &bull; ${channel.country}</p>
            </div>
        `;
        card.addEventListener('click', () => openPlayer(channel));
        channelGrid.appendChild(card);
    });
}

function filterChannels() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm) ||
        channel.category.toLowerCase().includes(searchTerm) ||
        channel.country.toLowerCase().includes(searchTerm)
    );
    renderChannels(filteredChannels);
}

function openPlayer(channel) {
    playerChannelTitle.textContent = channel.name;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    streamButtonsContainer.innerHTML = '';
    audioTrackControls.classList.add('hidden');
    audioTrackButtonsContainer.innerHTML = '';

    channel.streams.forEach((streamUrl, index) => {
        const btn = document.createElement('button');
        btn.className = 'stream-btn';
        btn.textContent = `Source ${index + 1}`;
        btn.addEventListener('click', () => {
            playStream(streamUrl);
            document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        streamButtonsContainer.appendChild(btn);
    });

    // Play the first stream by default
    if (channel.streams.length > 0) {
        streamButtonsContainer.firstChild.click();
    }
}

function playStream(streamUrl) {
    if (hls) {
        hls.destroy();
    }
    
    // Clear previous audio track buttons
    audioTrackControls.classList.add('hidden');
    audioTrackButtonsContainer.innerHTML = '';

    // Simple check for m3u8 extension
    if (streamUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
            });
            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                setupAudioTracks(hls);
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                   console.error('HLS fatal error:', data);
                }
            });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = streamUrl;
            videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
        }
    } else {
        // Fallback for non-HLS streams (e.g., Dailymotion embed links)
        videoPlayer.src = streamUrl;
        videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
    }
}

function setupAudioTracks(hlsInstance) {
    if (!hlsInstance || hlsInstance.audioTracks.length <= 1) {
        audioTrackControls.classList.add('hidden');
        audioTrackButtonsContainer.innerHTML = '';
        return;
    }

    audioTrackButtonsContainer.innerHTML = '';
    audioTrackControls.classList.remove('hidden');

    hlsInstance.audioTracks.forEach((track, index) => {
        const btn = document.createElement('button');
        btn.className = 'audio-track-btn';
        btn.textContent = track.lang || track.name || `Track ${index + 1}`;
        if (index === hlsInstance.audioTrack) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            hlsInstance.audioTrack = index;
            document.querySelectorAll('.audio-track-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        audioTrackButtonsContainer.appendChild(btn);
    });
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (hls) {
        hls.destroy();
    }
    videoPlayer.pause();
    videoPlayer.src = '';
    audioTrackControls.classList.add('hidden');
    audioTrackButtonsContainer.innerHTML = '';
}

// Event Listeners
searchInput.addEventListener('input', filterChannels);
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Splash screen logic
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500); // This should match the transition duration in CSS
    }, 5000); // 5 seconds

    // Initial render
    renderChannels(channels);
});