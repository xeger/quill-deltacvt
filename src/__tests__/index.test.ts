import { IMAGES, LISTS, MALICIOUS, SMORGASBORD } from './fixtures';
import * as visual from './visual';

import { generate } from '../index';

describe('generate', () => {
  it('handles images', () => {
    visual.matchSnapshot(generate(IMAGES));
  });

  it('escapes HTML syntax', () => {
    visual.matchSnapshot(generate(MALICIOUS));
  });

  it('handles lists', () => {
    visual.matchSnapshot(generate(LISTS));
  });

  it('handles standard Quill formats', () => {
    visual.matchSnapshot(generate(SMORGASBORD));
  });
});
