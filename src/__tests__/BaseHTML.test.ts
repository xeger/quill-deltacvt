import BaseHTML from '../generators/BaseHTML';

describe('Generators/BaseHTML', () => {
  describe('escape', () => {
    it('escapes multiple instances of chars to replace', () => {
      // @ts-expect-error 2511 unit-testing an instance method
      const g = new BaseHTML();
      expect(g.escape('<<')).toBe('&lt;&lt;');
      expect(g.escape('>>')).toBe('&gt;&gt;');
      expect(g.escape('""')).toBe('&quot;&quot;');
      expect(g.escape('&&')).toBe('&amp;&amp;');
    });

    it('does not escape apostrophes', () => {
      // @ts-expect-error 2511 unit-testing an instance method
      const g = new BaseHTML();
      expect(g.escape("'")).toBe("'");
    });

    it('does nothing for non-target chars', () => {
      // @ts-expect-error 2511 unit-testing an instance method
      const g = new BaseHTML();
      expect(g.escape('NOP')).toBe('NOP');
    });
  });
});
