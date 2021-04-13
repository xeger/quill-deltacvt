import { XmlEntities } from 'html-entities';

import {
  Attributes,
  Content,
  Chunk,
  Generator,
  isEmbed,
  isText,
} from '../interfaces';

import { escapeTextContent } from "../internals";

export type EmbedFormatter = (
  content: string | Record<string, string>,
  attributes: Attributes
) => string;

export type TextFormatter = (span: TextSpan, value?: boolean | string) => void;

export class TextSpan {
  text?: string;
  styles: string[];

  constructor(text: string) {
    this.styles = [];
    this.text = text;
  }

  toString(): string {
    const style = this.styles.length ? ` style="${this.styles.join(';')}"` : '';
    if (style.length) return `<span${style}>${this.text}</span>`;
    else return this.text || '';
  }
}

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
export default abstract class BaseHTML implements Generator {
  embedFormatters: Record<string, EmbedFormatter>;
  strict?: true;
  textFormatters: Record<string, TextFormatter>;

  constructor(
    embedFormatters: Record<string, EmbedFormatter>,
    textFormatters: Record<string, TextFormatter>,
    { strict }: Options = {}
  ) {
    this.embedFormatters = embedFormatters;
    this.strict = strict;
    this.textFormatters = textFormatters;
  }

  chunksToLines(chunks: Chunk[]): Line[] {
    const lines: Line[] = [];
    let current: Line | undefined;

    for (let i = 0; i < chunks.length; i++) {
      const { attributes } = chunks[i];
      const { content } = chunks[i];
      let newline = false;
      if (isText(content) && content.endsWith('\n')) newline = true;
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

  createTextSpan(text: string): TextSpan {
    return new TextSpan(text);
  }

  formatChars(content: Content, attributes: Attributes): string {
    let text: string;

    if (isText(content)) {
      text = escapeTextContent(content);
    } else if (isEmbed(content)) {
      const key = Object.keys(content)[0];
      if (this.embedFormatters[key])
        text = this.embedFormatters[key](content[key], attributes);
      else {
        if (this.strict) throw new Error(`Unknown embed: ${key}`);
        else text = '';
      }
    } else {
      if (this.strict)
        throw new Error(`Unknown insert type: ${typeof content}`);
      else text = '';
    }

    const span = this.createTextSpan(text);
    Object.keys(this.textFormatters).forEach((k) => {
      const attr = attributes[k];
      if (attr) this.textFormatters[k](span, attr);
    });
    if (this.strict)
      Object.keys(attributes).forEach((k) => {
        if (!this.textFormatters[k]) throw new Error(`Unknown attribute: ${k}`);
      });

    return span.toString();
  }

  abstract formatLine(current: Line, prior: Line): string;

  generate(chunks: Chunk[]): string {
    const lines = this.chunksToLines(chunks);
    return lines.map((line, i) => this.formatLine(line, lines[i - 1])).join('');
  }

  abstract isLineFormat(format: string): boolean;

  abstract wrap(fragment: string): string;
}
