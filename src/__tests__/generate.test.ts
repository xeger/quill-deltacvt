import 'html-validate/jest';

import {
  IMAGES,
  LISTS,
  MALICIOUS,
  SMORGASBORD,
  TRIVIAL_ALIGN,
  TRIVIAL_LIST,
} from '../../test/fixtures';
import * as visual from './visual';

import { generate } from '../index';

// Generate and validate HTML from ops.
function genHTML(ops) {
  const html = generate(ops);
  expect(html).toHTMLValidate({
    rules: {
      'element-required-attributes': 'off',
      'element-required-content': 'off',
      'no-inline-style': 'off',
      'wcag/h37': 'off',
    },
  });
  return html;
}

describe('generate', () => {
  it('handles images', () => {
    visual.matchSnapshot(genHTML(IMAGES));
  });

  it('escapes HTML syntax', () => {
    visual.matchSnapshot(genHTML(MALICIOUS));
  });

  it('handles lists', () => {
    visual.matchSnapshot(genHTML(LISTS));
  });

  it('handles trivial inputs', () => {
    visual.matchSnapshot(genHTML(TRIVIAL_LIST));
  });

  it.only('handles standard Quill formats', () => {
    visual.matchSnapshot(genHTML(SMORGASBORD));
  });

  it('handles trivial aligned text', () => {
    visual.matchSnapshot(genHTML(TRIVIAL_ALIGN));
  });
});
