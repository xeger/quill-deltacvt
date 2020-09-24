import { XmlEntities } from 'html-entities';

import {
  Attributes,
  Content,
  Chunk,
  Generator,
  isEmbed,
  isText,
} from '../interfaces';

export type EmbedFormatter = (
  content: string | Record<string, string>,
  attributes: Attributes
) => string;

export type TextFormatter = (text: string, value?: boolean | string) => string;

const BODY_STYLE =
  'color: #303030; font-weight: 400; white-space: pre-wrap; font-family: sans-serif';

/**
 * Inline CSS styles for selected line formats.
 */
const LINE_STYLES = {
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
 *   - newlines are preserved
 *   - the `<div>` tag is used instead of `<p>` for paragraphs
 *   - left-aligned paragraphs are not surrounded by a tag
 *   - adjacent paragraphs with the same alignment use the same <div> tag
 *   - all styles are inline
 *   - HTML tags (b, i, em, etc) are preferred to `<span style=>`
 *
 * The resulting HTML is minimal in size, self contained with no need
 * for external stylesheets, minimally influenced by user-agent stylesheets,
 * and looks visually similar to Quill output in modern browsers, although
 * structurally quite different
 *
 * If you generate fragments, make sure to apply a `white-space: pre-wrap` to
 * an enclosing tag, else the HTML will not look right at all!
 */
export default class MinimalHTML implements Generator {
  embedFormatters: Record<string, EmbedFormatter> = { ...EMBEDS };
  strict?: true;
  textFormatters: Record<string, TextFormatter> = { ...TEXTS };

  constructor({ strict }: Options = {}) {
    this.strict = strict;
  }

  formatChars(content: Content, attributes: Attributes): string {
    let html: string;

    if (isText(content)) {
      html = XmlEntities.encode(content);
    } else if (isEmbed(content)) {
      const key = Object.keys(content)[0];
      if (this.embedFormatters[key])
        html = this.embedFormatters[key](content[key], attributes);
      else {
        if (this.strict) throw new Error(`Unknown embed: ${key}`);
        else html = '';
      }
    } else {
      if (this.strict)
        throw new Error(`Unknown insert type: ${typeof content}`);
      else html = '';
    }

    Object.keys(this.textFormatters).forEach((k) => {
      const attr = attributes[k];
      if (attr) html = this.textFormatters[k](html, attr);
    });
    if (this.strict)
      Object.keys(attributes).forEach((k) => {
        if (!this.textFormatters[k]) throw new Error(`Unknown attribute: ${k}`);
      });

    return html;
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

  chunksToLines(chunks: Chunk[]): Line[] {
    const lines: Line[] = [];
    let current: Line | undefined;

    for (let i = 0; i < chunks.length; i++) {
      const { attributes } = chunks[i];
      const { content } = chunks[i];
      let newline = false;
      if (isText(content) && content.endsWith('\n')) {
        newline = true;
        //content = content.slice(0, -1);
      }
      const text = this.formatChars(content, attributes);
      const align = attributes.align as string | undefined;
      const list = attributes.list as string | undefined;
      if (current) {
        current.text = current.text + text;
        if (newline) {
          lines.push(current);
          current = undefined;
        }
      } else {
        if (newline) lines.push({ text, align, list });
        else current = { text, align, list };
      }
    }
    if (current) lines.push(current);

    lines.push({ text: '' });

    return lines;
  }

  generate(chunks: Chunk[]): string {
    const lines = this.chunksToLines(chunks);
    return lines.map((line, i) => this.formatLine(line, lines[i - 1])).join('');
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
