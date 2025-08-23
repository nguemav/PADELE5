import * as ui from './ui.js';
import { loadComments } from './comments.js';

let hls;

/**
 * Sets up and plays a video stream using HLS.js or native playback.
 * @param {string} streamUrl - The URL of the video stream.
 */
export function playStream(streamUrl) {
    if (hls) {
        hls.destroy();
    }
    
    ui.audioTrackControls.classList.add('hidden');
    ui.audioTrackButtonsContainer.innerHTML = '';

    if (streamUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(ui.videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                ui.videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
            });
            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                setupAudioTracks(hls);
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                   console.error('HLS fatal error:', data);
                }
            });
        } else if (ui.videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            ui.videoPlayer.src = streamUrl;
            ui.videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
        }
    } else {
        ui.videoPlayer.src = streamUrl;
        ui.videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
    }
}

/**
 * Sets up audio track selection buttons if multiple tracks are available.
 * @param {Hls} hlsInstance - The HLS.js instance.
 */
function setupAudioTracks(hlsInstance) {
    if (!hlsInstance || hlsInstance.audioTracks.length <= 1) {
        ui.audioTrackControls.classList.add('hidden');
        ui.audioTrackButtonsContainer.innerHTML = '';
        return;
    }

    ui.audioTrackButtonsContainer.innerHTML = '';
    ui.audioTrackControls.classList.remove('hidden');

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
        ui.audioTrackButtonsContainer.appendChild(btn);
    });
}

/**
 * Opens the video player modal for a given channel.
 * @param {Object} channel - The channel object to play.
 */
export async function openPlayer(channel) {
    ui.playerChannelTitle.textContent = channel.name;
    ui.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    ui.streamButtonsContainer.innerHTML = '';
    ui.audioTrackControls.classList.add('hidden');
    ui.audioTrackButtonsContainer.innerHTML = '';
    ui.commentsContainer.innerHTML = '';

    channel.streams.forEach((streamUrl, index) => {
        const btn = document.createElement('button');
        btn.className = 'stream-btn';
        btn.textContent = `Source ${index + 1}`;
        btn.addEventListener('click', () => {
            playStream(streamUrl);
            document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        ui.streamButtonsContainer.appendChild(btn);
    });

    if (channel.streams.length > 0) {
        ui.streamButtonsContainer.firstChild.click();
    }
    
    await loadComments();
}

/**
 * Closes the video player modal and stops the video.
 */
export function closeModal() {
    ui.modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (hls) {
        hls.destroy();
    }
    ui.videoPlayer.pause();
    ui.videoPlayer.src = '';
    ui.audioTrackControls.classList.add('hidden');
    ui.audioTrackButtonsContainer.innerHTML = '';
    ui.commentsContainer.innerHTML = '';
    ui.imagePreviewsContainer.innerHTML = '';
}