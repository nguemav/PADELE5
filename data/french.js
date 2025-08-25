import { cinemaSeriesChannels } from './french/cinema_series.js';
import { cultureDocChannels } from './french/culture_doc.js';
import { divertissementChannels } from './french/divertissement.js';
import { generalisteChannels } from './french/generaliste.js';
import { infoChannels } from './french/info.js';
import { jeunesseChannels } from './french/jeunesse.js';
import { musiqueChannels } from './french/musique.js';
import { sportChannels } from './french/sport.js';

export const frenchChannels = [
    ...generalisteChannels,
    ...divertissementChannels,
    ...infoChannels,
    ...cultureDocChannels,
    ...cinemaSeriesChannels,
    ...jeunesseChannels,
    ...musiqueChannels,
    ...sportChannels,
];