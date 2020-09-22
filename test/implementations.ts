import { Chunk, Generator } from '../src/interfaces';

export class NullGenerator implements Generator {
  chunks: Chunk[] = [];

  generate(chunks: Chunk[]): string {
    this.chunks = chunks;
    return '';
  }
  isLineFormat(): boolean {
    return false;
  }
  wrap(): string {
    return '';
  }
}
