/// Formats that apply to a piece of Quill content.
export type Attributes = Record<string, boolean | string>;

/// A piece of Quill content.
export type Content = string | Embed;

/// Standalone representation of a Quill DeltaOperation.
/// @see https://github.com/quilljs/delta/blob/master/src/Op.ts
export interface Op {
  attributes?: Attributes;
  insert?: Content;
}

/// A piece of Quill content that isn't text (e.g. image, video).
/// It always has exactly one key, identifying the type of embed
/// (image, etc)
export type Embed = { [k: string]: string | Record<string, string> };

/// Type discriminator for embedded Content.
export const isEmbed = (o: unknown): o is Embed => typeof o === 'object' && !!o;

/// Type discriminator for textual Content.
export const isText = (o: unknown): o is string => typeof o === 'string';

/// Self-contained piece of Quill content that has been normalized to include
/// all applicable line and character formats and to contain at most one newline
/// (which is guaranteed to be the final character, if present).
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
