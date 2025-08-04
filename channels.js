// tombstone: contents moved to channel-data.js and are now aggregated here
import { channelData } from './channel-data.js';

/* @tweakable List of all TV channels, aggregated from categories */
export const channels = Object.values(channelData).flat();

