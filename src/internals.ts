import {
  Attributes,
  Chunk as IChunk,
  Content,
  Op,
  Generator,
  isText,
} from './interfaces';

class Chunk implements IChunk {
  attributes: Attributes;
  content: Content;

  constructor(content: Content, attributes?: Attributes) {
    this.attributes = attributes ? { ...attributes } : {};
    this.content = content;
  }

  applyLineFrom(a: Attributes, g: Generator): void {
    Object.entries(a).forEach(([k, v]) => {
      if (g.isLineFormat(k)) this.attributes[k] = v;
    });
  }

  hasNewline(): boolean {
    return isText(this.content) && this.content.includes('\n');
  }
}

const hasLineFormats = (attr: Attributes, g: Generator) =>
  Object.keys(attr).some(g.isLineFormat);

/**
 * Convert a Quill delta into an equivalent sequence of Chunk.
 */
export function convertOpsToChunks(ops: Op[], g: Generator): IChunk[] {
  const chunks: Chunk[] = [];

  ops.forEach((op) => {
    if (op.insert === undefined)
      throw new Error(`Unsupported quill-delta Op: ${JSON.stringify(op)}`);

    const { attributes = {} } = op;
    const { insert } = op;

    if (isText(insert)) {
      // Line formats need to be applied to all prior chunks until the last newline.
      if (hasLineFormats(attributes, g))
        for (let i = chunks.length - 1; i >= 0 && !chunks[i].hasNewline(); i--)
          chunks[i].applyLineFrom(attributes, g);

      // This op is broken into single-line chunks for convenience,
      let i = 0;
      let j = insert.indexOf('\n');
      while (i < insert.length && j >= 0) {
        chunks.push(new Chunk(insert.slice(i, j + 1), attributes));
        i = j + 1;
        j = insert.indexOf('\n', j + 1);
      }
      if (i < insert.length)
        chunks.push(new Chunk(insert.slice(i), attributes));
    } else {
      chunks.push(new Chunk(insert, attributes));
    }
  });

  return chunks;
}

const escapeCharReplacements = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;',
};
export function escapeTextContent(content: string): string {
  const repl = (c: string) => escapeCharReplacements[c];
  return content.replace(/[<>"&]/g, repl);
}

