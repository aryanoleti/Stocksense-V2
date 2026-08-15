import type { Lesson } from "../types";

/* Level 3 — Reading the Numbers.
   Every ratio is derived by hand from the same five companies, so readers can
   check the arithmetic rather than take a formula on trust. */

export const LEVEL_3_LESSONS: Lesson[] = [
  {
    slug: "earnings-per-share",
    levelId: 3,
    order: 1,
    title: "Earnings per share, step by step",
    goal: "Calculate EPS and explain why it can move without profit changing.",
    minutes: 6,
    difficulty: "core",
    steps: [
      {
        heading: "Profit, divided by the number of slices",
        body: [
          "Total profit tells you how the company did. Earnings per share tells you how your slice did.",
          "EPS = net profit ÷ number of shares. That is the whole formula.",
        ],
        example: {
          company: "kirana",
          title: "EPS for Kirana Kart",
          rows: [
            { label: "Net profit", value: "₹168 cr" },
            { label: "Shares outstanding", value: "40 cr" },
            { label: "EPS", value: "168 ÷ 40 = ₹4.20" },
          ],
          note: "Each share earned ₹4.20 this year. That is not money you receive — it is your share of what the business earned.",
        },
        checkpoint: {
          id: "l3-1-c1",
          question: "Lumen Labs earns ₹360 cr with 20 cr shares. What is its EPS?",
          options: ["₹7.20", "₹18.00", "₹36.00", "₹180.00"],
          answer: 1,
          explain: "360 ÷ 20 = ₹18 per share.",
        },
      },
      {
        heading: "EPS moves for two different reasons",
        body: [
          "The numerator can change: the company earns more or less.",
          "The denominator can change too: the company issues new shares or buys some back. This is why EPS can rise in a year when profit did not, and why it deserves a second look.",
        ],
      },
      {
        heading: "Buybacks and issues change your slice",
        body: [
          "If a company buys back and cancels shares, the same profit is divided among fewer holders, so EPS rises without the business improving.",
          "If it issues new shares, EPS falls even when profit is flat. Neither is automatically good or bad, but neither should be mistaken for operating performance.",
        ],
        example: {
          company: "coral",
          title: "Coral & Co buys back shares",
          rows: [
            { label: "Profit (unchanged)", value: "₹288 cr" },
            { label: "Shares before / after", value: "30 cr / 24 cr" },
            { label: "EPS before / after", value: "₹9.60 / ₹12.00" },
          ],
          note: "EPS climbed 25% while the business earned exactly the same. Always check whether the share count moved.",
        },
        checkpoint: {
          id: "l3-1-c2",
          question: "A company's EPS rises 20% while net profit is unchanged. What happened?",
          options: [
            "It sold more products",
            "The share count fell, probably through a buyback",
            "Its costs increased",
            "This is impossible",
          ],
          answer: 1,
          explain:
            "With the numerator fixed, only a smaller denominator can lift EPS. Fewer shares means each remaining share owns more of the same profit.",
        },
      },
      {
        heading: "Why EPS is the bridge to valuation",
        body: [
          "EPS converts a company-level figure into a per-share one, which is the only form that can be compared with a share price.",
          "You cannot sensibly compare ₹168 cr of profit with a ₹105 share price. You can compare ₹4.20 of earnings with a ₹105 price — and that comparison is the P/E ratio, which is the next lesson.",
        ],
      },
    ],
    recap: [
      "EPS = net profit ÷ shares outstanding.",
      "It changes when profit changes or when the share count changes.",
      "Buybacks lift EPS mechanically; share issues reduce it.",
      "EPS is what makes profit comparable with a share price.",
    ],
    finalQuiz: {
      id: "l3-1-final",
      question: "Why should you check the share count when EPS grows?",
      options: [
        "Share counts never change",
        "Growth may come from fewer shares rather than a better business",
        "Regulators require it",
        "Because EPS is unreliable",
      ],
      answer: 1,
      explain:
        "EPS is a ratio. Improvement can come from the top or the bottom of it, and only one of those means the company is performing better.",
    },
  },

  {
    slug: "price-to-earnings",
    levelId: 3,
    order: 2,
    title: "The P/E ratio and what it prices in",
    goal: "Interpret a P/E ratio as a statement about expectations, not cheapness.",
    minutes: 8,
    difficulty: "core",
    steps: [
      {
        heading: "Price divided by earnings",
        body: [
          "P/E = share price ÷ earnings per share.",
          "Kirana Kart trades at ₹105 with EPS of ₹4.20, so its P/E is 25. You are paying ₹25 for each ₹1 of current annual earnings.",
        ],
        example: {
          company: "kirana",
          title: "Reading a P/E as a price tag",
          rows: [
            { label: "Share price", value: "₹105" },
            { label: "EPS", value: "₹4.20" },
            { label: "P/E", value: "25" },
          ],
          note: "One useful reading: at today's earnings, it takes 25 years of profit to repay the price. That framing makes a high P/E feel as demanding as it is.",
        },
        checkpoint: {
          id: "l3-2-c1",
          question: "Ironvale trades at ₹130 with EPS of ₹6.50. What is its P/E?",
          options: ["10", "20", "26", "65"],
          answer: 1,
          explain: "130 ÷ 6.50 = 20. Each ₹1 of annual earnings costs ₹20.",
        },
      },
      {
        heading: "A high P/E is an expectation, not a verdict",
        body: [
          "Lumen Labs trades at a P/E of 40 while Ironvale trades at 20. It is tempting to call Ironvale cheap and Lumen expensive. That is not what those numbers mean.",
          "A P/E of 40 says the market expects Lumen's earnings to grow substantially. The price is not paying for today's ₹18 EPS — it is paying for a much larger figure investors expect later.",
        ],
        example: {
          company: "lumen",
          title: "What a P/E of 40 assumes",
          rows: [
            { label: "Lumen Labs P/E", value: "40" },
            { label: "Ironvale Works P/E", value: "20" },
            { label: "The market's implied view", value: "Lumen grows much faster" },
          ],
          note: "The higher multiple is a forecast in disguise. If Lumen grows as hoped it can still be good value; if growth stalls, the multiple has nothing to stand on.",
        },
      },
      {
        heading: "Low P/E is not the same as bargain",
        body: [
          "A low P/E often means the market expects earnings to fall. If profits do decline, the ratio was not cheap — the earnings figure underneath it was temporary.",
          "This trap is common enough to have a name: the value trap. A company priced at 8 times earnings that then loses half its profit was never trading at 8 times anything durable.",
        ],
        checkpoint: {
          id: "l3-2-c2",
          question: "A company trades at a P/E of 7 while its industry averages 18. What is the first thing to investigate?",
          options: [
            "Buy immediately — it is clearly undervalued",
            "Why the market expects its earnings to fall",
            "Whether the exchange made an error",
            "Nothing; low P/E always means cheap",
          ],
          answer: 1,
          explain:
            "An unusually low multiple usually reflects an expectation of decline. Sometimes the market is wrong — but that is the case you must argue, not assume.",
        },
      },
      {
        heading: "Comparing P/Es fairly",
        body: [
          "A P/E is only meaningful against something: the same company's history, or businesses with similar economics.",
          "Comparing a software company with a manufacturer tells you almost nothing, because their growth rates, capital needs and margins differ so much that different multiples are entirely rational.",
        ],
      },
      {
        heading: "When P/E stops working",
        body: [
          "If a company loses money, EPS is negative and the ratio becomes meaningless. If earnings are temporarily depressed or inflated by a one-off, the ratio is distorted.",
          "For cyclical businesses, a P/E can look lowest exactly at the peak — when earnings are at their highest and about to fall. No single ratio survives every situation.",
        ],
        checkpoint: {
          id: "l3-2-c3",
          question: "Why can a cyclical company's P/E look cheapest at the worst moment to buy?",
          options: [
            "Because prices are highest at peaks",
            "Because peak earnings inflate the denominator, and those earnings are about to fall",
            "Because cyclical companies never report accurately",
            "Because P/E is calculated differently for them",
          ],
          answer: 1,
          explain:
            "At the top of a cycle earnings are unusually high, which makes the ratio look low. The multiple then rises as earnings collapse.",
        },
      },
    ],
    recap: [
      "P/E = price ÷ EPS: the price of ₹1 of current annual earnings.",
      "A high P/E encodes an expectation of growth, not a judgement of quality.",
      "A low P/E often signals expected decline — the value trap.",
      "P/E is meaningless without a comparison, and breaks down at losses and cyclical peaks.",
    ],
    finalQuiz: {
      id: "l3-2-final",
      question: "What does a P/E of 40 most directly tell you?",
      options: [
        "The company is overpriced",
        "Investors expect earnings to grow significantly from here",
        "The company is 40 times larger than average",
        "The shares will fall",
      ],
      answer: 1,
      explain:
        "It states an expectation. Whether that expectation is reasonable is the analysis — the ratio itself is only the question.",
    },
  },

  {
    slug: "return-on-equity",
    levelId: 3,
    order: 3,
    title: "Return on equity: profit per rupee of ownership",
    goal: "Use ROE to judge how efficiently a company turns owners' money into profit.",
    minutes: 7,
    difficulty: "core",
    steps: [
      {
        heading: "The question ROE answers",
        body: [
          "Two companies both earn ₹300 cr. One needed ₹1,000 cr of owners' money to do it; the other needed ₹5,000 cr. The first is clearly the better machine.",
          "ROE = net profit ÷ equity. It measures profit generated per rupee of owner capital.",
        ],
        example: {
          company: "coral",
          title: "ROE across the universe",
          rows: [
            { label: "Coral & Co", value: "288 ÷ 1,100 = 26%" },
            { label: "Lumen Labs", value: "360 ÷ 1,500 = 24%" },
            { label: "Ironvale Works", value: "325 ÷ 2,000 = 16%" },
            { label: "Kirana Kart", value: "168 ÷ 1,200 = 14%" },
          ],
          note: "Coral turns each ₹100 of owner money into ₹26 of annual profit. Ironvale needs far more capital to earn a similar amount.",
        },
        checkpoint: {
          id: "l3-3-c1",
          question: "A company earns ₹168 cr on equity of ₹1,200 cr. What is its ROE?",
          options: ["7%", "14%", "21%", "28%"],
          answer: 1,
          explain: "168 ÷ 1,200 = 0.14, or 14%.",
        },
      },
      {
        heading: "Why high ROE matters for growth",
        body: [
          "A company that reinvests its profits at a high ROE compounds quickly, because each rupee retained goes on earning at that same high rate.",
          "A business earning 8% on equity has to raise outside money to grow meaningfully. One earning 25% can fund its own expansion — a structural advantage that compounds over years.",
        ],
      },
      {
        heading: "The trap: debt inflates ROE",
        body: [
          "Equity is the denominator, so anything that shrinks equity raises ROE — including borrowing heavily.",
          "A company can lift its ROE by replacing owner capital with debt, without becoming any better at its actual business. It has simply become riskier. This is why ROE must always be read next to debt-to-equity, the next lesson.",
        ],
        example: {
          company: "ironvale",
          title: "Two routes to the same ROE",
          rows: [
            { label: "Company A: profit / equity", value: "₹200 cr / ₹1,000 cr = 20%" },
            { label: "Company B: profit / equity", value: "₹200 cr / ₹1,000 cr = 20%" },
            { label: "Company A debt", value: "₹100 cr" },
            { label: "Company B debt", value: "₹3,000 cr" },
          ],
          note: "Identical ROE, completely different risk. B's return depends on borrowings that must be serviced in every year, good or bad.",
        },
        checkpoint: {
          id: "l3-3-c2",
          question: "Why can a high ROE be misleading on its own?",
          options: [
            "It is often miscalculated",
            "Heavy borrowing shrinks equity and lifts ROE without improving the business",
            "ROE only applies to banks",
            "High ROE always means low profit",
          ],
          answer: 1,
          explain:
            "Debt reduces the denominator. The ratio rises while operating performance is unchanged and risk has increased — so ROE must be read alongside leverage.",
        },
      },
      {
        heading: "Consistency beats a single spike",
        body: [
          "One excellent year can come from a one-off gain or a temporarily favourable market.",
          "A company holding 20%+ ROE across five years is telling you something structural about its position — a brand, a cost advantage, something competitors cannot easily copy.",
        ],
      },
    ],
    recap: [
      "ROE = net profit ÷ equity: profit per rupee of owner capital.",
      "High ROE lets a company fund its own growth and compound.",
      "Debt inflates ROE without improving the business — always check leverage.",
      "Sustained ROE matters far more than one strong year.",
    ],
    finalQuiz: {
      id: "l3-3-final",
      question: "Two companies both report 24% ROE. What decides which is the better business?",
      options: [
        "Whichever has the higher revenue",
        "How much debt each used, and whether the return has been sustained",
        "Whichever has more shares",
        "They are equally good by definition",
      ],
      answer: 1,
      explain:
        "Identical ROE can be produced by genuine efficiency or by leverage. Debt levels and consistency separate the two.",
    },
  },

  {
    slug: "debt-to-equity",
    levelId: 3,
    order: 4,
    title: "Debt-to-equity and financial risk",
    goal: "Assess whether a company's borrowing is a useful tool or a genuine threat.",
    minutes: 7,
    difficulty: "core",
    steps: [
      {
        heading: "The ratio itself",
        body: [
          "Debt-to-equity = total debt ÷ equity. It compares money that must be repaid against money that never has to be.",
          "A ratio of 1.0 means the company owes as much as owners have invested. Below 0.5 is generally conservative; above 2.0 demands a close look.",
        ],
        example: {
          company: "ironvale",
          title: "Leverage across the universe",
          rows: [
            { label: "Ironvale Works", value: "2,800 ÷ 2,000 = 1.4" },
            { label: "Kirana Kart", value: "900 ÷ 1,200 = 0.75" },
            { label: "Coral & Co", value: "300 ÷ 1,100 = 0.27" },
            { label: "Lumen Labs", value: "50 ÷ 1,500 = 0.03" },
          ],
          note: "Lumen barely borrows because software needs little equipment. Ironvale borrows heavily because factories are expensive — and because lenders accept factories as security.",
        },
        checkpoint: {
          id: "l3-4-c1",
          question: "A company has ₹900 cr of debt and ₹1,200 cr of equity. What is its debt-to-equity?",
          options: ["0.75", "1.33", "1.75", "0.43"],
          answer: 0,
          explain: "900 ÷ 1,200 = 0.75 — three-quarters of a rupee of debt for every rupee of equity.",
        },
      },
      {
        heading: "Debt magnifies both directions",
        body: [
          "Borrowing lets a company control more assets than owners funded. In good years the extra profit belongs to shareholders, so returns are amplified.",
          "In bad years interest is still due. The same mechanism that multiplied gains now multiplies losses. Debt does not create risk out of nothing — it concentrates existing risk onto the owners.",
        ],
      },
      {
        heading: "What actually matters is coverage",
        body: [
          "The ratio alone is incomplete. A company with heavy debt but strong, stable cash flow may be perfectly safe; a company with modest debt and erratic cash flow may not be.",
          "Interest coverage = operating profit ÷ interest expense. It answers the practical question: how many times over can this company pay its interest bill?",
        ],
        example: {
          company: "ironvale",
          title: "Ironvale's coverage under stress",
          rows: [
            { label: "Operating profit", value: "₹520 cr" },
            { label: "Interest due", value: "₹196 cr" },
            { label: "Coverage", value: "2.7 times" },
            { label: "If profit halves", value: "1.3 times" },
          ],
          note: "Comfortable today. In a downturn, most of the operating profit goes straight to lenders — leaving almost nothing for owners.",
        },
        checkpoint: {
          id: "l3-4-c2",
          question: "Why is interest coverage often more informative than debt-to-equity?",
          options: [
            "It is simpler to calculate",
            "It shows whether the company can actually service its debt from earnings",
            "It ignores debt entirely",
            "It is required by regulators",
          ],
          answer: 1,
          explain:
            "Companies fail when they cannot make payments, not when a ratio crosses a threshold. Coverage measures capacity to pay directly.",
        },
      },
      {
        heading: "Sensible debt depends on the industry",
        body: [
          "A utility with predictable, regulated revenue can carry debt that would be reckless for a fashion retailer whose sales swing with taste and season.",
          "Judge leverage against the stability of the cash flows supporting it — never against a universal number.",
        ],
      },
    ],
    recap: [
      "Debt-to-equity compares repayable money with permanent money.",
      "Leverage amplifies returns in both directions.",
      "Interest coverage shows whether debt can actually be serviced.",
      "Acceptable leverage depends on how stable the cash flows are.",
    ],
    finalQuiz: {
      id: "l3-4-final",
      question: "Which company is most exposed to a downturn?",
      options: [
        "Low debt, stable cash flow",
        "High debt, stable regulated cash flow",
        "High debt, volatile seasonal cash flow",
        "No debt, volatile cash flow",
      ],
      answer: 2,
      explain:
        "Fixed obligations meeting unpredictable income is the dangerous combination. Volatility alone is survivable when nothing must be paid on a schedule.",
    },
  },

  {
    slug: "margins-where-profit-comes-from",
    levelId: 3,
    order: 5,
    title: "Margins: where profit actually comes from",
    goal: "Use the three margin levels to locate a company's strength or weakness.",
    minutes: 7,
    difficulty: "core",
    steps: [
      {
        heading: "Three margins, three questions",
        body: [
          "Gross margin asks: how much do we keep after making the product? It measures pricing power.",
          "Operating margin asks: how much survives running the company? It measures efficiency. Net margin asks: how much reaches owners after financing and tax?",
        ],
        example: {
          company: "lumen",
          title: "Lumen Labs, margin by margin",
          rows: [
            { label: "Gross margin", value: "78%" },
            { label: "Operating margin", value: "27%" },
            { label: "Net margin", value: "20%" },
          ],
          note: "Copying software costs almost nothing, hence 78% gross. The drop to 27% is sales and engineering salaries — deliberate spending on growth.",
        },
      },
      {
        heading: "Where a margin falls tells you what to fix",
        body: [
          "If gross margin is falling, the problem is at the product level: discounting, or input costs rising faster than prices.",
          "If gross margin holds but operating margin falls, the product is fine and overheads are the problem. If both hold but net margin falls, the cause is interest or tax, not operations.",
        ],
        checkpoint: {
          id: "l3-5-c1",
          question: "Gross margin is steady, but operating margin has fallen for three years. What is the likely cause?",
          options: [
            "The company is discounting heavily",
            "Overheads such as salaries and marketing are growing faster than sales",
            "Interest costs have risen",
            "Customers stopped paying",
          ],
          answer: 1,
          explain:
            "A stable gross margin means the product economics are intact. The leak is between gross and operating profit — the cost of running the business.",
        },
      },
      {
        heading: "Margins reveal competitive position",
        body: [
          "Persistently high margins are evidence that competitors cannot easily undercut the company — through brand, switching costs, or genuine cost advantage.",
          "Margins under sustained pressure usually mean competition is intensifying. This is often visible in the numbers a year or two before it shows up in the headlines.",
        ],
        example: {
          company: "coral",
          title: "Brand strength at Coral & Co",
          rows: [
            { label: "Net margin, 5 years ago", value: "11%" },
            { label: "Net margin today", value: "12%" },
            { label: "Rival's net margin", value: "6%" },
          ],
          note: "Coral holds twice its rival's margin while raising prices with inflation. Customers keep buying — that is what brand strength looks like in numbers.",
        },
        checkpoint: {
          id: "l3-5-c2",
          question: "What does a consistently higher margin than rivals usually indicate?",
          options: [
            "The company charges too much and will lose customers",
            "Some advantage competitors cannot easily copy",
            "The accounts are unreliable",
            "It spends less on quality",
          ],
          answer: 1,
          explain:
            "In competitive markets, high margins invite attack. Margins that survive anyway suggest a real barrier — brand, switching costs or scale.",
        },
      },
      {
        heading: "Never compare margins across industries",
        body: [
          "A 4% net margin is normal for a grocer and alarming for a software company. A 20% margin is excellent for a retailer and unremarkable for a subscription business.",
          "Margins are only meaningful against the same company's history and against direct competitors.",
        ],
      },
    ],
    recap: [
      "Gross, operating and net margins each isolate a different question.",
      "Where a margin falls identifies where the problem lives.",
      "Durable high margins point to a competitive advantage.",
      "Margins compare only within an industry.",
    ],
    finalQuiz: {
      id: "l3-5-final",
      question: "A retailer reports a 4% net margin and a software firm reports 20%. What follows?",
      options: [
        "The software firm is the better investment",
        "The retailer is poorly managed",
        "Nothing yet — these are different business models and must be judged against their own peers",
        "The retailer should raise prices",
      ],
      answer: 2,
      explain:
        "The margins reflect structurally different models. The useful comparison is each company against its own history and its own competitors.",
    },
  },

  {
    slug: "putting-ratios-together",
    levelId: 3,
    order: 6,
    title: "Putting ratios together without being fooled",
    goal: "Combine several ratios into one coherent read of a company.",
    minutes: 8,
    difficulty: "applied",
    steps: [
      {
        heading: "No single ratio survives alone",
        body: [
          "Every ratio can be made to look good in isolation. Debt lifts ROE. Buybacks lift EPS. Cutting research lifts margins for a year.",
          "Read together, these tricks become visible, because improving one number usually damages another.",
        ],
      },
      {
        heading: "A four-question routine",
        body: [
          "Is it profitable? Check margins and ROE. Is it safe? Check debt-to-equity and interest coverage.",
          "Is the profit real? Compare free cash flow with net profit. Is it fairly priced? Check the P/E against the growth actually being delivered.",
        ],
        example: {
          company: "lumen",
          title: "The routine applied to Lumen Labs",
          rows: [
            { label: "Profitable?", value: "20% net margin, 24% ROE" },
            { label: "Safe?", value: "D/E 0.03" },
            { label: "Real?", value: "FCF ₹390 cr vs profit ₹360 cr" },
            { label: "Priced?", value: "P/E 40" },
          ],
          note: "Strong, safe, and converting profit into cash. The entire debate is the last line: is 40 times earnings justified by the growth ahead?",
        },
        checkpoint: {
          id: "l3-6-c1",
          question: "Lumen converts ₹360 cr of profit into ₹390 cr of free cash flow. What does that indicate?",
          options: [
            "An accounting error",
            "Profit is converting fully into cash — a sign the earnings are real",
            "The company is overvalued",
            "It borrowed money during the year",
          ],
          answer: 1,
          explain:
            "Cash flow at or above profit means earnings are not trapped in stock or unpaid invoices. It is one of the strongest quality signals available.",
        },
      },
      {
        heading: "Watch for contradictions",
        body: [
          "Rising profit with flat cash flow. Rising ROE with rising debt. Rising EPS with falling revenue.",
          "Each pair points to the same conclusion: the headline number improved for a reason other than the business improving. Contradictions are where the useful questions are.",
        ],
        example: {
          company: "ironvale",
          title: "A contradiction worth chasing",
          rows: [
            { label: "Net profit", value: "+18%" },
            { label: "Operating cash flow", value: "−4%" },
            { label: "Receivables", value: "+40%" },
          ],
          note: "Profit rose because sales were booked. Cash fell because customers have not paid. Either collection has weakened or sales were pulled forward.",
        },
        checkpoint: {
          id: "l3-6-c2",
          question: "Profit is up 18%, operating cash flow is down 4%, and unpaid invoices are up 40%. What is the concern?",
          options: [
            "The company is growing too quickly to matter",
            "Sales are being recorded that have not converted into cash — and may not",
            "Profit is understated",
            "Nothing; this is normal",
          ],
          answer: 1,
          explain:
            "Receivables ballooning faster than sales means the company is booking revenue it has not collected. Sometimes it is timing; sometimes those customers never pay.",
        },
      },
      {
        heading: "Ratios narrow the question, they do not answer it",
        body: [
          "At the end of this level you can tell whether a company is profitable, safe, honest about its cash, and expensively or cheaply priced.",
          "What ratios cannot tell you is whether the advantage will last, whether management is competent, or whether the industry is about to change. Numbers point you at the right questions. Judgement answers them.",
        ],
      },
    ],
    recap: [
      "Any single ratio can be flattered; read several together.",
      "Profitable, safe, real, fairly priced — four questions, four ratio groups.",
      "Contradictions between ratios are the most productive things to investigate.",
      "Ratios frame the question; they never settle it.",
    ],
    finalQuiz: {
      id: "l3-6-final",
      question: "A company shows rising EPS, rising ROE and falling revenue. What is the most likely explanation?",
      options: [
        "The business is improving rapidly",
        "Buybacks and debt are lifting the per-share figures while the underlying business shrinks",
        "The figures are impossible together",
        "Revenue is the only number that matters",
      ],
      answer: 1,
      explain:
        "Falling revenue with rising per-share metrics points to financial engineering — fewer shares and more leverage — rather than operating improvement.",
    },
  },
];
