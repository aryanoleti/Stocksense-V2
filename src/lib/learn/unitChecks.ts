import type { Checkpoint } from "./types";

/* The second question of each unit check.

   Every lesson is gated by two questions. The first is the lesson's own final
   quiz (a fair restatement of the main idea); this file holds the second,
   which is deliberately harder and gets harder again as the course goes on:

     Levels 1–2  four options, one clearly correct
     Levels 3–4  four or five options with plausible distractors, often
                 requiring a calculation rather than recall
     Levels 5–7  five options, several defensible, asking which is *most*
                 correct — the distractors are true statements that do not
                 answer the question

   Distractors are written to catch a specific misunderstanding rather than
   to pad the list, so a wrong answer tells the reader something. */

export const SECOND_QUESTIONS: Record<string, Checkpoint> = {
  /* ---------------- Level 1 ---------------- */
  "what-a-share-is": {
    id: "l1-1-q2",
    question:
      "A company earns ₹200 cr and owes lenders ₹40 cr of interest for the year. Its owners are unhappy. What is the one thing that cannot be true?",
    options: [
      "The ₹40 cr was paid before anything reached owners",
      "Owners received less than ₹160 cr after tax",
      "Lenders were paid less than they were owed because profits disappointed",
      "Owners have a vote on some company decisions",
    ],
    answer: 2,
    explain:
      "Lenders hold a fixed claim that ranks ahead of owners. Disappointing profit reduces what owners receive; it does not reduce what lenders are contractually owed.",
  },
  "why-companies-sell-shares": {
    id: "l1-2-q2",
    question:
      "A company issues new shares, doubling its share count, and uses the cash to buy a factory that adds nothing to profit. What happened to existing owners?",
    options: [
      "Nothing — the company has more assets now",
      "They are better off, because the company is larger",
      "Their share of a roughly unchanged profit halved, so they are worse off",
      "They automatically received extra shares to compensate",
    ],
    answer: 2,
    explain:
      "Dilution only pays off if the money raised earns more than it cost. Doubling the share count while profit stays flat halves each owner's claim.",
  },
  "how-a-market-sets-a-price": {
    id: "l1-3-q2",
    question:
      "A company announces profits far above what anyone expected, and the price barely moves. What is the most likely explanation?",
    options: [
      "The market has not processed the news yet",
      "Investors think the surprise came from something that will not repeat",
      "Good news never moves prices",
      "The exchange suspended trading",
    ],
    answer: 1,
    explain:
      "Prices respond to expected future earnings. A one-off gain beats expectations for this year while changing nothing about the years being priced.",
  },
  "risk-return-tradeoff": {
    id: "l1-4-q2",
    question:
      "Over ten years an investment returns +40%, −30%, +40%, −30% and so on, alternating. A friend says the average is +5% a year so it must grow. What is wrong with that?",
    options: [
      "Nothing — the arithmetic is correct",
      "Repeated gains and losses compound, so ₹100 grows and shrinks multiplicatively and ends below where the simple average suggests",
      "Averages cannot be calculated over ten years",
      "The returns must be wrong",
    ],
    answer: 1,
    explain:
      "₹100 up 40% is ₹140; down 30% is ₹98. Each pair loses 2% despite a positive simple average. Volatility drags compounded outcomes below the arithmetic mean.",
  },
  "diversification-plain-terms": {
    id: "l1-5-q2",
    question:
      "In a severe market-wide fall, a well-diversified portfolio drops almost as much as a concentrated one. Does this mean diversification failed?",
    options: [
      "Yes — it should protect against all losses",
      "No — it targets company-specific disasters, and a market-wide fall is a different risk it never claimed to remove",
      "Yes, unless the portfolio held fifty companies",
      "No, because diversified portfolios never fall",
    ],
    answer: 1,
    explain:
      "Diversification removes the risk unique to each company. Market-wide risk affects nearly everything at once and cannot be diversified away by holding more shares.",
  },

  /* ---------------- Level 2 ---------------- */
  "revenue-is-not-profit": {
    id: "l2-1-q2",
    question:
      "Two retailers each report ₹4,000 cr of revenue. One earns ₹40 cr, the other ₹400 cr. Before concluding the second is better run, what should you check first?",
    options: [
      "Whether they operate the same kind of business at all",
      "Which has more stores",
      "Which has the higher share price",
      "Which was founded first",
    ],
    answer: 0,
    explain:
      "A tenfold margin gap usually signals different business models — one may be a low-margin grocer and the other a high-margin specialist. Compare like with like before judging management.",
  },
  "reading-an-income-statement": {
    id: "l2-2-q2",
    question:
      "A company's revenue rose 10%, gross profit rose 10%, but operating profit fell 15%. Where is the problem?",
    options: [
      "In the cost of the products themselves",
      "In overheads — salaries, marketing or administration grew faster than sales",
      "In interest payments",
      "In the tax rate",
    ],
    answer: 1,
    explain:
      "Gross profit keeping pace with revenue means product economics are intact. The damage occurs between gross and operating profit, which is where overheads sit.",
  },
  "what-the-balance-sheet-shows": {
    id: "l2-3-q2",
    question:
      "Company A has ₹500 cr of debt due in eleven months and ₹80 cr of cash. Company B has ₹2,000 cr of debt due over twelve years and ₹300 cr of cash. Which faces the more urgent problem?",
    options: [
      "Company B, because it owes four times as much",
      "Company A, because a large obligation falls due imminently and cash on hand cannot cover it",
      "Neither — both are equally safe",
      "Company B, because it has more debt per rupee of cash",
    ],
    answer: 1,
    explain:
      "Timing decides survival. A company fails when a payment falls due before the money arrives, regardless of how modest the total looks.",
  },
  "cash-flow-versus-profit": {
    id: "l2-4-q2",
    question:
      "A company's profit has grown every year for four years, while operating cash flow has been flat. Which explanation would be least concerning?",
    options: [
      "Customers are taking far longer to pay each year",
      "The company is recognising sales that may never be collected",
      "It is deliberately building stock ahead of a planned expansion, funded from cash reserves",
      "Reported profit relies increasingly on accounting estimates",
    ],
    answer: 2,
    explain:
      "A deliberate, funded, temporary stock build has an end date and a stated purpose. The other three describe profit that is drifting away from collectable cash.",
  },

  /* ---------------- Level 3 ---------------- */
  "earnings-per-share": {
    id: "l3-1-q2",
    question:
      "A company earns ₹480 cr with 60 cr shares. It buys back 10 cr shares and profit falls to ₹450 cr. What happened to EPS?",
    options: [
      "It fell from ₹8.00 to ₹7.50",
      "It rose from ₹8.00 to ₹9.00",
      "It stayed at ₹8.00",
      "It rose from ₹8.00 to ₹8.50",
    ],
    answer: 1,
    explain:
      "Before: 480 ÷ 60 = ₹8.00. After: 450 ÷ 50 = ₹9.00. EPS rose 12.5% while profit actually fell — exactly why the share count must be checked.",
  },
  "price-to-earnings": {
    id: "l3-2-q2",
    question:
      "Two companies both trade at a P/E of 30. One grows earnings 25% a year, the other 4%. What does this tell you?",
    options: [
      "They are equally valued, so equally attractive",
      "The slower grower is priced far more demandingly for what it delivers",
      "The faster grower is overpriced",
      "P/E cannot be compared between companies",
    ],
    answer: 1,
    explain:
      "The same multiple buys very different growth. Paying 30 times earnings for 4% growth requires that growth to last much longer to justify the price.",
  },
  "return-on-equity": {
    id: "l3-3-q2",
    question:
      "A company's ROE rose from 15% to 25% over three years while net profit was unchanged. Which explanation is most consistent with those facts?",
    options: [
      "It became far more efficient at serving customers",
      "Equity shrank — through buybacks, losses written off, or replacing equity with debt",
      "Revenue grew strongly",
      "The share price rose",
    ],
    answer: 1,
    explain:
      "With profit fixed, ROE can only rise if equity falls. That is a change to the balance sheet, not an improvement in the operating business.",
  },
  "debt-to-equity": {
    id: "l3-4-q2",
    question:
      "A utility with regulated, predictable revenue runs debt-to-equity of 1.8. A fashion retailer with seasonal, unpredictable sales runs 0.9. Which is more likely to be over-borrowed?",
    options: [
      "The utility, because its ratio is twice as high",
      "The retailer, because unpredictable cash flow makes even moderate fixed obligations dangerous",
      "Neither — both are within normal limits",
      "The utility, because utilities should carry no debt",
    ],
    answer: 1,
    explain:
      "Safe leverage depends on the stability of the cash flow servicing it. Predictable regulated income supports far more debt than seasonal, taste-driven sales.",
  },
  "margins-where-profit-comes-from": {
    id: "l3-5-q2",
    question:
      "A company holds a 30% gross margin while every competitor sits near 18%, and it has done so for six years. Which conclusion is best supported?",
    options: [
      "Its accounts are probably misstated",
      "It has some advantage rivals cannot easily copy — brand, scale or switching costs",
      "It is charging too much and will lose all its customers",
      "It spends less on product quality than rivals",
    ],
    answer: 1,
    explain:
      "In a competitive market, excess margin attracts competition. A gap that survives six years is evidence of a barrier competitors have been unable to cross.",
  },
  "putting-ratios-together": {
    id: "l3-6-q2",
    question:
      "A company shows: revenue −6%, EPS +14%, ROE +5 points, debt-to-equity from 0.4 to 1.3, free cash flow −22%. What is the most complete reading?",
    options: [
      "A strong year — earnings and returns both improved",
      "Shrinking sales and weakening cash, with per-share figures propped up by borrowing and a smaller share count",
      "The numbers contradict each other and must be wrong",
      "Only the EPS growth matters to shareholders",
    ],
    answer: 1,
    explain:
      "Every improved figure has a financial cause and every operating figure worsened. Read together, the ratios describe leverage disguising decline.",
  },

  /* ---------------- Level 4 ---------------- */
  "comparing-two-companies": {
    id: "l4-1-q2",
    question:
      "You compare a software firm and a grocer on net margin, ROE and free cash flow conversion. The software firm wins all three. What have you most likely measured?",
    options: [
      "That the software firm is better managed",
      "Mostly the difference between two business models, not the quality of either company",
      "That the grocer should be avoided",
      "That the software firm's shares will perform better",
    ],
    answer: 1,
    explain:
      "All three metrics structurally favour asset-light subscription businesses. The comparison graded the industry, not the companies within it.",
  },
  "evidence-checklist": {
    id: "l4-2-q2",
    question:
      "Your checklist records: 'Management seems capable and the industry looks promising.' What is the problem with that entry?",
    options: [
      "It is too short",
      "Neither claim is sourced or checkable, so it is an impression recorded as if it were evidence",
      "Management quality is irrelevant",
      "Industries cannot be assessed",
    ],
    answer: 1,
    explain:
      "The purpose of the checklist is separating verified facts from assumptions. An unsourced impression written in the evidence column defeats that entirely.",
  },
  "writing-your-investment-case": {
    id: "l4-3-q2",
    question:
      "Two years on, a holding is up 30% but margins fell below the level you named as your reversal condition. What does a disciplined review conclude?",
    options: [
      "The gain proves the case was right",
      "The stated condition was breached, so the case has failed regardless of the price — the gain came from something you did not predict",
      "The reversal condition should be revised upward",
      "Nothing, since you are profitable",
    ],
    answer: 1,
    explain:
      "The case was falsified on its own terms. A profit arriving for unforeseen reasons is luck, and treating it as vindication teaches you to ignore your own conditions.",
  },

  /* ---------------- Level 5 ---------------- */
  "position-sizing": {
    id: "l5-1-q2",
    question:
      "You hold twelve positions. Your three largest are 22%, 19% and 17% — together 58%. All three are in the same sector. Which statement is most accurate?",
    options: [
      "The portfolio is diversified because it holds twelve companies",
      "Position sizing and sector exposure have combined so that most of the outcome depends on one industry",
      "It is fine as long as no single position exceeds 25%",
      "The remaining nine positions provide adequate protection",
    ],
    answer: 1,
    explain:
      "Neither the count nor any single cap captures the real exposure. Concentration is the joint effect of size and shared dependency.",
  },
  "spreading-risk-across-sectors": {
    id: "l5-2-q2",
    question:
      "Which portfolio carries the least genuine diversification, despite appearances?",
    options: [
      "Four companies: a bank, a software firm, a grocer and a miner",
      "Fifteen companies, all of which sell discretionary goods to households",
      "Six companies across five different sectors",
      "Eight companies with different customers and different cost structures",
    ],
    answer: 1,
    explain:
      "Fifteen names sharing one dependency behave as a single bet. A smaller number of genuinely different businesses spreads risk far more effectively.",
  },
  "rebalancing-without-overtrading": {
    id: "l5-3-q2",
    question:
      "An investor rebalances monthly, paying costs each time, and argues it keeps risk tightly controlled. What is the strongest objection?",
    options: [
      "Rebalancing never controls risk",
      "The extra risk control over an annual or threshold-based rule is small, while the accumulated costs and taxes are not",
      "Monthly rebalancing is not permitted",
      "Risk should never be controlled",
    ],
    answer: 1,
    explain:
      "The benefit curve flattens quickly while costs accumulate linearly. Frequent rebalancing spends real money for a marginal improvement in drift.",
  },

  /* ---------------- Level 6 ---------------- */
  "what-a-drawdown-feels-like": {
    id: "l6-1-q2",
    question:
      "Portfolio A falls 40% then gains 40%. Portfolio B falls 15% then gains 15%. Both are back to their starting percentage moves. Where do they actually stand?",
    options: [
      "Both are exactly back to where they started",
      "A is down about 16%; B is down about 2% — deeper falls need disproportionately larger recoveries",
      "A is ahead because its swings were larger",
      "Both are ahead, because gains followed losses",
    ],
    answer: 1,
    explain:
      "₹100 → ₹60 → ₹84 (−16%). ₹100 → ₹85 → ₹97.75 (−2.25%). Equal percentage moves in both directions never return you to the start, and the gap widens with depth.",
  },
  "reacting-to-a-surprise": {
    id: "l6-2-q2",
    question:
      "Which announcement should most change a long-term valuation, even though its immediate price reaction may be the smallest?",
    options: [
      "A one-off legal settlement costing a year's profit",
      "A quarterly result missing expectations by 3%",
      "A structural shift making the company's main product gradually unnecessary",
      "A temporary factory shutdown covered by insurance",
    ],
    answer: 2,
    explain:
      "The first, second and fourth affect one or two periods. Only the third reduces the cash the business can generate indefinitely, which is what long-term value rests on.",
  },
  "volatility-versus-permanent-loss": {
    id: "l6-3-q2",
    question:
      "Which of these represents a genuinely permanent loss rather than volatility?",
    options: [
      "A holding down 35% whose business is performing as expected",
      "A company whose main product has been made obsolete and whose earning power will not return",
      "A portfolio down 20% during a broad market decline",
      "A holding that has traded sideways for two years",
    ],
    answer: 1,
    explain:
      "Only the second describes destroyed earning power. The others describe price movement, which reverses if the underlying businesses continue to perform.",
  },

  /* ---------------- Level 7 ---------------- */
  "defending-a-decision": {
    id: "l7-1-q2",
    question:
      "Which of these is the strongest evidence that you genuinely understand a position you hold?",
    options: [
      "You can list many reasons the company will succeed",
      "You can state the opposing case so well that someone holding it would agree you represented them fairly",
      "You have held it for several years",
      "Respected investors hold the same position",
    ],
    answer: 1,
    explain:
      "Accumulating supporting reasons is easy and mostly measures effort spent confirming yourself. Representing the opposing case fairly requires having actually engaged with it.",
  },
  "reviewing-your-mistakes": {
    id: "l7-2-q2",
    question:
      "Across twenty reviewed decisions you find: careful research, good outcomes on 12, poor on 8, and in six of the eight the loss followed a risk you had explicitly written down and accepted. What does this suggest?",
    options: [
      "Your research process is failing and needs replacing",
      "The process is largely working — you identified the risks correctly; the question is whether you were paid enough to accept them",
      "You should stop writing down risks",
      "Eight losses out of twenty is unacceptable",
    ],
    answer: 1,
    explain:
      "Losses arising from risks you named in advance are evidence the analysis worked. The improvable question is position sizing and whether the expected return justified those risks.",
  },
  "improving-your-process": {
    id: "l7-3-q2",
    question:
      "After a poor year an investor changes six rules at once and the next year is better. What can they conclude?",
    options: [
      "All six changes were improvements",
      "Very little — with six simultaneous changes and one noisy year, no individual change can be credited",
      "The process is now optimal",
      "The previous rules were all wrong",
    ],
    answer: 1,
    explain:
      "One year is a small sample and six simultaneous changes are confounded. Changing one thing at a time is what makes the effect of any change readable.",
  },
};
