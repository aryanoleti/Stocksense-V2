import type { Checkpoint, PlacementResult } from "./types";

/* The placement quiz shown once after signing in.

   Eight questions, one or two drawn from each level, ordered easiest first.
   Its only job is to suggest where to start — it never blocks anything, and
   the result screen always offers the option to ignore the recommendation. */

export const PLACEMENT_QUESTIONS: (Checkpoint & { level: number })[] = [
  {
    id: "pl-1",
    level: 1,
    question: "What do you own when you own a share?",
    options: [
      "A loan the company must repay you with interest",
      "A small ownership stake in the business, with a claim on its profits",
      "A fixed yearly payment from the company",
      "A specific asset the company owns",
    ],
    answer: 1,
    explain: "A share is ownership — a residual claim on profits, paid after all other obligations.",
  },
  {
    id: "pl-2",
    level: 1,
    question: "A company reports higher profits and the share price falls. The most likely reason is:",
    options: [
      "The market made a mistake",
      "The results were good but below what investors already expected",
      "Higher profits normally reduce prices",
      "Trading was suspended",
    ],
    answer: 1,
    explain: "Prices already contain expectations; what moves them is the gap between expected and actual.",
  },
  {
    id: "pl-3",
    level: 2,
    question: "A company is profitable but keeps running short of cash. The usual cause is:",
    options: [
      "The profit figure is fraudulent",
      "Cash is tied up in unsold stock and invoices customers have not paid",
      "It pays too much tax",
      "Profitable companies cannot run short of cash",
    ],
    answer: 1,
    explain: "Profit is recorded when a sale is made; cash arrives when the customer pays. Growth widens the gap.",
  },
  {
    id: "pl-4",
    level: 2,
    question: "On a balance sheet, equity is:",
    options: [
      "The total value of everything the company owns",
      "Assets minus liabilities — the owners' residual claim",
      "The company's market value on the exchange",
      "The cash held in the bank",
    ],
    answer: 1,
    explain: "Equity is what would remain for owners if every liability were settled at recorded values.",
  },
  {
    id: "pl-5",
    level: 3,
    question: "A company earns ₹360 cr with 20 cr shares, trading at ₹720. What is its P/E?",
    options: ["18", "20", "40", "72"],
    answer: 2,
    explain: "EPS = 360 ÷ 20 = ₹18. P/E = 720 ÷ 18 = 40.",
  },
  {
    id: "pl-6",
    level: 3,
    question: "A company's ROE rises sharply while profit is unchanged. The most likely explanation is:",
    options: [
      "It became more efficient at serving customers",
      "Equity shrank — often through buybacks or replacing equity with debt",
      "Revenue grew strongly",
      "Its share price rose",
    ],
    answer: 1,
    explain: "With profit fixed, ROE can only rise if the equity denominator falls — a balance-sheet change, not an operating one.",
  },
  {
    id: "pl-7",
    level: 5,
    question: "A holding at 8% of your portfolio falls 50%. The portfolio impact is:",
    options: ["−50%", "−8%", "−4%", "−25%"],
    answer: 2,
    explain: "8% × 50% = 4%. Position size converts a company-level loss into a portfolio-level one.",
  },
  {
    id: "pl-8",
    level: 6,
    question: "A portfolio falls 50%. What gain returns it to its starting value?",
    options: ["50%", "75%", "100%", "150%"],
    answer: 2,
    explain: "₹100 → ₹50 needs a doubling to get back. Falls and recoveries are not symmetric.",
  },
];

/* Turn a set of answers into a suggestion.

   The recommendation is deliberately generous: anything the reader got wrong
   points at a level worth doing, and Level 7 (process and review) is suggested
   to everyone, because it does not depend on prior knowledge. */
export function gradePlacement(picked: Record<string, number>): PlacementResult {
  const wrongLevels = new Set<number>();
  let score = 0;

  PLACEMENT_QUESTIONS.forEach((q) => {
    if (picked[q.id] === q.answer) score += 1;
    else wrongLevels.add(q.level);
  });

  const total = PLACEMENT_QUESTIONS.length;
  const ratio = score / total;

  let recommended: number[];
  let verdict: PlacementResult["verdict"];

  if (ratio < 0.5) {
    // struggling with the basics: start at the beginning
    verdict = "start";
    recommended = [1, 2, 3, 4, 5, 6, 7];
  } else if (ratio < 0.875) {
    // solid in places: the levels they missed, plus the applied levels
    verdict = "skim";
    const gaps = [...wrongLevels].sort((a, b) => a - b);
    recommended = [...new Set([...gaps, 4, 5, 6, 7])].sort((a, b) => a - b);
  } else {
    // already comfortable: only the judgement and process levels add much
    verdict = "skip";
    recommended = [4, 6, 7];
  }

  return { score, total, recommended, verdict, takenAt: Date.now() };
}

export const VERDICT_COPY: Record<
  PlacementResult["verdict"],
  { headline: string; detail: string }
> = {
  start: {
    headline: "Start from the beginning",
    detail:
      "Several of the fundamentals did not land yet, which is completely normal if you are new. Level 1 assumes nothing at all, and each level builds on the one before it.",
  },
  skim: {
    headline: "Start partway in",
    detail:
      "You already have some of this. The levels below are the ones your answers suggest would add the most — the applied levels are included because they are about judgement rather than recall.",
  },
  skip: {
    headline: "You could skip ahead",
    detail:
      "You answered nearly everything correctly, so the foundations would mostly be revision. The levels below are about comparison, composure and process, which the quiz cannot really test.",
  },
};
