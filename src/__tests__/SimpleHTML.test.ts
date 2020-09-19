import { TRIVIAL_ALIGN } from './fixtures';

import { generate } from '..';
import SimpleHTML from '../generators/SimpleHTML';

const UNKNOWN_ATTRIBUTE = [{ attributes: { banana: true }, insert: 'hi' }];

const UNKNOWN_EMBED = [{ insert: { banana: 'banana' } }];

describe('SimpleHTML', () => {
  it('handles unknown content', () => {
    const g = new SimpleHTML();
    expect(generate(UNKNOWN_ATTRIBUTE, g)).toEqual('hi');
    expect(generate(UNKNOWN_EMBED, g)).toEqual('');
  });

  describe('options', () => {
    test('custom paragraph tag', () => {
      const g = new SimpleHTML({ paragraph: { tagName: 'p' } });
      const html = generate(TRIVIAL_ALIGN, g);
      expect(html).toMatch(/^<p/);
      expect(html).toMatch(/<\/p>$/);
    });

    describe('strict mode', () => {
      const g = new SimpleHTML({ strict: true });
      it('gives helpful embed messages', () => {
        expect(() => generate(UNKNOWN_EMBED, g)).toThrowError(
          'Unknown embed: banana'
        );
      });

      it('gives helpful attribute messages', () => {
        expect(() => generate(UNKNOWN_ATTRIBUTE, g)).toThrowError(
          'Unknown attribute: banana'
        );
      });
    });
  });
});
