import { escapeTextContent } from '../internals';

describe('internals', () => {
  describe('escapeTextContent', () => {
    it('escapes multiple instances of chars to replace', () => {
      expect(escapeTextContent('<<')).toBe('&lt;&lt;');
      expect(escapeTextContent('>>')).toBe('&gt;&gt;');
      expect(escapeTextContent('""')).toBe('&quot;&quot;');
      expect(escapeTextContent('&&')).toBe('&amp;&amp;');
    });

    it('does not escape apostrophes', () => {
      expect(escapeTextContent('\'')).toBe('\'');
    });

    it('does nothing for non-target chars', () => {
      expect(escapeTextContent('NOP')).toBe('NOP');
    });
  });
});
