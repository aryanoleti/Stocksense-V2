import type { Lesson } from "../types";

/* Level 4 — Analyzing Companies.
   The first level where the reader is asked to reach a conclusion and defend
   it, rather than to compute something with one right answer. */

export const LEVEL_4_LESSONS: Lesson[] = [
  {
    slug: "comparing-two-companies",
    levelId: 4,
    order: 1,
    title: "Comparing two companies fairly",
    goal: "Set up a comparison that does not quietly favour one business from the start.",
    minutes: 8,
    difficulty: "applied",
    steps: [
      {
        heading: "Most comparisons are rigged before they begin",
        body: [
          "Pick the wrong metric and you have decided the outcome. Compare a retailer and a software firm on net margin and software wins automatically — not because it is better run, but because the question favoured it.",
          "A fair comparison starts by asking what would count as good performance for each business on its own terms.",
        ],
      },
      {
        heading: "Compare like with like",
        body: [
          "Same industry where possible. Same period, same accounting basis, same treatment of one-off items.",
          "Where the businesses genuinely differ, compare the direction of travel instead of the level: is each improving against its own history?",
        ],
        example: {
          company: "kirana",
          title: "An unfair comparison, corrected",
          rows: [
            { label: "Unfair: net margin", value: "Kirana 4% vs Lumen 20%" },
            { label: "Fairer: margin trend", value: "Kirana 3.2% → 4.0%; Lumen 24% → 20%" },
            { label: "Fairer: ROE", value: "Kirana 14% vs Lumen 24%" },
          ],
          note: "On level, Lumen wins easily. On direction, Kirana is strengthening while Lumen is giving margin away. Both facts are true and both matter.",
        },
        checkpoint: {
          id: "l4-1-c1",
          question: "Why is comparing a retailer's margin with a software firm's misleading?",
          options: [
            "Retailers use different accounting rules",
            "The business models have structurally different margins, so the comparison measures industry, not quality",
            "Margins cannot be compared at all",
            "Software margins are usually fabricated",
          ],
          answer: 1,
          explain:
            "The gap reflects how each business works, not how well it is run. Comparing across models measures the industry rather than the company.",
        },
      },
      {
        heading: "Score across several dimensions",
        body: [
          "One number cannot rank two companies. Build a small scorecard: growth, profitability, safety, cash conversion, and price.",
          "Fill each row honestly, including the rows that go against your preferred answer. A comparison where one company wins every row usually means the scorecard was designed badly.",
        ],
        example: {
          company: "coral",
          title: "Coral & Co against Kirana Kart",
          rows: [
            { label: "Net margin", value: "Coral 12% / Kirana 4%" },
            { label: "ROE", value: "Coral 26% / Kirana 14%" },
            { label: "Debt-to-equity", value: "Coral 0.27 / Kirana 0.75" },
            { label: "P/E", value: "Coral 25 / Kirana 25" },
          ],
          note: "Coral wins on quality and safety at an identical multiple. That is the kind of finding worth acting on — but check whether Kirana's growth is faster before concluding.",
        },
      },
      {
        heading: "Price is the last row, never the first",
        body: [
          "Decide which business you would rather own before you look at what each costs. Otherwise the price anchors your judgement and you will rationalise towards the cheaper one.",
          "Then bring price in. A better business at the same multiple is a straightforward decision; a better business at twice the multiple is a real trade-off.",
        ],
        checkpoint: {
          id: "l4-1-c2",
          question: "Why assess business quality before looking at price?",
          options: [
            "Price is irrelevant to investing",
            "Knowing the price first biases the analysis toward justifying the cheaper option",
            "Prices change too often to use",
            "Quality can only be measured without prices",
          ],
          answer: 1,
          explain:
            "Anchoring is a real effect. Forming a view on the business first keeps the price comparison honest.",
        },
      },
    ],
    recap: [
      "Choosing the metric often decides the winner — choose deliberately.",
      "Compare like with like, or compare direction rather than level.",
      "Use a multi-row scorecard and fill in the inconvenient rows.",
      "Judge the business first, then bring price in.",
    ],
    finalQuiz: {
      id: "l4-1-final",
      question: "Company A wins every row of your scorecard. What should you suspect first?",
      options: [
        "A is obviously the correct choice",
        "The scorecard may be measuring things that favour A's business model",
        "B should be removed from consideration",
        "Scorecards do not work",
      ],
      answer: 1,
      explain:
        "Real businesses trade off strengths against weaknesses. A clean sweep usually means the criteria were tilted, not that one company is perfect.",
    },
  },

  {
    slug: "evidence-checklist",
    levelId: 4,
    order: 2,
    title: "Building an evidence checklist",
    goal: "Turn a vague impression of a company into a list of things you actually verified.",
    minutes: 8,
    difficulty: "applied",
    steps: [
      {
        heading: "The difference between a view and a feeling",
        body: [
          "'I like this company' is a feeling. 'Margins have widened for four years while debt fell' is evidence.",
          "A checklist forces the conversion. It also makes it obvious later which parts of your reasoning were checked and which were assumed.",
        ],
      },
      {
        heading: "What belongs on the list",
        body: [
          "Five areas cover most of what an ordinary reader can verify: growth, profitability, balance sheet safety, cash conversion, and valuation.",
          "For each, record the figure, the period it covers, and where you found it. If you cannot write down the source, it is not evidence.",
        ],
        example: {
          company: "coral",
          title: "A filled checklist for Coral & Co",
          rows: [
            { label: "Growth", value: "Revenue +9% a year, 3 years" },
            { label: "Profitability", value: "Net margin 12%, stable" },
            { label: "Safety", value: "D/E 0.27, interest covered 14x" },
            { label: "Cash", value: "FCF ₹250 cr vs profit ₹288 cr" },
            { label: "Valuation", value: "P/E 25" },
          ],
          note: "Four rows are strong. The fifth is the open question: is 25 times earnings reasonable for 9% growth? The checklist has isolated the actual decision.",
        },
        checkpoint: {
          id: "l4-2-c1",
          question: "What is the main purpose of an evidence checklist?",
          options: [
            "To guarantee the investment succeeds",
            "To separate what you verified from what you assumed",
            "To replace judgement with a formula",
            "To produce a single score",
          ],
          answer: 1,
          explain:
            "The checklist does not decide for you. It makes the basis of the decision visible, which is what lets you review it honestly later.",
        },
      },
      {
        heading: "Write down what would change your mind",
        body: [
          "Before deciding, record the specific evidence that would make you reverse. Margins below 9%. Debt-to-equity above 0.6. Two consecutive quarters of falling revenue.",
          "Doing this in advance is what stops you rewriting the story after the fact. Without it, almost any news can be reinterpreted as confirming what you already believed.",
        ],
        checkpoint: {
          id: "l4-2-c2",
          question: "Why decide in advance what would change your mind?",
          options: [
            "To have an excuse to sell",
            "Because after the fact, people reinterpret evidence to fit the view they already hold",
            "Because rules must be followed exactly",
            "It is a regulatory requirement",
          ],
          answer: 1,
          explain:
            "Confirmation bias operates after the fact. A pre-committed condition is far harder to argue away than a vague intention to stay objective.",
        },
      },
      {
        heading: "Note what you could not check",
        body: [
          "You cannot verify management's honesty, the durability of an advantage, or what a competitor is about to launch.",
          "Write these down as unknowns rather than quietly ignoring them. A decision resting on three verified facts and one large unknown is a different decision from one resting on four verified facts — and you should know which you are making.",
        ],
      },
    ],
    recap: [
      "Convert impressions into recorded, sourced evidence.",
      "Cover growth, profitability, safety, cash and valuation.",
      "Write your reversal conditions before you decide, not after.",
      "List the unknowns explicitly instead of ignoring them.",
    ],
    finalQuiz: {
      id: "l4-2-final",
      question: "Your checklist is strong on four rows and silent on valuation. What is the honest conclusion?",
      options: [
        "It is a good investment",
        "You have identified a good business but not yet whether it is a good price",
        "Valuation does not matter for quality companies",
        "The checklist has failed",
      ],
      answer: 1,
      explain:
        "Business quality and purchase price are separate questions. An excellent company bought at any price is not automatically an excellent investment.",
    },
  },

  {
    slug: "writing-your-investment-case",
    levelId: 4,
    order: 3,
    title: "Writing your investment case",
    goal: "Write a short, falsifiable case for a decision that you can review later.",
    minutes: 7,
    difficulty: "applied",
    steps: [
      {
        heading: "Why write anything down",
        body: [
          "Memory rewrites itself. Six months on, you will remember having predicted whatever actually happened.",
          "A written case fixes what you believed at the time, which is the only way to learn whether your reasoning was sound or you were simply lucky.",
        ],
      },
      {
        heading: "Five sentences is enough",
        body: [
          "What the company does. Why you think it will earn more in future. What you are paying relative to those earnings. What would prove you wrong. How long you expect it to take.",
          "If you cannot complete those five sentences, you do not yet have a case — you have an inclination.",
        ],
        example: {
          company: "coral",
          title: "A complete case for Coral & Co",
          rows: [
            { label: "Business", value: "Packaged goods people rebuy monthly" },
            { label: "Why earnings grow", value: "9% revenue growth, stable 12% margin" },
            { label: "Price", value: "P/E 25" },
            { label: "Wrong if", value: "Margin under 9% or growth under 4%" },
            { label: "Horizon", value: "3 years" },
          ],
          note: "Short enough to write in five minutes, specific enough that in three years you can grade it honestly.",
        },
        checkpoint: {
          id: "l4-3-c1",
          question: "Which element is missing from: 'Strong brand, good margins, growing steadily, I expect it to do well'?",
          options: [
            "The company's name",
            "What price you are paying, and what would prove the case wrong",
            "The industry",
            "Nothing is missing",
          ],
          answer: 1,
          explain:
            "It describes the business but never states the price paid or a falsifiable condition — so it can never be graded right or wrong.",
        },
      },
      {
        heading: "A case must be falsifiable",
        body: [
          "'This is a great company' cannot be wrong, because nothing would ever contradict it.",
          "'Margins will stay above 10% and revenue will grow at least 5% a year for three years' can be wrong, which is exactly what makes it useful. Only falsifiable claims teach you anything.",
        ],
        checkpoint: {
          id: "l4-3-c2",
          question: "Which statement is falsifiable?",
          options: [
            "This company has excellent management",
            "This is a quality business with a bright future",
            "Revenue will grow at least 5% a year for the next three years",
            "The industry is attractive",
          ],
          answer: 2,
          explain:
            "Only the third can be checked against reality on a stated timetable. The others can be defended no matter what happens.",
        },
      },
      {
        heading: "Set a review date",
        body: [
          "Decide now when you will re-read this: after two annual reports, or in eighteen months.",
          "Reviewing on a schedule, rather than when the price moves, is what turns a series of decisions into an improving process. Level 7 returns to this.",
        ],
      },
    ],
    recap: [
      "Write the case down — memory will otherwise rewrite it.",
      "Five sentences: business, why earnings grow, price, disproof, horizon.",
      "A case that cannot be wrong cannot teach you anything.",
      "Schedule the review in advance, independent of price.",
    ],
    finalQuiz: {
      id: "l4-3-final",
      question: "What makes a written investment case genuinely useful later?",
      options: [
        "Its length and detail",
        "That it states specific conditions which could later be shown false",
        "That it agrees with expert opinion",
        "That it predicts the share price",
      ],
      answer: 1,
      explain:
        "Specific, checkable conditions let you grade the reasoning afterwards. Vague optimism survives every outcome and teaches nothing.",
    },
  },
];
