import { TRIVIAL_ALIGN } from '../../test/fixtures';

import { generate } from '..';
import MinimalHTML from '../generators/MinimalHTML';

const UNKNOWN_ATTRIBUTE = [{ attributes: { banana: true }, insert: 'hi' }];

const UNKNOWN_EMBED = [{ insert: { banana: 'banana' } }];

describe('generators/MinimalHTML', () => {
  it('handles unknown content', () => {
    const g = new MinimalHTML();
    expect(generate(UNKNOWN_ATTRIBUTE, g)).toEqual('hi');
    expect(generate(UNKNOWN_EMBED, g)).toEqual('');
  });

  describe('options', () => {
    test('paragraph.tagName', () => {
      const g = new MinimalHTML({ paragraph: { tagName: 'p' } });
      const html = generate(TRIVIAL_ALIGN, g);
      expect(html).toMatch(/^<p/);
      expect(html).toMatch(/<\/p>$/);
    });

    describe('strict mode', () => {
      const g = new MinimalHTML({ strict: true });
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