import { generateFragment } from '../index';

describe('generateFragment', () => {
  it('omits HTML, BODY, eyc', () => {
    expect(generateFragment([{ insert: '\n' }])).toEqual('\n');
  });

  // These are all illegal Quill deltas, but common enough
  // that we shouldn't crash!
  it('handles malformed inputs', () => {
    expect(() => {
      generateFragment([]);
      generateFragment([]);
      generateFragment([{ insert: '' }]);
    }).not.toThrow();
  });
});
