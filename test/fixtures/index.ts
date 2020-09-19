import { Op } from '../../src/interfaces';

import images from './images.json';
import lists from './lists.json';
import malicious from './malicious.json';
import smorgasbord from './smorgasbord.json';
import trivial from './trivial.json';
import trivialAlign from './trivialAlign.json';
import trivialList from './trivialList.json';

export const IMAGES = images as Op[];
export const LISTS = lists as Op[];
export const MALICIOUS = malicious as Op[];
export const SMORGASBORD = smorgasbord as Op[];
export const TRIVIAL = trivial as Op[];
export const TRIVIAL_ALIGN = trivialAlign as Op[];
export const TRIVIAL_LIST = trivialList as Op[];
