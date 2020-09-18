import { DeltaOperation } from '../../interfaces';

import images from './images.json';
import lists from './lists.json';
import malicious from './malicious.json';
import smorgasbord from './smorgasbord.json';

export const IMAGES = images as DeltaOperation[];
export const LISTS = lists as DeltaOperation[];
export const MALICIOUS = malicious as DeltaOperation[];
export const SMORGASBORD = smorgasbord as DeltaOperation[];
