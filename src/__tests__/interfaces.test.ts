/* eslint-disable @typescript-eslint/no-unused-vars */
import TheirOp from 'quill-delta/dist/Op';
import { Op as OurOp } from '../interfaces';

describe('interfaces', () => {
  describe('Op', () => {
    it('is homomorphic quill-delta', () => {
      const mine: OurOp[] = [];
      const theirs: TheirOp[] = [];

      const toTheirs: TheirOp[] = mine;
      const fromTheirs: OurOp[] = theirs;
    });
  });
});
