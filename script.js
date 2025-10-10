document.addEventListener('DOMContentLoaded', function () {
    const appContainer = document.getElementById('app-container');
    const splashScreen = document.getElementById('splash-screen');

    // Show splash screen for 5 seconds
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
    }, 5000);

    function initializePlayer() {
        const video = document.getElementById('video-player');
        const playerContainer = document.getElementById('player-container');
        const channelList = document.getElementById('channel-list');
        const searchInput = document.getElementById('search-input');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        let channelItems; // Will be populated after dynamic addition
        let hls = new Hls();
        let controlsTimeout;

        function updateChannelList() {
            channelItems = document.querySelectorAll('.channel-item');
        }

        function playChannel(url) {
            if (Hls.isSupported()) {
                hls.destroy();
                hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(e => console.error("Autoplay was prevented.", e));
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        console.error('HLS fatal error:', data);
                        // Try to recover or notify user
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(e => console.error("Autoplay was prevented.", e));
                });
            }
        }

        function setActiveChannel(channelElement) {
            if (channelItems) {
                channelItems.forEach(item => item.classList.remove('active'));
            }
            if (channelElement) {
                channelElement.classList.add('active');
            }
        }

        function toggleFullScreen() {
            if (!document.fullscreenElement) {
                if (playerContainer.requestFullscreen) {
                    playerContainer.requestFullscreen();
                } else if (playerContainer.webkitRequestFullscreen) { /* Safari */
                    playerContainer.webkitRequestFullscreen();
                } else if (playerContainer.msRequestFullscreen) { /* IE11 */
                    playerContainer.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
            }
        }
        
        function updateFullscreenButton() {
            if (document.fullscreenElement === playerContainer) {
                playerContainer.classList.add('fullscreen-active');
                fullscreenBtn.classList.remove('enter-fullscreen');
                fullscreenBtn.classList.add('exit-fullscreen');
                fullscreenBtn.title = "Quitter le plein écran";
            } else {
                playerContainer.classList.remove('fullscreen-active');
                playerContainer.classList.remove('user-active');
                fullscreenBtn.classList.remove('exit-fullscreen');
                fullscreenBtn.classList.add('enter-fullscreen');
                fullscreenBtn.title = "Plein écran";
            }
        }

        fullscreenBtn.addEventListener('click', toggleFullScreen);
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('msfullscreenchange', updateFullscreenButton);

        playerContainer.addEventListener('mousemove', () => {
            if (document.fullscreenElement === playerContainer) {
                playerContainer.classList.add('user-active');
                clearTimeout(controlsTimeout);
                controlsTimeout = setTimeout(() => {
                    playerContainer.classList.remove('user-active');
                }, 3000);
            }
        });

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

        // Populate channelItems for the first time
        updateChannelList();

        // Load the first channel by default
        if (channelItems && channelItems.length > 0) {
            const firstChannel = channelItems[0];
            const firstChannelUrl = firstChannel.dataset.src;
            playChannel(firstChannelUrl);
            setActiveChannel(firstChannel);
        }

        // Initial state for fullscreen button
        updateFullscreenButton();
    }
});