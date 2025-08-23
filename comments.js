import * as ui from './ui.js';

let projectId;
let commentImageFiles = [];

/**
 * Initializes the comments module by fetching the project ID.
 */
export async function init() {
    try {
        const project = await window.websim.getCurrentProject();
        projectId = project.id;
    } catch (e) {
        console.error("Error getting project info:", e);
    }
}

/**
 * Fetches and displays comments for the current project.
 */
export async function loadComments() {
    if (!projectId) return;
    ui.commentsContainer.innerHTML = '<p>Loading comments...</p>';
    try {
        const response = await fetch(`/api/v1/projects/${projectId}/comments`);
        const data = await response.json();
        ui.commentsContainer.innerHTML = '';
        if (data.comments.data.length === 0) {
            ui.commentsContainer.innerHTML = '<p>No comments yet. Be the first!</p>';
        } else {
            data.comments.data.forEach(commentData => {
                const commentEl = ui.renderComment(commentData.comment);
                ui.commentsContainer.appendChild(commentEl);
            });
            ui.commentsContainer.scrollTop = ui.commentsContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        ui.commentsContainer.innerHTML = '<p>Could not load comments.</p>';
    }
}

function handleImageFileChange(e) {
    for (const file of e.target.files) {
        if (commentImageFiles.length < 4) {
            commentImageFiles.push(file);
        }
    }
    ui.renderImagePreviews(commentImageFiles, removeImagePreview);
    ui.commentImageUpload.value = '';
}

function removeImagePreview(index) {
    commentImageFiles.splice(index, 1);
    ui.renderImagePreviews(commentImageFiles, removeImagePreview);
}

async function handleCommentSubmit(e) {
    e.preventDefault();
    const content = ui.commentInput.value.trim();
    if (!content && commentImageFiles.length === 0) return;

    ui.commentSubmitBtn.disabled = true;
    ui.commentSubmitBtn.textContent = 'Posting...';

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
        ui.commentSubmitBtn.disabled = false;
        ui.commentSubmitBtn.textContent = 'Comment';
    }
}

function handleCommentCreated(data) {
    const comment = data.comment;
    if (comment.parent_comment_id) {
      return; 
    }
  
    const noCommentsEl = ui.commentsContainer.querySelector('p');
    if (noCommentsEl && noCommentsEl.textContent.startsWith('No comments')) {
        ui.commentsContainer.innerHTML = '';
    }
    
    const newCommentEl = ui.renderComment(comment);
    ui.commentsContainer.appendChild(newCommentEl);
    ui.commentsContainer.scrollTop = ui.commentsContainer.scrollHeight;
  
    // Clear form
    ui.commentInput.value = '';
    commentImageFiles = [];
    ui.imagePreviewsContainer.innerHTML = '';
}

/**
 * Sets up all event listeners related to the comments section.
 */
export function setupEventListeners() {
    ui.commentImageBtn.addEventListener('click', () => ui.commentImageUpload.click());
    ui.commentImageUpload.addEventListener('change', handleImageFileChange);
    ui.commentForm.addEventListener('submit', handleCommentSubmit);
    window.websim.addEventListener('comment:created', handleCommentCreated);
}
