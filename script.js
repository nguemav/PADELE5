document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('video-player');
    const channelList = document.getElementById('channel-list');
    const searchInput = document.getElementById('search-input');
    let channelItems; // Will be populated after dynamic addition
    let hls = new Hls();

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
});