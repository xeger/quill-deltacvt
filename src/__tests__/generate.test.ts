import 'html-validate/jest';

import { generate } from '../index';
import { TRIVIAL } from '../../test/fixtures';
import { NullGenerator } from '../../test/implementations';

describe('generate', () => {
  it('accepts custom generators', () => {
    expect(generate(TRIVIAL, new NullGenerator())).toEqual('');
  });

  it('returns an HTML document', () => {
    const html = generate(TRIVIAL);
    expect(html).toHTMLValidate();
  });
});
