/* @tweakable HLS.js configuration options. See https://hls-js.com/docs/api-reference for details */
const hlsConfig = {
    startPosition: -1,
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    enableWorker: true,
};

let hls;

function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

function initializeHls() {
    const video = document.getElementById('videoPlayer');
    if (hls) {
        hls.destroy();
    }
    hls = new Hls(hlsConfig);
    hls.attachMedia(video);

    hls.on(Hls.Events.FRAG_LOADED, hideLoading);
    video.addEventListener('playing', hideLoading, { once: true });
    
    hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('Fatal network error, trying to recover');
                    hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error('Fatal media error, trying to recover');
                    hls.recoverMediaError();
                    break;
                default:
                    console.error('Unrecoverable error', data);
                    hls.destroy();
                    break;
            }
        }
    });
}

export function setHlsInstance(instance) {
    hls = instance;
}

export function playStream(url) {
    const video = document.getElementById('videoPlayer');
    if (!url) {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        video.src = '';
        video.load();
        hideLoading();
        return;
    }
    
    showLoading();
    if (Hls && Hls.isSupported()) {
        if (!hls) {
            initializeHls();
        }
        hls.loadSource(url);
        hls.once(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(error => {
                console.warn("Autoplay was prevented:", error);
                hideLoading();
            });
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
            video.play().catch(error => console.warn("Autoplay was prevented:", error));
        }, { once: true });
        video.addEventListener('playing', hideLoading, { once: true });
    } else {
        console.error("HLS is not supported in this browser.");
        alert("Your browser does not support HLS playback.");
        hideLoading();
    }
}

