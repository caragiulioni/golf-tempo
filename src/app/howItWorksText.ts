// The words on the How it works screen (V2-26: the developer's and the brother's versions merged, then edited by the developer).
// Edit them here. The same text, in plain form, is in `docs/how-it-works.md`. There is no bold or italic on
// purpose. A piece of a paragraph can still be plain text, or bold or italic, if that is wanted later.
export type TextPiece = string | { text: string; bold?: true; italic?: true };
export type HowItWorksSection = {
  /** Shown in the small grey capitals, like the "Game length" label. Left out for the opening paragraph. */
  heading?: string;
  /** Each paragraph is a list of pieces. */
  paragraphs: ReadonlyArray<ReadonlyArray<TextPiece>>;
};
export const HOW_IT_WORKS_TITLE = 'How it works';
export const HOW_IT_WORKS_SECTIONS: ReadonlyArray<HowItWorksSection> = [
  {
    paragraphs: [
      [
        'The Swing Sequencer helps you develop consistent timing and efficiency in your golf swing, using audio cues you can listen to while you practice. Many things contribute to a good swing, and sound rhythm, sequencing and the tempo that suits you are among them. The Swing Sequencer is a tool for training these elements and is designed to complement the other components of your swing.',
      ],
    ],
  },
  {
    heading: 'How to practice',
    paragraphs: [
      [
        "Set your phone in front of you where you swing and watch the animation to learn each cue. In time you'll sync without it, based on the sound of the rhythm alone. Use it at the range, on a simulator or while swinging a club in your living room.",
      ],
    ],
  },
  {
    heading: "What you'll hear",
    paragraphs: [
      [
        "Cues play at takeaway, weight shift, top and impact. Start with all of them on, then switch off the weight shift or top if you don't need them. A background loop, off by default, adds a fuller sound.",
      ],
      [
        'The top is an outcome, not a goal. Focus on takeaway, weight shift and impact: shift well, let the club keep rising, follow through on time. The double beat of weight shift and top, midway through the sequence, is intended to provide a memorable cadence you can carry into play or practice without the app.',
      ],
    ],
  },
  {
    heading: 'Long game',
    paragraphs: [
      [
        'Gameplay covers full swings of varying tempos. There is no right tempo, only the one that suits your swing or your stage of development. Explore the options and find the rhythm that feels natural, or choose a slower one to work on your sequencing.',
      ],
      [
        'Practice Drills play in slow motion, which many coaches favor for learning sequencing: take one swing, reset, then follow the 4-3-2-1 countdown into your next takeaway.',
      ],
    ],
  },
  {
    heading: 'Short game',
    paragraphs: [
      [
        "Short game works the same way, for swings and strokes that don't coil the body: pitching, chipping, putting or an iron punch shot out of trouble.",
      ],
    ],
  },
  {
    heading: 'Configure weight shift',
    paragraphs: [
      [
        "We set the weight shift at 75% of the way through the backswing, from observation and personal use, and we recommend you start there. This timing isn't settled science, and bodies vary, so the setting is adjustable. Open Configure weight shift, at the bottom, adjust from that starting point, then press APPLY to save it.",
      ],
    ],
  },
];
