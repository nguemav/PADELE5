import { channels } from './channels.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const channelGrid = document.getElementById('channel-grid');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');
const modal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('video-player');
const playerChannelTitle = document.getElementById('player-channel-title');
const closeModalBtn = document.getElementById('close-modal-btn');
const streamButtonsContainer = document.getElementById('stream-buttons');
const audioTrackControls = document.getElementById('audio-track-controls');
const audioTrackButtonsContainer = document.getElementById('audio-track-buttons');
const splashScreen = document.getElementById('splash-screen');

// Comments elements
const commentsContainer = document.getElementById('comments-container');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentSubmitBtn = document.getElementById('comment-submit-btn');
const commentImageBtn = document.getElementById('comment-image-btn');
const commentImageUpload = document.getElementById('comment-image-upload');
const imagePreviewsContainer = document.getElementById('image-previews');

let hls;
let projectId;
let commentImageFiles = [];

async function init() {
    try {
        const project = await window.websim.getCurrentProject();
        projectId = project.id;
    } catch (e) {
        console.error("Error getting project info:", e);
    }
}

function renderChannels(channelList) {
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
        card.addEventListener('click', () => openPlayer(channel));
        channelGrid.appendChild(card);
    });
}

function filterChannels() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm) ||
        channel.category.toLowerCase().includes(searchTerm) ||
        channel.country.toLowerCase().includes(searchTerm)
    );
    renderChannels(filteredChannels);
}

async function openPlayer(channel) {
    playerChannelTitle.textContent = channel.name;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    streamButtonsContainer.innerHTML = '';
    audioTrackControls.classList.add('hidden');
    audioTrackButtonsContainer.innerHTML = '';
    commentsContainer.innerHTML = ''; // Clear previous comments

    channel.streams.forEach((streamUrl, index) => {
        const btn = document.createElement('button');
        btn.className = 'stream-btn';
        btn.textContent = `Source ${index + 1}`;
        btn.addEventListener('click', () => {
            playStream(streamUrl);
            document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        streamButtonsContainer.appendChild(btn);
    });

    // Play the first stream by default
    if (channel.streams.length > 0) {
        streamButtonsContainer.firstChild.click();
    }
    
    await loadComments();
}

function playStream(streamUrl) {
    if (hls) {
        hls.destroy();
    }
    
    // Clear previous audio track buttons
    audioTrackControls.classList.add('hidden');
    audioTrackButtonsContainer.innerHTML = '';

    // Simple check for m3u8 extension
    if (streamUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
            });
            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                setupAudioTracks(hls);
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                   console.error('HLS fatal error:', data);
                }
            });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = streamUrl;
            videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
        }
    } else {
        // Fallback for non-HLS streams (e.g., Dailymotion embed links)
        videoPlayer.src = streamUrl;
        videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
    }
}

function setupAudioTracks(hlsInstance) {
    if (!hlsInstance || hlsInstance.audioTracks.length <= 1) {
        audioTrackControls.classList.add('hidden');
        audioTrackButtonsContainer.innerHTML = '';
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

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (hls) {
        hls.destroy();
    }
    videoPlayer.pause();
    videoPlayer.src = '';
    audioTrackControls.classList.add('hidden');
    audioTrackButtonsContainer.innerHTML = '';
    commentsContainer.innerHTML = '';
    imagePreviewsContainer.innerHTML = '';
    commentImageFiles = [];
}

// Comments logic
async function loadComments() {
    if (!projectId) return;
    commentsContainer.innerHTML = '<p>Loading comments...</p>';
    try {
        const response = await fetch(`/api/v1/projects/${projectId}/comments`);
        const data = await response.json();
        commentsContainer.innerHTML = '';
        if (data.comments.data.length === 0) {
            commentsContainer.innerHTML = '<p>No comments yet. Be the first!</p>';
        } else {
            data.comments.data.forEach(commentData => {
                const commentEl = renderComment(commentData.comment);
                commentsContainer.appendChild(commentEl);
            });
            commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsContainer.innerHTML = '<p>Could not load comments.</p>';
    }
}

function renderComment(comment) {
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

commentImageBtn.addEventListener('click', () => {
    commentImageUpload.click();
});

commentImageUpload.addEventListener('change', (e) => {
    for (const file of e.target.files) {
        if (commentImageFiles.length < 4) {
            commentImageFiles.push(file);
        }
    }
    renderImagePreviews();
    commentImageUpload.value = '';
});

function renderImagePreviews() {
    imagePreviewsContainer.innerHTML = '';
    commentImageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-image-container';
            previewContainer.innerHTML = `
                <img src="${e.target.result}" class="preview-image">
                <button class="remove-preview-btn" data-index="${index}">&times;</button>
            `;
            imagePreviewsContainer.appendChild(previewContainer);
        };
        reader.readAsDataURL(file);
    });
}

imagePreviewsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-preview-btn')) {
        const index = parseInt(e.target.dataset.index, 10);
        commentImageFiles.splice(index, 1);
        renderImagePreviews();
    }
});

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = commentInput.value.trim();
    if (!content && commentImageFiles.length === 0) return;

    commentSubmitBtn.disabled = true;
    commentSubmitBtn.textContent = 'Posting...';

    try {
        let imageUrls = [];
        if (commentImageFiles.length > 0) {
            imageUrls = await Promise.all(
                commentImageFiles.map(file => window.websim.upload(file))
            );
        }

        await window.websim.postComment({
            content: content,
            images: imageUrls,
        });

    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Could not post comment.');
    } finally {
        commentSubmitBtn.disabled = false;
        commentSubmitBtn.textContent = 'Comment';
    }
});

window.websim.addEventListener('comment:created', (data) => {
  const comment = data.comment;
  if (comment.parent_comment_id) {
    // This is a reply, which we're not handling in the main feed for now
    return; 
  }

  // If the "No comments yet" message is there, remove it
  const noCommentsEl = commentsContainer.querySelector('p');
  if (noCommentsEl && noCommentsEl.textContent.startsWith('No comments')) {
      commentsContainer.innerHTML = '';
  }
  
  const newCommentEl = renderComment(comment);
  commentsContainer.appendChild(newCommentEl);
  commentsContainer.scrollTop = commentsContainer.scrollHeight;

  // Clear form
  commentInput.value = '';
  commentImageFiles = [];
  imagePreviewsContainer.innerHTML = '';
});

// Event Listeners
searchInput.addEventListener('input', filterChannels);
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Splash screen logic
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500); // This should match the transition duration in CSS
    }, 2000); // reduced splash screen time

    init();

    // Initial render
    renderChannels(channels);
});