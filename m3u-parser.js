// Regex to capture attributes from the #EXTINF line
const extinfRegex = /#EXTINF:-1\s+(.*?),(.*)/;
// Regex to extract specific attributes from the attributes string
const attrRegex = /(\S+?)="([^"]*)"/g;

/**
 * Parses the content of an M3U file.
 * @param {string} m3uContent The content of the M3U file as a string.
 * @returns {Array<object>} An array of channel objects { name, logo, url }.
 */
export function parseM3u(m3uContent) {
    const channels = [];
    const lines = m3uContent.split('\n');
    let currentChannel = {};

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#EXTINF:')) {
            const match = trimmedLine.match(extinfRegex);
            if (match) {
                const attributesStr = match[1];
                const name = match[2];
                
                currentChannel = { name: name.trim(), logo: null, url: null };

                let attrMatch;
                while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
                    const [, key, value] = attrMatch;
                    if (key === 'tvg-name') {
                        currentChannel.name = value.trim();
                    } else if (key === 'tvg-logo') {
                        currentChannel.logo = value.trim();
                    }
                }
            }
        } else if (trimmedLine && !trimmedLine.startsWith('#')) {
            if (currentChannel.name) {
                currentChannel.url = trimmedLine;
                channels.push(currentChannel);
                currentChannel = {}; // Reset for the next channel
            }
        }
    }

    return channels;
}