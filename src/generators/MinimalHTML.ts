import BaseHTML, { EmbedFormatter, TextFormatter } from './BaseHTML';

const BODY_STYLE =
  'color:#303030;font-weight:400;white-space:pre-wrap;font-family:sans-serif';

/**
 * Inline CSS styles for selected line formats.
 */
const LINE_STYLES = {
  list: 'margin:0px;list-style-position:inside;padding-left:1.5rem',
};

/**
 * HTML generators for non-textual content (e.g. images)
 * in a chunk. Understands width, height and float.
 * @see https://github.com/xeger/quill-image for float support
 */
const EMBEDS: Record<string, EmbedFormatter> = {
  image(src, attributes) {
    const { float, width, height } = attributes;
    const optWidth = width ? ` width="${width}"` : '';
    const optHeight = height ? ` height="${height}"` : '';
    const optStyle = float ? ` style="float:${float}"` : '';

    return `<img src="${src}"${optWidth}${optHeight}${optStyle}/>`;
  },
};

/**
 * HTML generators for character formats. Line formats are context-sensitive
 * and need to be handled as part of the generation algorithm.
 */
const TEXTS: Record<string, TextFormatter> = {
  bold: (span) => {
    span.styles.push('font-weight:bold');
  },
  color: (span, color) => {
    span.styles.push(`color:${color}`);
  },
  font: (span, font) => {
    span.styles.push(`font-family:${font}`);
  },
  italic: (span) => {
    span.styles.push('font-style:italic');
  },
  link: (span, href) => {
    span.text = `<a href="${href}">${span.text}</a>`;
  },
  size: (span, size) => {
    span.styles.push(`font-size:${size}`);
  },
  underline: (span) => {
    span.styles.push('text-decoration:underline');
  },
};

export interface Options {
  strict?: true;
}

interface Line {
  align?: string;
  list?: string;
  text: string;
}

/**
 * Generator that outputs HTML approximating the visual style of Quill's
 * Parchment formats, but with notable differences:
 *   - the `<div>` tag is used instead of `<p>` for paragraphs
 *   - all styling is inline (no classes; no stylesheet)
 *
 * The resulting HTML is minimal in size, self contained with no need
 * for external stylesheets, minimally influenced by user-agent stylesheets,
 * and looks visually similar to Quill output in modern browsers, although
 * structurally quite different.
 *
 * To achieve this look, the generator applies a style to the `body` element
 * when you `wrap()`, which affects all of the inner content.
 *
 * If you generate fragments, make sure to apply a similar style (especially
 * a `white-space: pre-wrap`) to an enclosing tag, else the HTML will look
 * completely wrong!
 */
export default class MinimalHTML extends BaseHTML {
  embedFormatters: Record<string, EmbedFormatter> = { ...EMBEDS };
  strict?: true;
  textFormatters: Record<string, TextFormatter> = { ...TEXTS };

  constructor(options: Options = {}) {
    super(EMBEDS, TEXTS, options);
  }

  formatLine(current: Line, prior: Line): string {
    const { align, list, text } = current;
    const style = align ? ` style="text-align: ${align}"` : '';

    let html: string;
    if (list) html = `<li${style}>${text}</li>`;
    else if (text) html = `<div${style}>${text}</div>`;
    else html = '';

    if (list !== prior?.list) {
      const prefix: string[] = [];
      if (prior?.list === 'bullet') prefix.push(`</ul>`);
      else if (prior?.list === 'ordered') prefix.push(`</ol>`);
      if (list === 'bullet') prefix.push(`<ul style="${LINE_STYLES.list}">`);
      else if (list === 'ordered')
        prefix.push(`<ol style="${LINE_STYLES.list}">`);
      html = `${prefix.join('')}${html}`;
    }

    return html;
  }

  isLineFormat(format: string): boolean {
    switch (format) {
      case 'align':
      case 'list':
        return true;
      default:
        return false;
    }
  }

  wrap(fragment: string): string {
    return `<!DOCTYPE html><html><body style="${BODY_STYLE}">${fragment}</body></html>`;
  }
}
