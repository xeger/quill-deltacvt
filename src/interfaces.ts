/// Formats that apply to a piece of Quill content.
export type Attributes = Record<string, boolean | string>;

/// A piece of Quill content.
export type Content = Embed | Text;

/// Standalone representation of a Quill DeltaOperation.
/// @see https://github.com/quilljs/delta/blob/master/src/Op.ts
export interface Op {
  attributes?: Attributes;
  insert: Content;
}

/// A piece of Quill content that isn't text (e.g. image, video).
/// It always has exactly one key, identifying the type of embed
/// (image, etc)
export type Embed = { [k: string]: string | Record<string, string> };

/// A piece of textual Quill content.
export type Text = string;

/// Type discriminator for embedded Content.
export const isEmbed = (o: unknown): o is Embed => typeof o === 'object' && !!o;

/// Type discriminator for textual Content.
export const isText = (o: unknown): o is Text => typeof o === 'string';

/// Self-contained piece of Quill content that has been normalized to include
/// all applicable line and character formats and to contain at most one newline
/// (which is guaranteed to be the final character, if present).
export interface Chunk {
  attributes: Attributes;
  content: Content;
}

/// An object that converts content chunks into another format.
export interface Generator {
  /// Transform chunks into an HTML fragment.
  generate(chunks: Chunk[]): string;
  /// Determine whether the named attribute is a line format.
  isLineFormat(attribute: string): boolean;
}
