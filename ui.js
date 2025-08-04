function playChannel(player, url) {
    if (!url) {
        console.error("URL de la chaîne non valide.");
        return;
    }
    player.src({
        src: url,
        type: 'application/x-mpegURL'
    });
    player.play().catch(e => console.warn("Autoplay was prevented.", e));
}

function setActiveChannel(channelItems, channelElement) {
    if (channelItems) {
        channelItems.forEach(item => item.classList.remove('active'));
    }
    if (channelElement) {
        channelElement.classList.add('active');
        channelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

export function initializeUI(channels, player) {
    const channelListContainer = document.getElementById('channel-list');
    const searchInput = document.getElementById('search-input');

    let channelItemsHTML = '';
    for (const channel of channels) {
        channelItemsHTML += `
            <div class="channel-item" data-src="${channel.src}">
                <img src="${channel.logo}" alt="Logo ${channel.name}" onerror="this.style.display='none'">
                <span>${channel.name}</span>
            </div>
        `;
    }
    channelListContainer.innerHTML = channelItemsHTML;
    const channelItems = document.querySelectorAll('.channel-item');

    /* @tweakable Background color of the active channel */
    const activeChannelColor = "#007bff";
    document.documentElement.style.setProperty('--active-channel-bg-color', activeChannelColor);

    channelListContainer.addEventListener('click', function(e) {
        const channelItem = e.target.closest('.channel-item');
        if (channelItem) {
            const url = channelItem.dataset.src;
            playChannel(player, url);
            setActiveChannel(channelItems, channelItem);
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
    if (channels && channels.length > 0) {
        const firstChannel = channels[0];
        const firstChannelElement = channelItems[0];
        playChannel(player, firstChannel.src);
        setActiveChannel(channelItems, firstChannelElement);
    }
}

