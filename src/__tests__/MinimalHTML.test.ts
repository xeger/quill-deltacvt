import { generateFragment } from '..';
import MinimalHTML from '../generators/MinimalHTML';

const UNKNOWN_ATTRIBUTE = [{ attributes: { banana: true }, insert: 'hi' }];
const UNKNOWN_EMBED = [{ insert: { banana: 'banana' } }];
const UNKNOWN_INSERT = [{ insert: 42 as any }];

describe('generators/MinimalHTML', () => {
  it('handles unknown content', () => {
    const g = new MinimalHTML();
    expect(generateFragment(UNKNOWN_ATTRIBUTE, g)).toEqual('hi');
    expect(generateFragment(UNKNOWN_EMBED, g)).toEqual('');
    expect(generateFragment(UNKNOWN_INSERT, g)).toEqual('');
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
