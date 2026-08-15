import type { Lesson } from "../types";

/* Level 7 — Think Like an Investor.
   Closes the loop: the course has taught analysis, allocation and composure,
   and this level turns those into a process that improves with use. */

export const LEVEL_7_LESSONS: Lesson[] = [
  {
    slug: "defending-a-decision",
    levelId: 7,
    order: 1,
    title: "Defending a decision with evidence",
    goal: "State the case against your own position as strongly as the case for it.",
    minutes: 7,
    difficulty: "applied",
    steps: [
      {
        heading: "You do not understand a decision until you can argue both sides",
        body: [
          "If you can only explain why you are right, you have collected supporting evidence rather than examined the question.",
          "The test: state the strongest argument against your position, in a form its holder would accept as fair. If your version of their argument sounds foolish, you have not found it yet.",
        ],
      },
      {
        heading: "Every position has someone on the other side",
        body: [
          "You bought at ₹240. Someone sold at ₹240. They are not less informed than you by default — they may know something you do not, or simply need the money.",
          "Asking what a reasonable person on the other side believes is a fast way to find the weakness in your own reasoning.",
        ],
        example: {
          company: "coral",
          title: "Both sides of Coral & Co at ₹240",
          rows: [
            { label: "For", value: "26% ROE, 12% margin, low debt, steady rebuying" },
            { label: "Against", value: "P/E 25 for 9% growth; rivals discounting" },
            { label: "The real question", value: "Does the margin hold under price competition?" },
          ],
          note: "Both cases are honest. Stating them together locates the single question the decision actually depends on.",
        },
        checkpoint: {
          id: "l7-1-c1",
          question: "What does it mean if you cannot construct a fair argument against your position?",
          options: [
            "Your position is exceptionally strong",
            "You have probably not examined it properly",
            "The other side is irrational",
            "You should increase the position",
          ],
          answer: 1,
          explain:
            "Real disagreements have reasonable people on both sides. An inability to state the opposing case usually means you have not looked for it.",
        },
      },
      {
        heading: "Evidence, not conviction, is the defence",
        body: [
          "'I am very confident' is not a defence. Confidence measures how you feel, not how much support your view has.",
          "A defensible case cites specific figures, states what would refute it, and acknowledges what remains unknown. Strength of feeling and strength of evidence are frequently unrelated.",
        ],
        checkpoint: {
          id: "l7-1-c2",
          question: "Which is the stronger defence of a decision?",
          options: [
            "'I have followed this company for years and I am confident'",
            "'Margins held above 11% through the last downturn, debt is 0.27, and I would reconsider below 9%'",
            "'Several analysts agree with me'",
            "'It has risen since I bought it'",
          ],
          answer: 1,
          explain:
            "Only the second cites verifiable evidence and a condition that could refute it. The others describe feelings, authority or recent price movement.",
        },
      },
      {
        heading: "Price movement is not evidence",
        body: [
          "A rise after you buy does not confirm your reasoning, and a fall does not refute it. Prices move for reasons unconnected to your analysis all the time.",
          "Your case is confirmed when the business performs as you predicted — margins held, growth arrived — not when the quote agrees with you.",
        ],
      },
    ],
    recap: [
      "State the opposing case fairly before defending your own.",
      "Someone reasonable took the other side of your trade.",
      "Cite evidence and refutation conditions, not confidence.",
      "Price movement neither confirms nor refutes your reasoning.",
    ],
    finalQuiz: {
      id: "l7-1-final",
      question: "Your holding rises 40% in three months. What has this proven about your analysis?",
      options: [
        "That it was correct",
        "Very little — prices move for many reasons unrelated to your reasoning",
        "That you should buy more",
        "That the company is well managed",
      ],
      answer: 1,
      explain:
        "A short-run gain is weak evidence. The case is validated by the business delivering what you predicted, over the horizon you set.",
    },
  },

  {
    slug: "reviewing-your-mistakes",
    levelId: 7,
    order: 2,
    title: "Reviewing your mistakes honestly",
    goal: "Review past decisions by their reasoning rather than their outcome.",
    minutes: 8,
    difficulty: "applied",
    steps: [
      {
        heading: "Good decisions can lose and bad ones can win",
        body: [
          "Outcomes contain luck. A well-reasoned decision can lose money because something genuinely unforeseeable happened; a reckless one can profit because the market rose.",
          "If you judge only by outcome, you will learn the wrong lessons from both.",
        ],
      },
      {
        heading: "Grade the process and the outcome separately",
        body: [
          "Two questions per decision. Was the reasoning sound given what was knowable at the time? And what happened?",
          "That produces four boxes. Good process with a bad outcome is bad luck — repeat it. Bad process with a good outcome is the most dangerous box, because success rewards a habit that will eventually cost you.",
        ],
        example: {
          company: "ironvale",
          title: "The four boxes",
          rows: [
            { label: "Good process, good outcome", value: "Earned — repeat" },
            { label: "Good process, bad outcome", value: "Bad luck — repeat anyway" },
            { label: "Bad process, good outcome", value: "Dangerous — do not repeat" },
            { label: "Bad process, bad outcome", value: "Deserved — learn" },
          ],
          note: "The third row is where most long-term damage begins, because it feels identical to the first at the time.",
        },
        checkpoint: {
          id: "l7-2-c1",
          question: "You buy on a tip with no research and make 40%. How should you record it?",
          options: [
            "A success worth repeating",
            "Bad process with a good outcome — profitable this time, not repeatable",
            "Proof that research is unnecessary",
            "A neutral event",
          ],
          answer: 1,
          explain:
            "The profit was real; the method was not sound. Recording it as a success teaches you to repeat a habit that will eventually lose more than it made.",
        },
      },
      {
        heading: "Hindsight rewrites memory",
        body: [
          "Once you know the outcome, the reasoning that led there feels obvious and everything else feels foolish. This is why the written case from Level 4 matters so much.",
          "Reviewing against what you actually wrote, rather than what you remember thinking, is the difference between real review and comfortable storytelling.",
        ],
        checkpoint: {
          id: "l7-2-c2",
          question: "Why review against a written case rather than memory?",
          options: [
            "Written records are legally required",
            "Hindsight distorts memory so that whatever happened feels like what you expected",
            "Memory fades after a year",
            "Written cases are more detailed",
          ],
          answer: 1,
          explain:
            "Hindsight bias reliably rewrites recollection toward the known outcome. Only a contemporaneous record preserves what you actually believed.",
        },
      },
      {
        heading: "Look for patterns, not individual verdicts",
        body: [
          "One review teaches little. Ten reviews reveal tendencies: consistently paying too much for growth, selling too early after falls, over-weighting recent news.",
          "Patterns are what you can actually fix. Individual decisions are mostly noise.",
        ],
      },
    ],
    recap: [
      "Outcomes contain luck; process is what you control.",
      "Grade reasoning and result separately — four boxes, not two.",
      "Bad process with a good outcome is the most dangerous case.",
      "Review against what you wrote, and look for patterns across many decisions.",
    ],
    finalQuiz: {
      id: "l7-2-final",
      question: "A carefully researched holding loses money after an unforeseeable event. What is the correct lesson?",
      options: [
        "The research process was wrong and should be replaced",
        "The process may have been sound — bad outcomes happen to good decisions",
        "Research does not work",
        "Never invest in that industry again",
      ],
      answer: 1,
      explain:
        "If the reasoning was sound given what was knowable, the process was correct. Abandoning good process after unlucky outcomes is how investors get worse over time.",
    },
  },

  {
    slug: "improving-your-process",
    levelId: 7,
    order: 3,
    title: "Improving your process over time",
    goal: "Turn everything in this course into a repeatable routine you can improve.",
    minutes: 8,
    difficulty: "applied",
    steps: [
      {
        heading: "A process is what remains when enthusiasm fades",
        body: [
          "Most people research carefully for the first few decisions, then drift into acting on headlines and hunches.",
          "A written process is what keeps the standard steady on the days you cannot be bothered — which are the days most likely to produce your worst decisions.",
        ],
      },
      {
        heading: "The full loop, in one place",
        body: [
          "Understand the business. Check the numbers — profitable, safe, real, fairly priced. Write a five-sentence case with reversal conditions. Size the position so being wrong is survivable.",
          "Then act, wait, and review on a schedule rather than on price movement.",
        ],
        example: {
          company: "meridian",
          title: "The loop applied to Meridian Bank",
          rows: [
            { label: "Understand", value: "Lends deposits, earns the spread" },
            { label: "Numbers", value: "ROE 12%, EPS ₹10, P/E 19" },
            { label: "Case", value: "Steady lending growth, conservative book" },
            { label: "Wrong if", value: "Bad loans rise sharply two quarters running" },
            { label: "Size", value: "15% — stable, well understood" },
          ],
          note: "Every step in this course appears once in this table. The process is not complicated; it is just written down and followed.",
        },
        checkpoint: {
          id: "l7-3-c1",
          question: "What is the main benefit of a written process?",
          options: [
            "It guarantees profitable decisions",
            "It holds the standard steady when attention and motivation fall",
            "It removes the need to think",
            "It makes decisions faster",
          ],
          answer: 1,
          explain:
            "Process protects against your own inconsistency. Careful decisions are easy when engaged; the process is for when you are not.",
        },
      },
      {
        heading: "Improve it deliberately, one change at a time",
        body: [
          "After ten reviews, patterns appear. Change one rule at a time in response — 'no purchase above 30 times earnings without written growth evidence' — and observe the effect.",
          "Changing five rules at once teaches you nothing, because you cannot tell which change mattered.",
        ],
        checkpoint: {
          id: "l7-3-c2",
          question: "You notice you consistently overpay for fast-growing companies. What is the best response?",
          options: [
            "Stop investing in growth companies entirely",
            "Add one specific rule about valuation evidence for growth purchases, and review its effect",
            "Change several rules at once for a fresh start",
            "Accept it as unavoidable",
          ],
          answer: 1,
          explain:
            "A targeted rule addresses the pattern without discarding a whole category. Changing one thing at a time is what makes the effect measurable.",
        },
      },
      {
        heading: "Where this course ends and practice begins",
        body: [
          "You can now read a share as ownership, follow money through the statements, calculate and interpret the core ratios, compare companies fairly, size positions, and respond to shocks with a plan.",
          "None of it is investment advice, and every company in these lessons was invented. What you have is a method for asking better questions — and the only way it improves is by being used and reviewed.",
        ],
      },
    ],
    recap: [
      "Process is what holds your standard steady when motivation fades.",
      "The loop: understand, check, write, size, act, review on schedule.",
      "Change one rule at a time so you can see what worked.",
      "The method improves only through use and honest review.",
    ],
    finalQuiz: {
      id: "l7-3-final",
      question: "What single habit most reliably improves an investor over years?",
      options: [
        "Reading more market news each day",
        "Writing down reasoning in advance and reviewing it honestly against what happened",
        "Trading more frequently to gain experience",
        "Following experienced investors closely",
      ],
      answer: 1,
      explain:
        "Recorded reasoning plus honest review is the only reliable feedback loop available. Without it, experience accumulates without teaching anything.",
    },
  },
];
