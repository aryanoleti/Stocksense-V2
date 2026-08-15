import type { Lesson } from "../types";

/* Level 6 — Survive the Market.
   Simulated shocks. The aim is to rehearse the decision before it is real,
   because the hardest part of investing is behaviour under pressure. */

export const LEVEL_6_LESSONS: Lesson[] = [
  {
    slug: "what-a-drawdown-feels-like",
    levelId: 6,
    order: 1,
    title: "What a drawdown feels like",
    goal: "Recognise a drawdown as a normal event and plan your response before one arrives.",
    minutes: 7,
    difficulty: "applied",
    steps: [
      {
        heading: "The word for a fall from the peak",
        body: [
          "A drawdown is the decline from the highest point a portfolio reached to its lowest point afterwards, measured in percent.",
          "It is not a loss you have realised. It is the distance between the best you have seen and where you are now — and it is the number that makes people abandon good plans.",
        ],
      },
      {
        heading: "The arithmetic of recovery is not symmetric",
        body: [
          "A 20% fall needs a 25% gain to get back. A 50% fall needs 100%. A 70% fall needs 233%.",
          "This asymmetry is why avoiding severe drawdowns matters more than capturing every gain. The maths of digging out is harsher than the maths of falling in.",
        ],
        example: {
          company: "ironvale",
          title: "Recovery required, by depth",
          rows: [
            { label: "Fall 20%", value: "needs +25%" },
            { label: "Fall 33%", value: "needs +50%" },
            { label: "Fall 50%", value: "needs +100%" },
            { label: "Fall 70%", value: "needs +233%" },
          ],
          note: "₹100 falling 50% becomes ₹50. Getting from ₹50 back to ₹100 is a doubling — the same distance in percentage terms is a far larger climb back.",
        },
        checkpoint: {
          id: "l6-1-c1",
          question: "A portfolio falls 50%. What gain is needed to return to the starting value?",
          options: ["50%", "75%", "100%", "150%"],
          answer: 2,
          explain: "₹100 → ₹50 requires a doubling to return to ₹100. Falls and recoveries are not symmetric.",
        },
      },
      {
        heading: "Drawdowns are normal, not exceptional",
        body: [
          "Broad markets decline 10% or more with some regularity, and fall 30% or worse several times in an investing lifetime.",
          "Treating these as emergencies leads to selling at the worst point. Treating them as the ordinary cost of participating is what allows the long-run average to reach you.",
        ],
      },
      {
        heading: "Decide your response in advance",
        body: [
          "Write, while calm, what you will do if your portfolio falls 30%: hold, rebalance, add, or reduce — and on what evidence.",
          "During the fall you will not think clearly. Nobody does. The plan written beforehand is the only version of your judgement that had access to a calm mind.",
        ],
        checkpoint: {
          id: "l6-1-c2",
          question: "Why decide your response to a large fall before it happens?",
          options: [
            "Falls can be predicted in advance",
            "Judgement deteriorates under stress, so the calm decision is the better one",
            "It guarantees you avoid losses",
            "Because rules must always be followed",
          ],
          answer: 1,
          explain:
            "Fear narrows thinking and shortens time horizons. A plan made calmly is the only one that reflects your actual reasoning.",
        },
      },
    ],
    recap: [
      "A drawdown is the fall from peak to trough, not a realised loss.",
      "Recovering from a fall requires a larger gain than the fall itself.",
      "Significant declines are a normal feature of markets.",
      "Write your response before the fall, not during it.",
    ],
    finalQuiz: {
      id: "l6-1-final",
      question: "Why does avoiding deep drawdowns matter more than capturing every gain?",
      options: [
        "Gains are not important",
        "Because recovering from a deep fall requires a disproportionately large gain",
        "Because markets never recover",
        "Because drawdowns are taxed",
      ],
      answer: 1,
      explain:
        "The asymmetry compounds. Deep losses consume years of future returns simply to return to the starting point.",
    },
  },

  {
    slug: "reacting-to-a-surprise",
    levelId: 6,
    order: 2,
    title: "Reacting to a surprise announcement",
    goal: "Separate news that changes a company's value from news that only changes its price.",
    minutes: 8,
    difficulty: "applied",
    steps: [
      {
        heading: "The first question is always the same",
        body: [
          "When something unexpected happens, ask: does this change how much cash the business will produce over the next five to ten years?",
          "If yes, your case needs revision. If no, the price moved and the business did not — which is a different situation entirely.",
        ],
      },
      {
        heading: "Simulation: a factory fire at Ironvale",
        body: [
          "Ironvale Works announces a fire at one of six plants. No injuries. Insurance covers rebuilding. Production is reduced for roughly five months. The shares fall 18%.",
          "One plant of six, out for five months, with insurance covering the cost. This year's profit takes a real hit. The company's earning power from year two onward is essentially unchanged.",
        ],
        example: {
          company: "ironvale",
          title: "Sizing the actual damage",
          rows: [
            { label: "Capacity affected", value: "1 of 6 plants, ~5 months" },
            { label: "Estimated profit impact", value: "about −₹45 cr, one year" },
            { label: "Long-term earning power", value: "unchanged" },
            { label: "Price reaction", value: "−18%" },
          ],
          note: "An 18% fall in response to a one-year dent of roughly 14% of annual profit. The market priced in fear as well as arithmetic.",
        },
        checkpoint: {
          id: "l6-2-c1",
          question: "The fire costs one year of reduced output but insurance covers rebuilding. What should change in your analysis?",
          options: [
            "The entire investment case is void",
            "This year's earnings estimate falls; the long-term case is largely intact",
            "Nothing at all — ignore the news",
            "The company should be sold immediately",
          ],
          answer: 1,
          explain:
            "A temporary, insured disruption affects one year of earnings. It does not remove the company's ability to earn afterwards.",
        },
      },
      {
        heading: "Simulation: a rival undercuts Lumen Labs",
        body: [
          "A large competitor launches a similar product at half Lumen's price. Lumen shares fall 12%.",
          "This is a different kind of news. It attacks the margin that justified Lumen's valuation. Nothing has happened to this year's figures — but the reason for owning it may have weakened permanently.",
        ],
        example: {
          company: "lumen",
          title: "Which news actually matters",
          rows: [
            { label: "Ironvale fire", value: "One year of profit, then recovery" },
            { label: "Lumen price war", value: "Possible permanent margin damage" },
            { label: "Price fall", value: "−18% vs −12%" },
          ],
          note: "The larger price fall was the less serious event. Depth of reaction is a poor guide to depth of damage.",
        },
        checkpoint: {
          id: "l6-2-c2",
          question: "Which announcement is more likely to permanently reduce a company's value?",
          options: [
            "An insured fire halting one plant for five months",
            "A large rival launching a comparable product at half the price",
            "A one-off legal settlement",
            "A delayed quarterly report",
          ],
          answer: 1,
          explain:
            "Temporary disruptions pass. Sustained price competition can permanently compress margins, which is the thing a high valuation rests on.",
        },
      },
      {
        heading: "Give yourself a delay",
        body: [
          "Most damaging reactions happen in the first hour, before anyone knows the details.",
          "A standing rule — no decision on announcement day — costs you almost nothing over a lifetime and prevents most of the worst decisions you would otherwise make.",
        ],
      },
    ],
    recap: [
      "Ask whether long-run cash generation changed, or only the price.",
      "Temporary, insured disruptions rarely alter the long-term case.",
      "Competitive attacks on margin can cause permanent damage.",
      "The size of a price move is a poor guide to the seriousness of the news.",
    ],
    finalQuiz: {
      id: "l6-2-final",
      question: "A holding falls 20% on news. What is the most useful first question?",
      options: [
        "Should I sell before it falls further?",
        "Does this change the cash the business can generate over the next several years?",
        "What are other investors doing?",
        "How much have I lost so far?",
      ],
      answer: 1,
      explain:
        "Only the effect on long-run earning power tells you whether the case has changed. The other questions are about the price and your feelings about it.",
    },
  },

  {
    slug: "volatility-versus-permanent-loss",
    levelId: 6,
    order: 3,
    title: "Volatility versus permanent loss",
    goal: "Tell the difference between a price that fell and money that is gone.",
    minutes: 7,
    difficulty: "applied",
    steps: [
      {
        heading: "Two very different events",
        body: [
          "Volatility is price movement. It goes both ways and, for a sound business, it reverses.",
          "Permanent loss is capital that will not come back: a company whose earning power is genuinely destroyed, or a sale you made at the bottom that converted a paper decline into a realised one.",
        ],
      },
      {
        heading: "Volatility only becomes loss when you act on it",
        body: [
          "A holding that falls 30% and recovers cost you nothing but discomfort — provided you held.",
          "The same holding sold at −30% produced a real, permanent loss. The market supplied the movement; the decision to sell supplied the loss.",
        ],
        example: {
          company: "coral",
          title: "The same fall, two outcomes",
          rows: [
            { label: "Coral & Co falls", value: "−30%" },
            { label: "Investor A", value: "Holds; recovers in 14 months" },
            { label: "Investor B", value: "Sells at the low" },
            { label: "Outcome", value: "A: unchanged. B: −30%, permanently" },
          ],
          note: "Identical company, identical price path, opposite results. The difference was entirely behavioural.",
        },
        checkpoint: {
          id: "l6-3-c1",
          question: "When does a price decline become a permanent loss?",
          options: [
            "As soon as the price falls",
            "When the business is genuinely impaired, or when you sell at the low",
            "After thirty days",
            "Only when the company is delisted",
          ],
          answer: 1,
          explain:
            "A price fall is unrealised. It becomes permanent when the underlying earning power is destroyed, or when you crystallise it by selling.",
        },
      },
      {
        heading: "When selling is the right answer",
        body: [
          "Not all falls should be held through. Sell when the evidence in your written case has actually been contradicted — margins collapsed, debt became unmanageable, the advantage disappeared.",
          "The test is your reversal conditions from Level 4. If they have been met, sell without hesitation. If they have not, the fall is price movement, not information.",
        ],
        checkpoint: {
          id: "l6-3-c2",
          question: "What should trigger a sale after a large decline?",
          options: [
            "The size of the fall",
            "Evidence that the reversal conditions in your written case have been met",
            "How long the fall lasted",
            "Other investors selling",
          ],
          answer: 1,
          explain:
            "Price alone carries no information about the business. Your pre-written conditions are what distinguish new evidence from noise.",
        },
      },
      {
        heading: "Why this is the hardest lesson",
        body: [
          "Everything in this level can be understood in ten minutes and still fail you completely during a real decline, because understanding and behaviour are different skills.",
          "This is why the written case, the reversal conditions and the pre-decided response exist. They are not paperwork. They are how a calm version of you leaves instructions for a frightened one.",
        ],
      },
    ],
    recap: [
      "Volatility is movement; permanent loss is destroyed value or a sale at the low.",
      "Holding through a fall in a sound business costs nothing but discomfort.",
      "Sell when your written reversal conditions are met — not because of the size of the fall.",
      "Written plans exist so a calm mind can instruct a frightened one.",
    ],
    finalQuiz: {
      id: "l6-3-final",
      question: "What most reliably converts a temporary decline into a permanent loss?",
      options: [
        "Holding through the decline",
        "Selling at the bottom because the fall itself became unbearable",
        "Rebalancing on schedule",
        "Reading the annual report",
      ],
      answer: 1,
      explain:
        "Selling crystallises the decline and forfeits the recovery. It is the single most expensive behaviour available to an ordinary investor.",
    },
  },
];
