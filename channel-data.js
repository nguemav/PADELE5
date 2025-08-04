import { generalChannels } from 'data/general';
import { cinemaSeriesChannels } from 'data/cinemaSeries';
import { telenovelasChannels } from 'data/telenovelas';
import { informationChannels } from 'data/information';
import { discoveryChannels } from 'data/discovery';
import { musicChannels } from 'data/music';
import { kidsChannels } from 'data/kids';
import { sportChannels } from 'data/sport';
import { internationalChannels } from 'data/international';
import { lifestyleChannels } from 'data/lifestyle';

/* @tweakable Database of all TV channels, organized by category */
export const channelData = {
  general: generalChannels,
  cinemaSeries: cinemaSeriesChannels,
  telenovelas: telenovelasChannels,
  information: informationChannels,
  discovery: discoveryChannels,
  music: musicChannels,
  kids: kidsChannels,
  sport: sportChannels,
  international: internationalChannels,
  lifestyle: lifestyleChannels,
};