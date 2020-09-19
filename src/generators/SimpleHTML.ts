import { XmlEntities } from 'html-entities';

import { Attributes, Chunk, Content, Generator, isText } from '../interfaces';

export type EmbedFormatter = (
  content: Content,
  attributes: Attributes
) => string;

export type TextFormatter = (text: string, value?: boolean | string) => string;

/**
 * Inline CSS styles for selected line formats.
 */
const lineStyles = {
  list: 'margin: 0px; list-style-position: inside; padding-left: 1.5rem',
};

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
  bold: (text) => `<b>${text}</b>`,
  color: (text, color) => `<span style="color: ${color}">${text}</span>`,
  italic: (text) => `<i>${text}</i>`,
  link: (text, href) => `<a href="${href}">${text}</a>`,
  size: (text, size) => `<span style="font-size: ${size}">${text}</span>`,
  underline: (text) => `<u>${text}</u>`,
};

export interface Options {
  paragraph?: {
    tagName: string;
  };
}

/**
 * Generator that outputs HTML fragments (not entire documents) approximating
 * the visual style of Quill's Parchment formats, but with notable differences:
 *   - newlines and whitespace are preserved
 *   - the `<div>` tag is used instead of `<p>` for paragraphs
 *   - left-aligned paragraphs are not surrounded by a tag
 *
 * These differences can be controlled with options.
 *
 * @see Options
 */
export default class SimpleHTML implements Generator {
  embedFormatters: Record<string, EmbedFormatter> = { ...EMBEDS };
  paragraphTag: string;
  textFormatters: Record<string, TextFormatter> = { ...TEXTS };

  constructor({ paragraph }: Options = {}) {
    this.paragraphTag = paragraph ? paragraph.tagName : 'div';
  }

  finalize(chunk: Chunk): string {
    const { align, list } = chunk.attributes;
    if (list === 'bullet') return '</ul>';
    else if (list === 'ordered') return '</ol>';
    else if (align) return `</${this.paragraphTag}>`;
    return '';
  }

  /// Apply align and/or list formatting to an HTML fragment.
  formatLines(html: string, chunk: Chunk, prior?: Chunk): string {
    const { align, list } = chunk.attributes;
    const priorAlign = prior && prior.attributes.align;
    const priorList = prior && prior.attributes.list;
    if (list) {
      const style = align ? ` style="text-align: ${align};"` : '';
      html = `<li${style}>${html}</li>`;
    }
    if (list != priorList) {
      if (list) {
        if (list === 'bullet') html = `<ul style="${lineStyles.list}">${html}`;
        else if (list === 'ordered')
          html = `<ol style="${lineStyles.list}">${html}`;
      }
      if (priorList === 'bullet') html = `</ul>${html}`;
      else if (priorList === 'ordered') html = `</ol>${html}`;
    }
    if (!list && align != priorAlign) {
      if (align)
        html = `<${this.paragraphTag} style="text-align: ${align}">${html}`;
      if (priorAlign) html = `</${this.paragraphTag}>${html}`;
    }
    return html;
  }

  generate(chunks: Chunk[]): string {
    return (
      chunks
        .map((chunk, i) => this.generateOne(chunk, chunks[i - 1]))
        .join('') + this.finalize(chunks[chunks.length - 1])
    );
  }

  generateOne(chunk: Chunk, prior?: Chunk): string {
    let html = '';

    if (isText(chunk.content)) {
      html = XmlEntities.encode(chunk.content);
    } else {
      const key = Object.keys(chunk.content)[0];
      if (this.embedFormatters[key])
        html = this.embedFormatters[key](chunk.content[key], chunk.attributes);
      else throw new Error(`Unrecognized embed: ${chunk.content}`);
    }

    Object.keys(this.textFormatters).forEach((k) => {
      const attr = chunk.attributes[k];
      if (attr) html = this.textFormatters[k](html, attr);
    });

    html = this.formatLines(html, chunk, prior);
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
}
