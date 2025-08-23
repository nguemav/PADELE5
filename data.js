import { africanChannels } from './data/african.js';
import { canadianChannels } from './data/canadian.js';
import { frenchChannels } from './data/french.js';
import { internationalChannels } from './data/international.js';
import { swissChannels } from './data/swiss.js';

export const channels = [
    ...frenchChannels,
    ...swissChannels,
    ...canadianChannels,
    ...africanChannels,
    ...internationalChannels,
];