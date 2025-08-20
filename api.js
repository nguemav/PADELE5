/**
 * Fetches channel data from the JSON file.
 * @returns {Promise<Array>} A promise that resolves to the array of channels.
 */
export async function getChannels() {
    try {
        const response = await fetch('./channels.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch channels:", error);
        return []; // Return empty array on failure
    }
}

/**
 * Loads comments for the current project.
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<object>} A promise that resolves to the comments data structure.
 */
export async function loadComments(projectId) {
    if (!projectId) return { data: [] };
    const response = await fetch(`/api/v1/projects/${projectId}/comments`);
    return await response.json();
}

/**
 * Posts a new comment with optional images.
 * @param {string} content - The text content of the comment.
 * @param {File[]} imageFiles - An array of image files to upload.
 */
export async function postComment(content, imageFiles) {
    let imageUrls = [];
    if (imageFiles.length > 0) {
        // Upload all images first and get their URLs
        imageUrls = await Promise.all(
            imageFiles.map(file => window.websim.upload(file))
        );
    }

    // The postComment function handles the user confirmation dialog
    await window.websim.postComment({
        content: content,
        images: imageUrls,
    });
}