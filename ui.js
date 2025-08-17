/**
 * @tweakable The fallback image to use when a channel logo is missing or fails to load.
 */
const fallbackLogo = 'logo.png';

export function updateChannelListUI(channels, filterText = '') {
    const channelListContainer = document.getElementById('channel-list-container');
    const statusMessage = document.getElementById('playlist-status-message');
    channelListContainer.innerHTML = '';
    const lowerCaseFilter = filterText.toLowerCase();
    
    const filteredChannels = channels.filter(channel => 
        channel.name.toLowerCase().includes(lowerCaseFilter)
    );

    if (filteredChannels.length === 0) {
        channelListContainer.innerHTML = '<div class="channel-item">No channels match your search.</div>';
        if (channels.length > 0) {
            statusMessage.textContent = `Showing 0 of ${channels.length} channels.`;
        } else {
            statusMessage.textContent = 'No channels loaded.';
        }
        return;
    }

    filteredChannels.forEach(channel => {
        const originalIndex = channels.findIndex(c => c.url === channel.url && c.name === channel.name);

        const channelDiv = document.createElement('div');
        channelDiv.className = 'channel-item';

        const logoImg = document.createElement('img');
        logoImg.src = channel.logo || fallbackLogo;
        logoImg.alt = `${channel.name} logo`;
        logoImg.className = 'channel-logo';
        logoImg.onerror = () => { logoImg.src = fallbackLogo; };
        channelDiv.appendChild(logoImg);
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = channel.name;
        channelDiv.appendChild(nameSpan);
        
        channelDiv.dataset.index = originalIndex;
        
        channelDiv.addEventListener('click', () => {
            const event = new CustomEvent('channel-click', { 
                detail: { index: originalIndex },
                bubbles: true
            });
            channelDiv.dispatchEvent(event);
        });
        channelListContainer.appendChild(channelDiv);
    });
     statusMessage.textContent = `Showing ${filteredChannels.length} of ${channels.length} channels.`;
}

export function setActiveChannel(index) {
    const channelListContainer = document.getElementById('channel-list-container');
    const activeItem = channelListContainer.querySelector('.channel-item.active');
    if (activeItem) activeItem.classList.remove('active');
    
    if (index === -1) return;

    const newItem = channelListContainer.querySelector(`.channel-item[data-index="${index}"]`);
    if (newItem) {
        newItem.classList.add('active');
        newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}