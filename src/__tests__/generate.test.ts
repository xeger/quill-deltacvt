import 'html-validate/jest';

import { generate } from '../index';
import { TRIVIAL, NullGenerator } from '../../test/fixtures';

describe('generate', () => {
  it('accepts custom generators', () => {
    expect(generate(TRIVIAL, new NullGenerator())).toEqual('');
  });

  it('returns an HTML document', () => {
    const html = generate(TRIVIAL);
    expect(html).toHTMLValidate();
  });
});
