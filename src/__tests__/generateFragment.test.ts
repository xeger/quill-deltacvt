import { generateFragment } from '../index';
import * as fixtures from '../../test/fixtures';
import { NullGenerator } from '../../test/implementations';

describe('generateFragment', () => {
  it('accepts custom generators', () => {
    expect(generateFragment(fixtures.TRIVIAL, new NullGenerator())).toEqual('');
  });

  it('omits HTML, BODY, etc', () => {
    expect(generateFragment([{ insert: '\n' }])).toEqual('<div>\n</div>');
  });

  it('tolerates nullish & invalid deltas', () => {
    expect(generateFragment(undefined as any)).toEqual('');
    expect(generateFragment(null as any)).toEqual('');
    expect(generateFragment([])).toEqual('');
    expect(generateFragment([{ insert: '' }])).toEqual('');
  });

  it('rejects non-normalized deltas', () => {
    expect(() => generateFragment([{}])).toThrow();
    expect(() => generateFragment([{ retain: 4 } as any])).toThrow();
  });

  describe('chunking', () => {
    it('ensures terminal newlines', () => {
      Object.values(fixtures).forEach((example) => {
        const g = new NullGenerator();
        generateFragment(example, g);
        expect(g.chunks.length).toBeGreaterThan(0);
        g.chunks.forEach(({ content }) => {
          if (typeof content !== 'string') return;
          const i = content.lastIndexOf('\n');
          if (i >= 0) {
            expect(content.indexOf('\n')).toEqual(i);
            expect(i).toEqual(content.length - 1);
          }
        });
      });
    });
  });
});
