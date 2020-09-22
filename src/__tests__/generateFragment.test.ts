import { generateFragment } from '../index';
import { TRIVIAL, NullGenerator } from '../../test/fixtures';

describe('generateFragment', () => {
  it('accepts custom generators', () => {
    expect(generateFragment(TRIVIAL, new NullGenerator())).toEqual('');
  });

  it('omits HTML, BODY, eyc', () => {
    expect(generateFragment([{ insert: '\n' }])).toEqual('\n');
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
});
