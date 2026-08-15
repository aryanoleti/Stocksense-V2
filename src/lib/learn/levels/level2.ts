import type { Lesson } from "../types";

/* Level 2 — Understanding Companies.
   Moves from vocabulary to the three financial statements, using the same
   five companies so comparisons carry forward into Level 3. */

export const LEVEL_2_LESSONS: Lesson[] = [
  {
    slug: "revenue-is-not-profit",
    levelId: 2,
    order: 1,
    title: "Revenue is not profit",
    goal: "Trace how money travels from a customer's payment down to the owners' share.",
    minutes: 7,
    difficulty: "intro",
    steps: [
      {
        heading: "The top line and the bottom line",
        body: [
          "Revenue is everything customers paid. It sits at the top of the income statement, which is why people call it the top line.",
          "Profit is what survives after every cost. It sits at the bottom — the bottom line. Between them is a long list of deductions.",
        ],
      },
      {
        heading: "The journey down the statement",
        body: [
          "Start with revenue. Subtract the direct cost of the goods sold to get gross profit. Subtract salaries, rent and marketing to get operating profit. Subtract interest on borrowings and tax, and what remains is net profit.",
          "Each subtraction answers a different question, which is why analysts look at all of them rather than only the last.",
        ],
        example: {
          company: "kirana",
          title: "Kirana Kart, top to bottom",
          rows: [
            { label: "Revenue", value: "₹4,200 cr" },
            { label: "Cost of goods sold", value: "−₹3,360 cr" },
            { label: "Gross profit", value: "₹840 cr" },
            { label: "Operating costs", value: "−₹560 cr" },
            { label: "Operating profit", value: "₹280 cr" },
            { label: "Interest and tax", value: "−₹112 cr" },
            { label: "Net profit", value: "₹168 cr" },
          ],
          note: "₹4,200 cr of shopping becomes ₹168 cr for owners. Every line above net profit belongs to somebody else first.",
        },
        checkpoint: {
          id: "l2-1-c1",
          question: "Kirana Kart's revenue grows by ₹100 cr. How much reaches net profit?",
          options: [
            "The full ₹100 cr",
            "Nothing, since revenue and profit are unrelated",
            "Only the portion left after the costs of serving that extra business",
            "Exactly half",
          ],
          answer: 2,
          explain:
            "Extra sales bring extra costs — more stock, more staff hours. Only the remainder reaches the bottom line, which for a thin-margin retailer is a small slice.",
        },
      },
      {
        heading: "Why two companies with equal sales differ wildly",
        body: [
          "Revenue tells you how much business a company does. It says nothing about how much of that business is worth keeping.",
          "A company selling ₹1,800 cr of software can out-earn one selling ₹4,200 cr of groceries, because software costs almost nothing to copy while groceries must be bought before they are resold.",
        ],
        example: {
          company: "lumen",
          title: "Smaller sales, larger profit",
          rows: [
            { label: "Kirana Kart revenue", value: "₹4,200 cr" },
            { label: "Kirana Kart net profit", value: "₹168 cr" },
            { label: "Lumen Labs revenue", value: "₹1,800 cr" },
            { label: "Lumen Labs net profit", value: "₹360 cr" },
          ],
          note: "Lumen sells less than half as much and earns more than twice as much. Never rank businesses by revenue alone.",
        },
      },
      {
        heading: "Profit is an opinion, cash is a fact",
        body: [
          "Profit depends on judgements: when to record a sale, how fast to write down equipment, what a debt is worth.",
          "Two honest accountants can produce different profit figures for the same year. This is not fraud — it is estimation. It is also why the cash flow statement exists, which the fourth lesson in this level covers.",
        ],
        checkpoint: {
          id: "l2-1-c2",
          question: "Why do analysts examine gross, operating and net profit separately?",
          options: [
            "Regulators require all three to be quoted",
            "Each reveals a different source of strength or weakness",
            "They are three names for the same number",
            "Only net profit matters; the others are decoration",
          ],
          answer: 1,
          explain:
            "Gross profit shows pricing power on the product itself, operating profit shows how well the company is run, and net profit shows what survives financing and tax.",
        },
      },
    ],
    recap: [
      "Revenue is the top line; net profit is what remains after everyone else is paid.",
      "Gross, operating and net profit each answer a different question.",
      "High revenue does not imply high profit — the business model decides.",
      "Profit involves judgement, which is why cash is examined separately.",
    ],
    finalQuiz: {
      id: "l2-1-final",
      question: "A company grows revenue 20% while net profit falls. What is the most likely explanation?",
      options: [
        "The figures must contain an error",
        "Costs grew faster than sales — through discounting, higher expenses or more interest",
        "Growing revenue always reduces profit",
        "The company stopped collecting payment",
      ],
      answer: 1,
      explain:
        "Growth is not free. Discounts to win sales, or costs rising faster than revenue, can leave the bottom line smaller than before.",
    },
  },

  {
    slug: "reading-an-income-statement",
    levelId: 2,
    order: 2,
    title: "Reading an income statement",
    goal: "Read a simplified income statement and say what each line is telling you.",
    minutes: 8,
    difficulty: "core",
    steps: [
      {
        heading: "What the statement covers",
        body: [
          "An income statement summarises a period — a quarter or a year. It is a recording of what happened over time, not a snapshot of what the company owns.",
          "Always check the period first. Comparing a three-month figure with a twelve-month one is the most common beginner error in company analysis.",
        ],
      },
      {
        heading: "Margins turn rupees into comparisons",
        body: [
          "Absolute profit tells you little on its own, because a bigger company earns bigger numbers. Dividing profit by revenue gives a margin, which lets you compare companies of different sizes.",
          "Net margin = net profit ÷ revenue. It answers: out of every ₹100 of sales, how much reaches the owners?",
        ],
        example: {
          company: "coral",
          title: "Net margin across three businesses",
          rows: [
            { label: "Kirana Kart", value: "168 ÷ 4,200 = 4%" },
            { label: "Coral & Co", value: "288 ÷ 2,400 = 12%" },
            { label: "Lumen Labs", value: "360 ÷ 1,800 = 20%" },
          ],
          note: "Same calculation, three very different business models. Groceries keep ₹4 per ₹100; software keeps ₹20.",
        },
        checkpoint: {
          id: "l2-2-c1",
          question: "A company reports ₹2,400 cr revenue and ₹288 cr net profit. What is its net margin?",
          options: ["2.4%", "12%", "28.8%", "120%"],
          answer: 1,
          explain: "288 ÷ 2,400 = 0.12, or 12%. Twelve rupees of every hundred in sales reach the bottom line.",
        },
      },
      {
        heading: "Low margins are not automatically bad",
        body: [
          "Retailers live on thin margins by design. They make it back by selling enormous volumes and turning over their stock quickly.",
          "The question is never simply 'is the margin high?' but 'is the margin appropriate for this kind of business, and is it improving or shrinking?'",
        ],
      },
      {
        heading: "One-off items distort the picture",
        body: [
          "Some years contain events that will not repeat: selling a building, a legal settlement, closing a division. These land in the income statement and can flatter or damage a single year's profit.",
          "When you compare years, mentally strip out the one-offs. You are trying to see the ongoing earning power of the business, not the accidents of one particular year.",
        ],
        example: {
          company: "ironvale",
          title: "A flattering one-off at Ironvale Works",
          rows: [
            { label: "Reported net profit", value: "₹525 cr" },
            { label: "Gain on selling an old plant", value: "₹200 cr" },
            { label: "Underlying profit", value: "₹325 cr" },
          ],
          note: "Reported profit jumped 60%, but the ongoing business earned ₹325 cr. Next year has no old plant left to sell.",
        },
        checkpoint: {
          id: "l2-2-c2",
          question: "Why adjust for one-off items when comparing years?",
          options: [
            "One-off items are usually fraudulent",
            "They will not repeat, so including them misrepresents ongoing earning power",
            "Accounting rules forbid reporting them",
            "They only affect small companies",
          ],
          answer: 1,
          explain:
            "One-offs are real and legitimately reported, but they say nothing about next year. Your forecast should rest on what recurs.",
        },
      },
      {
        heading: "Reading direction, not just level",
        body: [
          "A single year is a photograph. Three to five years is a story: margins widening or narrowing, growth accelerating or fading.",
          "Direction is often more informative than level. A 6% margin climbing steadily for four years usually beats a 12% margin that has halved over the same period.",
        ],
      },
    ],
    recap: [
      "Income statements cover a period — always confirm which one.",
      "Margins let you compare companies of different sizes fairly.",
      "Thin margins can be perfectly healthy in high-volume businesses.",
      "Strip out one-off items, and read several years to see direction.",
    ],
    finalQuiz: {
      id: "l2-2-final",
      question: "Which comparison is most informative for judging a company?",
      options: [
        "Its net profit against a much larger company's net profit",
        "Its margin trend over five years, and against similar businesses",
        "This quarter's revenue against last year's full-year revenue",
        "Its share price against its revenue",
      ],
      answer: 1,
      explain:
        "Margins make different sizes comparable, and a multi-year trend shows whether the business is strengthening or weakening.",
    },
  },

  {
    slug: "what-the-balance-sheet-shows",
    levelId: 2,
    order: 3,
    title: "What the balance sheet shows you",
    goal: "Interpret what a company owns, what it owes, and what is genuinely left for owners.",
    minutes: 8,
    difficulty: "core",
    steps: [
      {
        heading: "A snapshot, not a recording",
        body: [
          "Unlike the income statement, the balance sheet describes a single instant — usually the last day of the period.",
          "It answers one question: at this moment, what does the company own, and who has a claim on it?",
        ],
      },
      {
        heading: "The equation that always holds",
        body: [
          "Assets = Liabilities + Equity.",
          "Everything the company owns was funded either by borrowing (liabilities) or by owners (equity). Rearranged: Equity = Assets − Liabilities. Equity is the leftover — what owners would have if every debt were settled today.",
        ],
        example: {
          company: "ironvale",
          title: "Ironvale Works, simplified",
          rows: [
            { label: "Assets (factories, stock, cash)", value: "₹4,800 cr" },
            { label: "Liabilities (mostly borrowings)", value: "₹2,800 cr" },
            { label: "Equity (owners' leftover)", value: "₹2,000 cr" },
          ],
          note: "If Ironvale sold everything at book value and repaid every lender, ₹2,000 cr would remain for shareholders.",
        },
        checkpoint: {
          id: "l2-3-c1",
          question: "A company has ₹4,800 cr of assets and ₹2,800 cr of liabilities. What is equity?",
          options: ["₹7,600 cr", "₹2,000 cr", "₹4,800 cr", "It cannot be determined"],
          answer: 1,
          explain: "Equity = Assets − Liabilities = 4,800 − 2,800 = ₹2,000 cr — the owners' residual claim.",
        },
      },
      {
        heading: "Not all assets are equally real",
        body: [
          "Cash is unambiguous. Stock sitting in a warehouse is worth whatever someone will pay for it, which may be less than its recorded value. Goodwill from a past acquisition is an accounting entry that can be written off entirely.",
          "When you read an asset total, ask how much of it could actually be turned into money if it needed to be.",
        ],
      },
      {
        heading: "Liabilities have deadlines",
        body: [
          "Current liabilities are due within a year; long-term liabilities are due later. The split matters more than the total.",
          "A company with large borrowings spread over fifteen years is in a different position from one owing the same amount next quarter. Companies rarely fail because they owe too much overall — they fail because a payment falls due before the cash arrives.",
        ],
        checkpoint: {
          id: "l2-3-c2",
          question: "Two companies each owe ₹1,000 cr. Which is in the weaker position?",
          options: [
            "The one whose debt is due next quarter",
            "The one whose debt is spread over fifteen years",
            "They are identical, since the totals match",
            "Whichever has the larger revenue",
          ],
          answer: 0,
          explain:
            "Timing decides survival. Debt due imminently must be met from cash on hand; debt spread over years can be paid from future earnings.",
        },
      },
      {
        heading: "Book value versus market value",
        body: [
          "Equity on the balance sheet is a historical accounting figure. The market's valuation of the same company is usually very different.",
          "Lumen Labs has ₹1,500 cr of equity but a market value of ₹14,400 cr. Buyers are not paying for its recorded assets — they are paying for profits they expect it to earn in future, which no balance sheet records.",
        ],
      },
    ],
    recap: [
      "The balance sheet is a snapshot of one moment.",
      "Assets = Liabilities + Equity; equity is the owners' residual claim.",
      "Recorded asset values are estimates, not guaranteed cash.",
      "When debts fall due matters more than how large they are.",
    ],
    finalQuiz: {
      id: "l2-3-final",
      question: "Why is a company's market value usually far from its balance sheet equity?",
      options: [
        "Balance sheets are deliberately understated",
        "The market prices expected future profits, which the balance sheet does not record",
        "Market values are calculated from revenue",
        "One of the two figures must be wrong",
      ],
      answer: 1,
      explain:
        "A balance sheet records the past cost of what a company holds. A share price reflects what people expect it to earn in future — a different question entirely.",
    },
  },

  {
    slug: "cash-flow-versus-profit",
    levelId: 2,
    order: 4,
    title: "Why cash flow can differ from profit",
    goal: "Explain how a profitable company can still run out of money.",
    minutes: 8,
    difficulty: "core",
    steps: [
      {
        heading: "Profit is recorded when earned, not when paid",
        body: [
          "Accounting records a sale when it is made, even if the customer pays sixty days later. That is deliberate — it matches effort to the period it belongs to.",
          "But the electricity bill and the salaries are due now. So a company can report a healthy profit while its bank balance falls.",
        ],
      },
      {
        heading: "The gap has a name: working capital",
        body: [
          "Money gets stuck in two places. Stock is cash converted into goods that have not sold yet. Receivables are sales made where the customer has not paid yet.",
          "Both count towards profit. Neither is money you can spend. A fast-growing company often has a cash problem precisely because it is growing — each new sale ties up more cash before it releases any.",
        ],
        example: {
          company: "kirana",
          title: "Profitable and short of cash",
          rows: [
            { label: "Net profit", value: "₹168 cr" },
            { label: "Extra stock bought for new stores", value: "−₹90 cr" },
            { label: "Customer payments outstanding", value: "−₹40 cr" },
            { label: "Cash actually generated", value: "₹38 cr" },
          ],
          note: "The ₹168 cr profit is real. So is the fact that only ₹38 cr of it arrived as spendable cash.",
        },
        checkpoint: {
          id: "l2-4-c1",
          question: "How can a profitable company still run short of cash?",
          options: [
            "Its profit figure must be false",
            "Cash is tied up in unsold stock and unpaid customer invoices",
            "Profitable companies never run short of cash",
            "It paid too much tax",
          ],
          answer: 1,
          explain:
            "Profit is recorded when a sale is made; cash arrives when the customer pays. Growth widens that gap because stock and receivables both grow.",
        },
      },
      {
        heading: "Free cash flow: the figure that is hardest to dress up",
        body: [
          "Free cash flow is the cash a business generated from operating, minus what it had to spend on equipment and facilities to keep going.",
          "It is what is genuinely available to repay debt, pay dividends, or reinvest. Because it deals in money that actually moved, it is far harder to flatter with accounting judgements than profit is.",
        ],
        example: {
          company: "lumen",
          title: "Free cash flow against profit",
          rows: [
            { label: "Lumen Labs profit / FCF", value: "₹360 cr / ₹390 cr" },
            { label: "Ironvale profit / FCF", value: "₹325 cr / ₹180 cr" },
          ],
          note: "Lumen converts more than all its profit into cash. Ironvale must plough half of its profit back into machinery just to keep operating.",
        },
        checkpoint: {
          id: "l2-4-c2",
          question: "Two companies report similar profits, but one produces far less free cash flow. What does that suggest?",
          options: [
            "It is more profitable in reality",
            "It has to reinvest heavily, or its profit is not converting into cash",
            "It is definitely committing fraud",
            "Free cash flow and profit are unrelated",
          ],
          answer: 1,
          explain:
            "Weak cash conversion means profit is being absorbed by equipment spending or trapped in working capital. Persistent gaps deserve investigation.",
        },
      },
      {
        heading: "What to check first",
        body: [
          "Over several years, compare cash from operations against net profit. If they track each other, the profit is being converted into money.",
          "If profit keeps rising while operating cash flow stays flat or falls, something is absorbing the difference. That divergence is one of the earliest warning signs available to an ordinary reader of accounts.",
        ],
      },
    ],
    recap: [
      "Profit is recorded when earned; cash moves when paid.",
      "Stock and unpaid invoices absorb cash, especially during growth.",
      "Free cash flow is what remains after essential reinvestment.",
      "Profit rising while operating cash flow stagnates is a warning sign.",
    ],
    finalQuiz: {
      id: "l2-4-final",
      question: "Why do analysts often trust cash flow more than reported profit?",
      options: [
        "Cash flow is always larger",
        "Cash flow records money that actually moved, so it depends far less on judgement",
        "Profit is not audited",
        "Cash flow predicts share prices",
      ],
      answer: 1,
      explain:
        "Profit depends on estimates about timing and value. Cash either arrived or it did not, which leaves much less room for interpretation.",
    },
  },
];
