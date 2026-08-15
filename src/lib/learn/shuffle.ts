import type { Checkpoint } from "./types";

/* Option order is randomised so the correct answer never settles into a
   habitual position — a reader should not be able to pattern-match "it's
   usually B". The shuffle is seeded on the question id plus the attempt
   number, which means:

     - the order is stable while a reader is looking at one attempt
       (re-renders do not reshuffle under them), and
     - a second attempt presents the same question in a different order,
       so passing on retry cannot come from remembering a position. */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export type ShuffledQuestion = {
  id: string;
  question: string;
  /** options in display order */
  options: string[];
  /** index into `options` that is correct */
  answer: number;
  explain: string;
  /** display index → original index, for storing an answer that survives reshuffles */
  toOriginal: number[];
};

export function shuffleCheckpoint(checkpoint: Checkpoint, attempt: number): ShuffledQuestion {
  const rand = seededRandom(hash(`${checkpoint.id}:${attempt}`));
  const order = checkpoint.options.map((_, i) => i);
  // Fisher-Yates with the seeded generator
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    id: checkpoint.id,
    question: checkpoint.question,
    options: order.map((i) => checkpoint.options[i]),
    answer: order.indexOf(checkpoint.answer),
    explain: checkpoint.explain,
    toOriginal: order,
  };
}
