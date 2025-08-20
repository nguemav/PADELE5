/**
 * Fetches channel data from multiple JSON files.
 * @returns {Promise<Array>} A promise that resolves to the combined and flattened array of channels.
 */
export async function getChannels() {
    const channelFiles = [
        './data/generalis.json',
        './data/divertissement.json',
        './data/info.json',
        './data/cinema.json',
        './data/series-films.json',
        './data/musique.json',
        './data/jeunesse.json',
        './data/sport.json',
        './data/culture.json',
        './data/documentaires.json',
        './data/voyage.json',
        './data/autres.json'
    ];

    try {
        const responses = await Promise.all(channelFiles.map(file => fetch(file)));
        
        for (const response of responses) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${response.url}`);
            }
        }
        
        const channelArrays = await Promise.all(responses.map(res => res.json()));
        
        // Flatten the array of arrays into a single array of channels
        return channelArrays.flat();
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