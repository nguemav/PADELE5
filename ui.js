import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- DOM ELEMENT CACHE ---
const channelGrid = document.getElementById('channel-grid');
const noResults = document.getElementById('no-results');
const modal = document.getElementById('video-modal');
const playerChannelTitle = document.getElementById('player-channel-title');
const streamButtonsContainer = document.getElementById('stream-buttons');
const audioTrackControls = document.getElementById('audio-track-controls');
const audioTrackButtonsContainer = document.getElementById('audio-track-buttons');
const commentsContainer = document.getElementById('comments-container');
const imagePreviewsContainer = document.getElementById('image-previews');
const commentInput = document.getElementById('comment-input');
const commentSubmitBtn = document.getElementById('comment-submit-btn');

// --- CHANNEL UI ---

/**
 * Renders the list of channel cards.
 * @param {Array} channelList - The array of channels to render.
 * @param {Function} onChannelClick - Callback function for when a channel is clicked.
 */
export function renderChannels(channelList, onChannelClick) {
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
        card.addEventListener('click', () => onChannelClick(channel));
        channelGrid.appendChild(card);
    });
}

/**
 * Displays an error message if channels fail to load.
 */
export function showChannelError() {
    channelGrid.innerHTML = '';
    noResults.textContent = 'Could not load channels. Please try again later.';
    noResults.classList.remove('hidden');
}


// --- PLAYER MODAL UI ---

/**
 * Opens and populates the player modal.
 * @param {object} channel - The channel object being opened.
 */
export function openPlayerModal(channel) {
    playerChannelTitle.textContent = channel.name;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the player modal and resets its UI elements.
 */
export function closePlayerModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    streamButtonsContainer.innerHTML = '';
    audioTrackControls.classList.add('hidden');
    audioTrackButtonsContainer.innerHTML = '';
    imagePreviewsContainer.innerHTML = '';
    commentInput.value = '';
}

/**
 * Creates and manages stream source selection buttons.
 * @param {Array<string>} streams - Array of stream URLs.
 * @param {Function} onStreamSelect - Callback for when a stream is selected.
 */
export function setupStreamButtons(streams, onStreamSelect) {
    streamButtonsContainer.innerHTML = '';
    streams.forEach((streamUrl, index) => {
        const btn = document.createElement('button');
        btn.className = 'stream-btn';
        btn.textContent = `Source ${index + 1}`;
        btn.addEventListener('click', () => {
            onStreamSelect(streamUrl);
            document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        streamButtonsContainer.appendChild(btn);
    });

    if (streams.length > 0) {
        streamButtonsContainer.firstChild.click();
    }
}

/**
 * Creates and manages audio track selection buttons.
 * @param {object} hlsInstance - The HLS.js instance.
 */
export function setupAudioTrackButtons(hlsInstance) {
    if (!hlsInstance || hlsInstance.audioTracks.length <= 1) {
        audioTrackControls.classList.add('hidden');
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

// --- COMMENTS UI ---

/**
 * Renders a single comment object into an HTML element.
 * @param {object} comment - The comment object.
 * @returns {HTMLElement} The rendered comment element.
 */
export function renderComment(comment) {
    const div = document.createElement('div');
    div.className = 'comment';
    div.id = `comment-${comment.id}`;
    const commentHtml = DOMPurify.sanitize(marked.parse(comment.raw_content));

    div.innerHTML = `
        <img src="${comment.author.avatar_url}" alt="${comment.author.username}" class="comment-avatar">
        <div class="comment-body">
            <div class="comment-author">${comment.author.username}</div>
            <div class="comment-content">${commentHtml}</div>
        </div>
    `;
    return div;
}

/**
 * Renders a list of comments, replacing the container's content.
 * @param {Array} commentsData - The array of comment data objects from the API.
 */
export function renderCommentList(commentsData) {
    commentsContainer.innerHTML = '';
    if (commentsData.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first!</p>';
    } else {
        commentsData.forEach(commentData => {
            const commentEl = renderComment(commentData.comment);
            commentsContainer.appendChild(commentEl);
        });
        scrollToBottom(commentsContainer);
    }
}

/**
 * Adds a new comment to the container.
 * @param {object} comment - The new comment to add.
 */
export function addNewComment(comment) {
    const noCommentsEl = commentsContainer.querySelector('p');
    if (noCommentsEl && noCommentsEl.textContent.startsWith('No comments')) {
        commentsContainer.innerHTML = '';
    }
    const newCommentEl = renderComment(comment);
    commentsContainer.appendChild(newCommentEl);
    scrollToBottom(commentsContainer);
}

/**
 * Clears the comments container.
 */
export function clearCommentsContainer() {
    commentsContainer.innerHTML = '';
}

/**
 * Displays image previews in the comment form.
 * @param {File[]} files - An array of files to preview.
 */
export function renderImagePreviews(files) {
    imagePreviewsContainer.innerHTML = '';
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-image-container';
            previewContainer.innerHTML = `
                <img src="${e.target.result}" class="preview-image" alt="Image preview">
                <button class="remove-preview-btn" data-index="${index}">&times;</button>
            `;
            imagePreviewsContainer.appendChild(previewContainer);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Toggles the state of the comment submission button.
 * @param {boolean} disabled - Whether the button should be disabled.
 * @param {string} text - The text to display on the button.
 */
export function setSubmitButtonState(disabled, text) {
    commentSubmitBtn.disabled = disabled;
    commentSubmitBtn.textContent = text;
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}