import {
  IMAGES,
  LISTS,
  MALICIOUS,
  SMORGASBORD,
  TRIVIAL_ALIGN,
  TRIVIAL_LIST,
} from './fixtures';
import * as visual from './visual';

import { generate } from '../index';

// For visual comparison, turn generated fragments into proper HTML documents.
const wrap = (ops) =>
  `<!DOCTYPE html><html><body style="font-family: sans-serif; white-space: pre-wrap">${generate(
    ops
  )}</body></html>`;

describe('generate', () => {
  it('handles images', () => {
    visual.matchSnapshot(wrap(IMAGES));
  });

  it('escapes HTML syntax', () => {
    visual.matchSnapshot(wrap(MALICIOUS));
  });

  it('handles lists', () => {
    visual.matchSnapshot(wrap(LISTS));
  });

  it('handles standard Quill formats', () => {
    visual.matchSnapshot(wrap(SMORGASBORD));
  });

  it('closes terminal line formats', () => {
    expect(generate(LISTS)).toMatch(/<\/ol>$/);
    expect(generate(TRIVIAL_ALIGN)).toMatch(/<\/div>$/);
    expect(generate(TRIVIAL_LIST)).toMatch(/<\/ul>$/);
  });
});
