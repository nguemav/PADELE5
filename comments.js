import * as api from './api.js';
import * as ui from './ui.js';

// --- STATE ---
let currentProjectId;
let commentImageFiles = [];

// --- DOM ELEMENTS ---
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentImageBtn = document.getElementById('comment-image-btn');
const commentImageUpload = document.getElementById('comment-image-upload');
const imagePreviewsContainer = document.getElementById('image-previews');
const commentsContainer = document.getElementById('comments-container');

/**
 * Sets up all event listeners for the comments section.
 * @param {string} projectId - The current project ID.
 */
export function initializeComments(projectId) {
    currentProjectId = projectId;
    
    // Listen for real-time comment creation
    window.websim.addEventListener('comment:created', handleNewComment);

    // Form submission
    commentForm.addEventListener('submit', handleFormSubmit);

    // Image upload handling
    commentImageBtn.addEventListener('click', () => commentImageUpload.click());
    commentImageUpload.addEventListener('change', handleImageSelection);
    imagePreviewsContainer.addEventListener('click', handleRemovePreview);
}

/**
 * Loads and renders comments for the current project.
 */
export async function loadAndRenderComments() {
    if (!currentProjectId) return;
    commentsContainer.innerHTML = '<p>Loading comments...</p>';
    try {
        const response = await api.loadComments(currentProjectId);
        ui.renderCommentList(response.data);
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsContainer.innerHTML = '<p>Could not load comments.</p>';
    }
}

/**
 * Clears the comment display and local state.
 */
export function clearComments() {
    ui.clearCommentsContainer();
    commentImageFiles = [];
    ui.renderImagePreviews(commentImageFiles);
    commentInput.value = '';
}

/**
 * Handles the comment form submission.
 * @param {Event} e - The form submission event.
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    const content = commentInput.value.trim();
    if (!content && commentImageFiles.length === 0) return;

    ui.setSubmitButtonState(true, 'Posting...');

    try {
        await api.postComment(content, commentImageFiles);
        // Success! The 'comment:created' event will handle UI updates.
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Could not post comment. Please try again.');
    } finally {
        ui.setSubmitButtonState(false, 'Comment');
    }
}

/**
 * Handles the real-time 'comment:created' event.
 * @param {object} data - The event payload containing the new comment.
 */
function handleNewComment(data) {
  const comment = data.comment;
  // Ignore replies for now as we don't have a nested UI
  if (comment.parent_comment_id) return; 

  ui.addNewComment(comment);

  // Clear the form since the comment was successful
  commentInput.value = '';
  commentImageFiles = [];
  ui.renderImagePreviews(commentImageFiles);
}

/**
 * Handles selection of image files for a comment.
 * @param {Event} e - The file input change event.
 */
function handleImageSelection(e) {
    for (const file of e.target.files) {
        if (commentImageFiles.length < 4) {
            commentImageFiles.push(file);
        }
    }
    ui.renderImagePreviews(commentImageFiles);
    commentImageUpload.value = ''; // Reset input
}

/**
 * Handles removing a selected image preview.
 * @param {Event} e - The click event on the previews container.
 */
function handleRemovePreview(e) {
    if (e.target.classList.contains('remove-preview-btn')) {
        const index = parseInt(e.target.dataset.index, 10);
        commentImageFiles.splice(index, 1);
        ui.renderImagePreviews(commentImageFiles);
    }
}