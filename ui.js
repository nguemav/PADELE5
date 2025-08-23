import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Element Selectors
export const channelGrid = document.getElementById('channel-grid');
export const searchInput = document.getElementById('search-input');
export const noResults = document.getElementById('no-results');
export const modal = document.getElementById('video-modal');
export const videoPlayer = document.getElementById('video-player');
export const playerChannelTitle = document.getElementById('player-channel-title');
export const closeModalBtn = document.getElementById('close-modal-btn');
export const streamButtonsContainer = document.getElementById('stream-buttons');
export const audioTrackControls = document.getElementById('audio-track-controls');
export const audioTrackButtonsContainer = document.getElementById('audio-track-buttons');
export const splashScreen = document.getElementById('splash-screen');
export const commentsContainer = document.getElementById('comments-container');
export const commentForm = document.getElementById('comment-form');
export const commentInput = document.getElementById('comment-input');
export const commentSubmitBtn = document.getElementById('comment-submit-btn');
export const commentImageBtn = document.getElementById('comment-image-btn');
export const commentImageUpload = document.getElementById('comment-image-upload');
export const imagePreviewsContainer = document.getElementById('image-previews');

/**
 * Renders the list of channels into the channel grid.
 * @param {Array} channelList - The array of channel objects to render.
 * @param {Function} onChannelClick - The callback function to execute when a channel is clicked.
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
 * Creates and returns a DOM element for a single comment.
 * @param {Object} comment - The comment object from the API.
 * @returns {HTMLElement} The comment element.
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
 * Renders previews for the selected images to be attached to a comment.
 * @param {File[]} imageFiles - An array of file objects.
 * @param {Function} onRemove - The callback function to call when a preview is removed.
 */
export function renderImagePreviews(imageFiles, onRemove) {
    imagePreviewsContainer.innerHTML = '';
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-image-container';
            previewContainer.innerHTML = `
                <img src="${e.target.result}" class="preview-image">
                <button class="remove-preview-btn" data-index="${index}">&times;</button>
            `;
            previewContainer.querySelector('.remove-preview-btn').addEventListener('click', () => onRemove(index));
            imagePreviewsContainer.appendChild(previewContainer);
        };
        reader.readAsDataURL(file);
    });
}