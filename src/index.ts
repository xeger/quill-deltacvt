import SimpleHTML from './generators/SimpleHTML';
import {
  Attributes,
  Chunk as IChunk,
  Content,
  Embed,
  DeltaOperation,
  Generator,
  isText,
} from './interfaces';

const hasLineFormats = (attr: Attributes, g: Generator) =>
  Object.keys(attr).some(g.isLineFormat);

/**
 * Split a string on '\n' (but include the newline at the end of each,
 * unlike String.split).
 */
function splitLines(text: string) {
  const content: string[] = [];
  for (let i = 0; ; ) {
    const j = text.indexOf('\n', i);
    if (j >= 0) {
      content.push(text.slice(i, j + 1));
      i = j + 1;
    } else {
      content.push(text.slice(i));
      break;
    }
  }
  // TODO: fix the algorithm so this hack isn't necessary.
  return content.filter((s) => s);
}

class Chunk implements IChunk {
  attributes: Attributes;
  content: Content;

  constructor(content: Content) {
    this.attributes = {};
    this.content = content;
  }

  applyFrom(a?: Attributes): void {
    if (!a) return;
    Object.entries(a).forEach(([k, v]) => (this.attributes[k] = v));
  }

  applyLineFrom(a: Attributes, g: Generator): void {
    Object.entries(a).forEach(([k, v]) => {
      if (g.isLineFormat(k)) this.attributes[k] = v;
    });
  }

  applyTo(a: Attributes): void {
    if (!this.attributes) return;
    Object.entries(this.attributes || {}).forEach(([k, v]) => {
      a[k] = v;
    });
  }

  hasNewline(): boolean {
    return isText(this.content) && this.content.includes('\n');
  }
}

export function generate(
  ops: DeltaOperation[],
  g: Generator = new generators.SimpleHTML()
): string {
  const chunks: Chunk[] = [];

  ops.forEach((op) => {
    const { attributes = {} } = op;
    let { insert } = op;

    if (hasLineFormats(attributes, g) && isText(insert)) {
      for (let j = chunks.length - 1; !chunks[j].hasNewline(); j--)
        chunks[j].applyLineFrom(attributes, g);
      const priorChunk = chunks[chunks.length - 1];
      if (priorChunk && isText(priorChunk.content) && isText(insert)) {
        priorChunk.content = `${priorChunk.content}${insert[0]}`;
        insert = insert.slice(1);
      }
    }

    const lines: (string | Embed)[] = isText(insert)
      ? splitLines(insert)
      : [insert];
    lines.forEach((line) => {
      const chunk = new Chunk(line);
      chunk.applyFrom(attributes);
      chunks.push(chunk);
    });
  });

  return g.generate(chunks);
}

export const generators = { SimpleHTML };
