// The words on the How it works screen (V2-20). Edit them here. The same text, in plain form, is in
// `docs/how-it-works.md`. A piece of a paragraph is plain text, or bold or italic (only one sentence uses it, on purpose).
export type TextPiece = string | { text: string; bold?: true; italic?: true };
export type HowItWorksSection = {
  /** Shown in the small grey capitals, like the "Game length" label. */
  heading: string;
  /** Each paragraph is a list of pieces. */
  paragraphs: ReadonlyArray<ReadonlyArray<TextPiece>>;
};
export const HOW_IT_WORKS_TITLE = 'How it works';
export const HOW_IT_WORKS_SECTIONS: ReadonlyArray<HowItWorksSection> = [
  {
    heading: 'Sequence, tempo & your swing',
    paragraphs: [
      [
        "Every swing has a sequence and a rhythm. Whether you're playing Long Game or Short Game, the backswing takes longer than the downswing. Swing Sequence turns that timing into audio cues so you can hear, feel and repeat the movement.",
      ],
      // Its own paragraph, so it stands out.
      [{ text: 'Repetition builds rhythm. Rhythm builds consistency.', bold: true }],
      [
        'The first cue marks your takeaway and the last marks impact. In between, you\'ll hear your weight shift, then the top of your backswing. Turn on the background loop to help you settle into the rhythm of your tempo or toggle off the weight shift or top to focus solely on motion.',
      ],
    ],
  },
  {
    heading: 'Long game',
    paragraphs: [
      [
        'Gameplay is for full swings, from rapid to smooth. A faster tempo doesn\'t mean a better swing. Explore the different options and find the rhythm that feels natural to you.',
      ],
      [
        'Practice Drills slow things down so you can focus on each part of the sequence. Take one swing, reset, then follow the 4-3-2-1 countdown that leads into your next takeaway.',
      ],
    ],
  },
  {
    heading: 'Short game',
    paragraphs: [
      [
        'The same principle, with a shorter swing sequence designed for chips, pitches and putts. Weight shift is more subtle in the short game, so you can turn its audio cue on or off at any time using the Weight shift button.',
      ],
    ],
  },
  {
    heading: 'Configure weight shift',
    paragraphs: [
      [
        // "in the current card" in the original text; the panel is at the bottom of the screen since V2-09.
        'We estimate that the weight shift takes place at 3/4 of the way through the backswing but golfers may vary. Some may shift their weight slightly earlier or later in their swing sequence. Open Configure weight shift at the bottom of the screen to adjust the timing of the shift cue until it matches your natural movement.',
      ],
    ],
  },
];
