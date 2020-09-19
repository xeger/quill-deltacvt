import { IMAGES, LISTS, MALICIOUS, SMORGASBORD } from './fixtures';
import * as visual from './visual';

import { generate as realGenerate } from '../index';
import SimpleHTML from '../generators/SimpleHTML';

const wrap = (html: string) =>
  `<div style="font-family: sans-serif; white-space: pre-wrap">${html}</div>`;
const generate = (ops) => wrap(realGenerate(ops));

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

  describe('SimpleHTML', () => {
    // TODO: options.paragraph
  });
});
