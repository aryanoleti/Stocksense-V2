import type { Lesson } from "../types";

/* Level 5 — Build Your Portfolio.
   Allocation with virtual money. The arithmetic is deliberately simple so the
   reader's attention stays on the reasoning behind each split. */

export const LEVEL_5_LESSONS: Lesson[] = [
  {
    slug: "position-sizing",
    levelId: 5,
    order: 1,
    title: "Position sizing with virtual money",
    goal: "Decide how much of a portfolio one holding should occupy, and why.",
    minutes: 8,
    difficulty: "applied",
    steps: [
      {
        heading: "Choosing well is only half the decision",
        body: [
          "Two people can buy the same company on the same day and get very different results, because one put 5% of their money in and the other put 60%.",
          "Position size determines how much any single judgement can affect you. It is the part of investing most beginners never consciously decide.",
        ],
      },
      {
        heading: "Size against conviction and risk",
        body: [
          "Larger positions belong where evidence is strongest and the business is most predictable. Smaller ones where the case is thinner or the outcome is wider.",
          "A practical starting frame: no single holding above 10% for a beginner, and nothing so small that it cannot matter — twenty holdings at 5% is a portfolio; sixty at 1.7% is an index fund you assembled by hand at greater cost.",
        ],
        example: {
          company: "coral",
          title: "A ₹1,00,000 virtual portfolio",
          rows: [
            { label: "Coral & Co (strong evidence)", value: "₹15,000" },
            { label: "Lumen Labs (growth, higher risk)", value: "₹10,000" },
            { label: "Meridian Bank (stable)", value: "₹15,000" },
            { label: "Kirana Kart (thin margins)", value: "₹10,000" },
            { label: "Ironvale Works (leveraged)", value: "₹5,000" },
            { label: "Held in cash", value: "₹45,000" },
          ],
          note: "The riskiest business gets the smallest slice. Holding cash is a position too — it means no idea currently justifies more.",
        },
        checkpoint: {
          id: "l5-1-c1",
          question: "Why should the most leveraged company get a smaller allocation?",
          options: [
            "Leveraged companies always lose money",
            "Its range of outcomes is wider, so the same mistake costs more",
            "Small positions grow faster",
            "Debt is against the rules",
          ],
          answer: 1,
          explain:
            "Position size should scale with how wide the possible outcomes are. Debt widens that range in both directions.",
        },
      },
      {
        heading: "The rule that matters: what if I am wrong?",
        body: [
          "Before sizing, ask what happens if this holding falls 50%. At a 5% position, that is a 2.5% dent. At a 40% position, it is a 20% loss that takes years to recover.",
          "Size so that being wrong is survivable, because you will be wrong sometimes regardless of how carefully you work.",
        ],
        example: {
          company: "ironvale",
          title: "The same mistake at two sizes",
          rows: [
            { label: "Ironvale falls", value: "−50%" },
            { label: "At 5% of portfolio", value: "−2.5% overall" },
            { label: "At 40% of portfolio", value: "−20% overall" },
          ],
          note: "Identical analysis, identical error, ten times the damage. Sizing decided the outcome, not stock-picking skill.",
        },
        checkpoint: {
          id: "l5-1-c2",
          question: "A holding at 8% of your portfolio falls 50%. What is the impact overall?",
          options: ["−50%", "−8%", "−4%", "−25%"],
          answer: 2,
          explain: "8% × 50% = 4%. Position size converts a company-level loss into a portfolio-level one.",
        },
      },
      {
        heading: "Cash is a legitimate position",
        body: [
          "Beginners often feel every rupee must be invested at all times. It does not.",
          "Cash held because nothing currently meets your standard is a decision. Cash held because you never got around to deciding is not — the difference is whether you can say why.",
        ],
      },
    ],
    recap: [
      "Position size decides how much any one judgement affects you.",
      "Size with conviction and with the width of possible outcomes.",
      "Ask what a 50% fall would do before you buy, not after.",
      "Deliberately held cash is a position; forgotten cash is not.",
    ],
    finalQuiz: {
      id: "l5-1-final",
      question: "What is the strongest argument for capping any single holding?",
      options: [
        "It guarantees better returns",
        "It ensures no single mistake can permanently damage the portfolio",
        "Regulators require diversification",
        "Small positions are easier to track",
      ],
      answer: 1,
      explain:
        "Caps do not raise returns. They ensure that being wrong — which will happen — remains recoverable.",
    },
  },

  {
    slug: "spreading-risk-across-sectors",
    levelId: 5,
    order: 2,
    title: "Spreading risk across sectors",
    goal: "Build a holding list whose members do not all fail for the same reason.",
    minutes: 7,
    difficulty: "applied",
    steps: [
      {
        heading: "Hidden overlap",
        body: [
          "A portfolio of five companies can behave like one holding if all five depend on the same thing — consumer spending, interest rates, or a single commodity price.",
          "The test is not how many names you hold. It is how many different ways your portfolio can be hurt.",
        ],
      },
      {
        heading: "Ask what each holding depends on",
        body: [
          "For every company, write down the one condition it most needs. Kirana Kart needs consumer spending. Ironvale needs industrial demand and manageable interest rates. Meridian Bank needs borrowers who repay.",
          "If the same condition appears three times, you own one bet wearing three costumes.",
        ],
        example: {
          company: "meridian",
          title: "Dependencies across the universe",
          rows: [
            { label: "Kirana Kart", value: "Household spending" },
            { label: "Coral & Co", value: "Household spending" },
            { label: "Ironvale Works", value: "Industrial demand, interest rates" },
            { label: "Lumen Labs", value: "Business software budgets" },
            { label: "Meridian Bank", value: "Credit quality, interest rates" },
          ],
          note: "Kirana and Coral share a dependency, so they should not both be large positions. The other three fail for genuinely different reasons.",
        },
        checkpoint: {
          id: "l5-2-c1",
          question: "Which pair provides the least real diversification?",
          options: [
            "Kirana Kart and Coral & Co",
            "Lumen Labs and Ironvale Works",
            "Meridian Bank and Coral & Co",
            "Ironvale Works and Lumen Labs",
          ],
          answer: 0,
          explain:
            "Both depend on household spending, so a squeeze on consumers hits both together. The other pairs respond to different conditions.",
        },
      },
      {
        heading: "Diversification has a cost",
        body: [
          "Every holding added dilutes your best idea. At forty positions your strongest conviction affects the outcome barely at all.",
          "The honest trade-off: concentration raises both the chance of an outstanding result and the chance of a damaging one. Somewhere between eight and twenty holdings, most beginners get most of the benefit without erasing their own judgement.",
        ],
        checkpoint: {
          id: "l5-2-c2",
          question: "What is the main cost of holding forty companies instead of twelve?",
          options: [
            "Higher risk",
            "Your best ideas are diluted until the result approaches the market average",
            "It is against the rules",
            "There is no cost",
          ],
          answer: 1,
          explain:
            "Beyond a point, extra names remove little additional risk while steadily diluting whatever advantage your research provides.",
        },
      },
      {
        heading: "Rebalance when weights drift",
        body: [
          "Winners grow into a larger share of the portfolio without you doing anything. A 10% holding that triples can quietly become 25% of your money.",
          "That is concentration arriving by accident rather than by decision — which the next lesson deals with directly.",
        ],
      },
    ],
    recap: [
      "Count the ways you can be hurt, not the number of holdings.",
      "Write down the single condition each company depends on.",
      "Over-diversification dilutes your best work.",
      "Winners silently concentrate a portfolio over time.",
    ],
    finalQuiz: {
      id: "l5-2-final",
      question: "You hold six companies and all six depend on consumer spending. What have you actually built?",
      options: [
        "A well-diversified portfolio",
        "One concentrated bet on consumer spending, split six ways",
        "A market-tracking portfolio",
        "A low-risk portfolio",
      ],
      answer: 1,
      explain:
        "Diversification requires different dependencies. Six names sharing one condition is a single bet with extra paperwork.",
    },
  },

  {
    slug: "rebalancing-without-overtrading",
    levelId: 5,
    order: 3,
    title: "Rebalancing without overtrading",
    goal: "Keep a portfolio near its intended shape without trading for its own sake.",
    minutes: 7,
    difficulty: "applied",
    steps: [
      {
        heading: "Portfolios drift on their own",
        body: [
          "You set out with five equal positions. Two years later one has doubled and another has halved. You never traded, but your portfolio is no longer the one you designed.",
          "Rebalancing means trimming what has grown too large and topping up what has shrunk, returning to your intended weights.",
        ],
        example: {
          company: "lumen",
          title: "Two years of drift",
          rows: [
            { label: "Lumen Labs: 20% → ", value: "34%" },
            { label: "Kirana Kart: 20% → ", value: "12%" },
            { label: "Others", value: "roughly unchanged" },
          ],
          note: "Nothing was bought or sold. The portfolio now carries far more Lumen risk than was ever decided on.",
        },
        checkpoint: {
          id: "l5-3-c1",
          question: "Why does a portfolio need rebalancing even if you never trade?",
          options: [
            "Fees reduce holdings over time",
            "Different holdings grow at different rates, so weights drift away from the plan",
            "Share counts change automatically",
            "It does not — untouched portfolios stay balanced",
          ],
          answer: 1,
          explain:
            "Unequal returns silently change the weights. The risk you carry today is the result of past price moves, not of your original decision.",
        },
      },
      {
        heading: "Rebalancing feels wrong, which is the point",
        body: [
          "It asks you to sell part of what has done well and add to what has done badly — the opposite of instinct.",
          "It is not a prediction that the winner will fall. It is a statement that you never intended a third of your money to sit in one holding.",
        ],
      },
      {
        heading: "Use a threshold, not a feeling",
        body: [
          "Rebalance on a rule: annually, or whenever a position drifts more than five percentage points from its target.",
          "A rule stops both errors — the constant fiddling that racks up costs, and the years of neglect that let a single holding quietly take over.",
        ],
        example: {
          company: "lumen",
          title: "Applying a 5-point rule",
          rows: [
            { label: "Target weight", value: "20%" },
            { label: "Actual weight", value: "34%" },
            { label: "Drift", value: "14 points — act" },
            { label: "Action", value: "Trim to 20%, redeploy" },
          ],
          note: "The rule decided this, not a view on Lumen's prospects. That is what makes it repeatable when you feel strongly.",
        },
        checkpoint: {
          id: "l5-3-c2",
          question: "Why use a fixed threshold rather than rebalancing when it feels right?",
          options: [
            "Thresholds produce higher returns",
            "A rule prevents both constant tinkering and long neglect, and works when your judgement is compromised",
            "Feelings are always wrong",
            "It is a legal requirement",
          ],
          answer: 1,
          explain:
            "The moments you most want to abandon a plan are the moments the plan is most valuable. Rules survive those moments; intentions often do not.",
        },
      },
      {
        heading: "Every trade has a cost",
        body: [
          "Each transaction carries brokerage, possible taxes, and the spread between buying and selling prices.",
          "Rebalancing twelve times a year will usually cost more than the risk control is worth. Once a year, or on a clear threshold breach, captures most of the benefit for a fraction of the cost.",
        ],
      },
    ],
    recap: [
      "Portfolios drift as holdings grow at different rates.",
      "Rebalancing restores the shape you actually chose.",
      "A threshold rule beats acting on how you feel.",
      "Trading costs make frequent rebalancing self-defeating.",
    ],
    finalQuiz: {
      id: "l5-3-final",
      question: "Your best holding has grown from 10% to 30% of the portfolio. What does rebalancing assume?",
      options: [
        "That the holding will fall",
        "Nothing about its prospects — only that 30% is more concentration than you chose to carry",
        "That it was a mistake to buy it",
        "That all holdings must be equal",
      ],
      answer: 1,
      explain:
        "Rebalancing is a risk decision, not a forecast. The company may keep performing; the question is how much of your outcome should depend on it.",
    },
  },
];
