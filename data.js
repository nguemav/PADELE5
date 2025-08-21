import { generalChannels } from './data/general.js';
import { entertainmentChannels } from './data/entertainment.js';
import { infoChannels } from './data/info.js';
import { cinemaChannels } from './data/cinema.js';
import { musicChannels } from './data/music.js';
import { kidsChannels } from './data/kids.js';
import { sportsChannels } from './data/sports.js';
import { documentariesChannels } from './data/documentaries.js';
import { lifestyleChannels } from './data/lifestyle.js';

export const allChannels = [
    ...generalChannels,
    ...entertainmentChannels,
    ...infoChannels,
    ...cinemaChannels,
    ...musicChannels,
    ...kidsChannels,
    ...sportsChannels,
    ...documentariesChannels,
    ...lifestyleChannels,
];