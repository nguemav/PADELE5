import * as ui from './ui.js';

let hls;
const videoPlayer = document.getElementById('video-player');

/**
 * Starts playback for a given channel.
 * @param {object} channel - The channel object.
 */
export function startPlayback(channel) {
    ui.setupStreamButtons(channel.streams, playStream);
}

/**
 * Plays a specific stream URL using HLS.js or native playback.
 * @param {string} streamUrl - The URL of the video stream.
 */
function playStream(streamUrl) {
    if (hls) {
        hls.destroy();
    }
    
    // Clear previous audio tracks
    ui.setupAudioTrackButtons(null);

    if (streamUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
            });
            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                ui.setupAudioTrackButtons(hls);
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                   console.error('HLS fatal error:', data);
                }
            });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = streamUrl;
            videoPlayer.addEventListener('loadedmetadata', () => {
                videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
            });
        }
    } else {
        // Fallback for non-HLS streams
        videoPlayer.src = streamUrl;
        videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
    }
}

/**
 * Destroys the HLS instance and stops the video.
 */
export function destroyPlayer() {
    if (hls) {
        hls.destroy();
        hls = null;
    }
    videoPlayer.pause();
    videoPlayer.src = '';
    videoPlayer.removeAttribute('src'); // Ensure it's fully cleared
}