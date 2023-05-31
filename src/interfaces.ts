/// Formats that apply to a piece of Quill content.
export type Attributes = Record<string, any>;

/**
 * A piece of Quill content. Ideally this would be typed more precisely, but
 * we are imitating Quill 1.3.7 typings to ensure interface compatibility.
 *
 * @see isEmbed() to identify embedded content (e.g. images)
 * @see isText() to identify textual content
 */
export type Content = any;

/**
 * Standalone representation of a Quill DeltaOperation.
 * @see https://github.com/quilljs/delta/blob/master/src/Op.ts
 */
export interface Op {
  attributes?: Attributes;
  insert?: Content;
}

/// Type discriminator for embedded Content.
export const isEmbed = (o: unknown): o is object =>
  typeof o === 'object' && !!o;

/// Type discriminator for textual Content.
export const isText = (o: unknown): o is string => typeof o === 'string';

/**
 * Self-contained piece of Quill content that has been normalized to include
 * all applicable line and character formats and to contain at most one newline
 * (which is guaranteed to be the final character, if present).
 *
 * Chunks compensate for a quirk of the Quill delta format where block-scoped
 * formats (e.g. align, list) apply to an entire line, which may include numerous
 * prior ops; conversely, a single op may contain numerous lines which all carry
 * the same block-scoped format.
 *
 * Chunks also vary from Ops in that they are guaranteed to have an Attributes
 * object.
 */
export interface Chunk {
  attributes: Attributes;
  content: Content;
}

/// An object that converts content chunks into another format.
export interface Generator {
  /// Transform chunks into a document fragment.
  generate(chunks: Chunk[]): string;
  /// Determine whether the named attribute is a line format.
  isLineFormat(attribute: string): boolean;
  /// Transform generated fragment into a well-formed, complete document.
  wrap(fragment: string): string;
}

/**
 * Data type used internally by Generator implementations.
 * Represents a single line of text in the document (which may change over time as deltas are applied).
 */
export interface Line {
  align?: string;
  list?: string;
  text: string;
}

/**
 * Settings that are common to all conversions.
 */
export interface Options {
  /// Throw an error if unknown Quill content (e.g. an embed) is encountered.
  strict: boolean;
}
