import BaseHTML, { EmbedFormatter, TextFormatter } from './BaseHTML';

/**
 * HTML generators for non-textual content (e.g. images)
 * in a chunk.
 */
const EMBEDS: Record<string, EmbedFormatter> = {
  image(src, attributes) {
    const { width, height } = attributes;
    const optWidth = width ? ` width="${width}"` : '';
    const optHeight = height ? ` height="${height}"` : '';

    return `<img src="${src}"${optWidth}${optHeight}/>`;
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
    span.styles.push(`font-family:'${font}'`);
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
 * Generator that outputs HTML approximating the exact HTML output
 * of Quill's Parchment formats. No attempt is made to match the
 * visual appearance of the Quill editor.
 */
export default class QuillHTML extends BaseHTML {
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
    else if (text) {
      if (text === '\n') html = '<br/>';
      else html = `<p${style}>${text}</p>`;
    } else html = '';

    if (list !== prior?.list) {
      const prefix: string[] = [];
      if (prior?.list === 'bullet') prefix.push(`</ul>`);
      else if (prior?.list === 'ordered') prefix.push(`</ol>`);
      if (list === 'bullet') prefix.push(`<ul>`);
      else if (list === 'ordered') prefix.push(`<ol>`);
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
    return `<!DOCTYPE html><html><body>${fragment}</body></html>`;
  }
}
