import { generateFragment } from '../index';

describe('generateFragment', () => {
  it('omits HTML, BODY, eyc', () => {
    expect(generateFragment([{ insert: '\n' }])).toEqual('\n');
  });

  // These are all invalid Quill deltas, but common enough
  // that we shouldn't crash!
  it('tolerates malformed deltas', () => {
    expect(generateFragment(undefined as any)).toEqual('');
    expect(generateFragment(null as any)).toEqual('');
    expect(generateFragment([])).toEqual('');
    expect(generateFragment([{ insert: '' }])).toEqual('');
  });

  it('tolerates non-normalized deltas', () => {
    expect(generateFragment([{}])).toEqual('');
    expect(generateFragment([{ retain: 4 } as any])).toEqual('');
  });
});
