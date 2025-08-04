export function initializePlayer() {
    const videoEl = document.getElementById('video-player');
    const logo = document.getElementById('logo');

    /* @tweakable Vertical position of the logo in pixels */
    const logoTop = 20;
    /* @tweakable Horizontal position of the logo in pixels */
    const logoLeft = 20;
    /* @tweakable Stacking order of the logo */
    const logoZIndex = 20;

    /* @tweakable Video.js player options */
    const playerOptions = {
        autoplay: true,
        controls: true,
        preload: 'auto',
        fluid: true, // Makes the player responsive
        liveui: true,
        controlBar: {
            children: [
                'playToggle',
                'liveDisplay',
                'volumePanel',
                'currentTimeDisplay',
                'timeDivider',
                'durationDisplay',
                'progressControl',
                'qualitySelector',
                'fullscreenToggle',
            ]
        },
        html5: {
            hls: {
                /* @tweakable Desired buffer length in seconds. A higher value can help prevent audio/video stutter on unstable connections. */
                goalBufferLength: 30,
                /* @tweakable Maximum desired buffer length in seconds. Limits how much the player buffers ahead. */
                maxGoalBufferLength: 60,
                overrideNative: true
            }
        }
    };

    const player = videojs(videoEl, playerOptions, function onPlayerReady() {
        console.log('Video.js player is ready');

        if (logo) {
            this.el().appendChild(logo);
            logo.style.top = `${logoTop}px`;
            logo.style.left = `${logoLeft}px`;
            logo.style.zIndex = logoZIndex;
        }

        this.on('error', function() {
            const error = this.error();
            console.error('Video.js Error:', error);
            const errorDisplay = this.getChild('errorDisplay');
            if (errorDisplay) {
                errorDisplay.open();
                let errorMessage = `Erreur de lecture (Code: ${error.code}).`;
                if (error.message) {
                    errorMessage += ` Détail: ${error.message}`;
                }
                errorDisplay.el().querySelector('.vjs-modal-dialog-content').innerText = errorMessage;
            }
        });
    });

    return player;
}