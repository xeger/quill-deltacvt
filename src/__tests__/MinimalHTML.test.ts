import 'html-validate/jest';

import * as visual from './visual';
import { generateFragment, generate } from '..';
import MinimalHTML from '../generators/MinimalHTML';
import {
  IMAGES,
  LISTS,
  LISTS_STYLED,
  MALICIOUS,
  MULTI_NEWLINE,
  SMORGASBORD,
  TRIVIAL_ALIGN,
  TRIVIAL_LIST,
} from '../../test/fixtures';

const UNKNOWN_ATTRIBUTE = [{ attributes: { banana: true }, insert: 'hi' }];
const UNKNOWN_EMBED = [{ insert: { banana: 'banana' } }];
const UNKNOWN_INSERT = [{ insert: 42 as any }];

// Generate and validate HTML from ops.
function genHTML(ops) {
  const html = generate(ops);
  expect(html).toHTMLValidate();
  return html;
}

describe('generators/MinimalHTML', () => {
  it('handles unknown content', () => {
    const g = new MinimalHTML();
    expect(generateFragment(UNKNOWN_ATTRIBUTE, g)).toEqual('<div>hi</div>');
    expect(generateFragment(UNKNOWN_EMBED, g)).toEqual('');
    expect(generateFragment(UNKNOWN_INSERT, g)).toEqual('');
  });

  it('does not escape apostrophes', () => {
    const g = new MinimalHTML();
    expect(generateFragment([{ insert: "'" }], g)).toEqual("<div>'</div>");
  });

  describe('algorithm', () => {
    it('handles images', () => {
      visual.matchSnapshot(genHTML(IMAGES));
    });

    it('escapes HTML syntax', () => {
      visual.matchSnapshot(genHTML(MALICIOUS));
    });

    it('handles lists', () => {
      visual.matchSnapshot(genHTML(LISTS));
    });

    it('handles styled lists', () => {
      visual.matchSnapshot(genHTML(LISTS_STYLED));
    });

    it('handles trivial inputs', () => {
      visual.matchSnapshot(genHTML(TRIVIAL_LIST));
    });

    it('handles standard Quill formats', () => {
      visual.matchSnapshot(genHTML(SMORGASBORD));
    });

    it('handles trivial aligned text', () => {
      visual.matchSnapshot(genHTML(TRIVIAL_ALIGN));
    });

    it('handles line formats within the same DeltaOperation', () => {
      visual.matchSnapshot(genHTML(MULTI_NEWLINE));
    });
  });

  describe('options', () => {
    describe('strict mode', () => {
      const g = new MinimalHTML({ strict: true });

      it('gives helpful embed messages', () => {
        expect(() => generateFragment(UNKNOWN_EMBED, g)).toThrowError(
          'Unknown embed: banana'
        );
      });

      it('gives helpful attribute messages', () => {
        expect(() => generateFragment(UNKNOWN_ATTRIBUTE, g)).toThrowError(
          'Unknown attribute: banana'
        );
      });

      it('gives helpful insert messages', () => {
        expect(() => generateFragment(UNKNOWN_INSERT, g)).toThrowError(
          'Unknown insert type: number'
        );
      });
    });
  });
});
