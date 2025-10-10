document.addEventListener('DOMContentLoaded', function () {
    const appContainer = document.getElementById('app-container');
    const splashScreen = document.getElementById('splash-screen');

    /* @tweakable Duration of the splash screen in milliseconds */
    const splashScreenDuration = 5000;

    // Show splash screen
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

        // Initialize the player after the splash screen
        initializePlayer();
    }, splashScreenDuration);

    function initializePlayer() {
        const videoEl = document.getElementById('video-player');
        const channelList = document.getElementById('channel-list');
        const searchInput = document.getElementById('search-input');
        const channelItems = document.querySelectorAll('.channel-item');
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
                // Remove buttons you don't need
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
            }
        };

        const player = videojs(videoEl, playerOptions, function onPlayerReady() {
            console.log('Video.js player is ready');
            
            // Move the logo inside the player element to keep it in fullscreen
            if (logo) {
                this.el().appendChild(logo);
                // Apply tweakable styles
                logo.style.top = `${logoTop}px`;
                logo.style.left = `${logoLeft}px`;
                logo.style.zIndex = logoZIndex;
            }

            this.on('error', function() {
                const error = this.error();
                console.error('Video.js Error:', error.code, error.message);
            });
        });

        function playChannel(url) {
            player.src({
                src: url,
                type: 'application/x-mpegURL' // Specify HLS content type
            });
            player.play().catch(e => console.warn("Autoplay was prevented.", e));
        }

        function setActiveChannel(channelElement) {
            if (channelItems) {
                channelItems.forEach(item => item.classList.remove('active'));
            }
            if (channelElement) {
                channelElement.classList.add('active');
                channelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        channelList.addEventListener('click', function(e) {
            const channelItem = e.target.closest('.channel-item');
            if (channelItem) {
                const url = channelItem.dataset.src;
                if (url) {
                    playChannel(url);
                    setActiveChannel(channelItem);
                }
            }
        });

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            channelItems.forEach(item => {
                const channelName = item.querySelector('span').textContent.toLowerCase();
                if (channelName.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Load the first channel by default
        if (channelItems && channelItems.length > 0) {
            const firstChannel = channelItems[0];
            const firstChannelUrl = firstChannel.dataset.src;
            playChannel(firstChannelUrl);
            setActiveChannel(firstChannel);
        }
    }
});