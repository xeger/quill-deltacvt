import MinimalHTML from './generators/MinimalHTML';
import { Op, Generator } from './interfaces';
import { convertOpsToChunks } from './internals';

export * from './interfaces';

/**
 * Transform Quill Delta operations into a document fragment.
 *
 * @see MinimalHTML for a description of the default generator
 */
export function generateFragment(
  ops: Op[],
  g: Generator = new generators.MinimalHTML()
): string {
  if (!ops) return '';
  return g.generate(convertOpsToChunks(ops, g));
}

/**
 * Transform Quill Delta operations into a complete document.
 *
 * @see MinimalHTML for a description of the default generator
 */
export function generate(
  ops: Op[],
  g: Generator = new generators.MinimalHTML()
): string {
  return g.wrap(generateFragment(ops, g));
}

export const generators = { MinimalHTML };
