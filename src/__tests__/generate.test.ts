import { IMAGES, LISTS, MALICIOUS, SMORGASBORD } from './fixtures';
import * as visual from './visual';

import { generate } from '../index';
import SimpleHTML from '../generators/SimpleHTML';

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
    describe('options.enclosing', () => {
      test('custom tag & style', () => {
        const g = new SimpleHTML({
          enclosing: { tag: 'body', style: 'color: red' },
        });
        expect(generate([], g)).toEqual('<body style="color: red"></body>');
      });
      test('no tag', () => {
        const g = new SimpleHTML({ enclosing: { tag: null, style: '' } });
        expect(generate([], g)).toEqual('');
      });
      test('no style', () => {
        const g = new SimpleHTML({ enclosing: { tag: 'div', style: '' } });
        expect(generate([], g)).toEqual('<div></div>');
      });
    });
  });
});
