import type { Lesson } from "../types";

/* Level 1 — Financial Foundations.
   No numbers heavier than a division. The job here is vocabulary and
   intuition, so nothing later feels like it arrived without warning. */

export const LEVEL_1_LESSONS: Lesson[] = [
  {
    slug: "what-a-share-is",
    levelId: 1,
    order: 1,
    title: "What a share actually is",
    goal: "Explain, in your own words, what you own when you own one share.",
    minutes: 6,
    difficulty: "intro",
    steps: [
      {
        heading: "Ownership, cut into pieces",
        body: [
          "A company can be owned by one person. It can also be owned by millions. To make that possible, the ownership is cut into identical pieces called shares.",
          "If a company is divided into 40 crore shares and you hold 40 of them, you own 40 out of 400,000,000 parts of that business. Tiny — but real. You are an owner, not a lender.",
        ],
      },
      {
        heading: "What ownership actually gets you",
        body: [
          "Owning a share gives you a claim on two things: a slice of the company's future profits, and a vote on certain decisions.",
          "It does not give you the right to walk into a warehouse and take a crate off the shelf. Your claim is on the business as a whole, not on any particular object it owns.",
        ],
        checkpoint: {
          id: "l1-1-c1",
          question: "You buy 100 shares of a grocery chain. What do you now own?",
          options: [
            "A fixed amount of money the company must repay you",
            "A small ownership stake in the whole business",
            "Specific stock sitting in one of its stores",
            "A guaranteed share of this year's sales",
          ],
          answer: 1,
          explain:
            "Shares are ownership. Repayment of a fixed sum describes a loan, not a share, and your claim is on the business overall rather than on any single item it holds.",
        },
      },
      {
        heading: "A share is a claim on profit, not on sales",
        body: [
          "This distinction catches out almost every beginner. Sales are what customers pay the company. Profit is what remains after the company has paid everyone else — staff, suppliers, landlords, lenders and the tax office.",
          "Owners are last in the queue. Everyone else gets paid first. What is left over belongs to the shareholders.",
        ],
        example: {
          company: "kirana",
          title: "Being last in the queue at Kirana Kart",
          rows: [
            { label: "Customers pay (revenue)", value: "₹4,200 cr" },
            { label: "Everything else costs", value: "₹4,032 cr" },
            { label: "Left for owners (profit)", value: "₹168 cr" },
          ],
          note: "Out of every ₹100 of shopping, about ₹4 reaches the owners. Being last in the queue is exactly why owning is riskier than lending.",
        },
      },
      {
        heading: "Why the last claim can still be the best one",
        body: [
          "A lender agreed a fixed return years ago and will never get more, however well the business does.",
          "An owner has no ceiling. If Kirana Kart doubles its profit, the lender still receives the same interest — the extra flows to the owners. You accept a weaker position in bad times in exchange for the upside in good times.",
        ],
        checkpoint: {
          id: "l1-1-c2",
          question: "A company has a record year and profit doubles. Who benefits most?",
          options: [
            "The lenders, because the company can now afford more interest",
            "The shareholders, whose claim has no fixed ceiling",
            "Both equally, since they share the profit",
            "Neither, because profit stays inside the company",
          ],
          answer: 1,
          explain:
            "Lenders receive the interest they agreed and no more. The surplus above all fixed obligations belongs to owners, which is the whole reason for accepting the extra risk.",
        },
      },
    ],
    recap: [
      "A share is a small, identical slice of ownership in a business.",
      "It carries a claim on profits and a vote — not on any specific asset.",
      "Owners are paid last, after every other obligation is met.",
      "In exchange for that risk, owners keep the upside with no ceiling.",
    ],
    finalQuiz: {
      id: "l1-1-final",
      question: "What is the clearest difference between lending to a company and owning part of it?",
      options: [
        "Lenders take more risk than owners",
        "Owners are paid a fixed amount every year",
        "Lenders get a fixed claim paid first; owners get whatever is left, with no ceiling",
        "Only owners can lose money",
      ],
      answer: 2,
      explain:
        "The queue is the point. A fixed claim paid first is lending; a residual claim with unlimited upside is ownership.",
    },
  },

  {
    slug: "why-companies-sell-shares",
    levelId: 1,
    order: 2,
    title: "Why companies sell shares",
    goal: "Describe why a business would give away part of itself instead of borrowing.",
    minutes: 6,
    difficulty: "intro",
    steps: [
      {
        heading: "Growth costs money before it earns money",
        body: [
          "Suppose a chain wants to open forty new stores. Rent, shelving, staff and stock all have to be paid long before the first customer walks in.",
          "The company has three ways to find that money: use profit it already made, borrow it, or sell a piece of itself.",
        ],
      },
      {
        heading: "Borrowing versus selling ownership",
        body: [
          "Borrowing is cheaper if things go well, because you only owe the interest and keep the rest. But the repayments are due whether or not the new stores work.",
          "Selling shares brings in money that never has to be repaid. The cost is permanent: those new owners keep a slice of every future profit.",
        ],
        example: {
          company: "ironvale",
          title: "Why Ironvale Works chose to borrow",
          rows: [
            { label: "Debt", value: "₹2,800 cr" },
            { label: "Owners' equity", value: "₹2,000 cr" },
          ],
          note: "Ironvale's factories are solid, resaleable assets, so lenders were willing. It kept ownership concentrated — but those repayments are due in a bad year too.",
        },
        checkpoint: {
          id: "l1-2-c1",
          question: "What is the main advantage of raising money by selling shares rather than borrowing?",
          options: [
            "The money never has to be repaid",
            "It is always cheaper for existing owners",
            "It guarantees the expansion will succeed",
            "It removes the need to make a profit",
          ],
          answer: 0,
          explain:
            "Share capital is permanent — there is no repayment date. The price is that new owners keep a slice of every future profit, which is why it is not automatically cheaper.",
        },
      },
      {
        heading: "What 'going public' means",
        body: [
          "When a company first sells shares to the general public, it lists on a stock exchange. From then on, anyone can buy or sell those shares without asking the company.",
          "This matters more than it sounds. It means an early owner can get their money out by selling to someone else, without the company having to hand anything back.",
        ],
      },
      {
        heading: "Dilution: the cost nobody mentions",
        body: [
          "If a company issues new shares, the pie is cut into more pieces. Existing owners hold the same number of slices, but each slice is now a smaller share of the business.",
          "This is called dilution. It is not automatically bad — if the money raised earns more than it cost, everyone can end up better off. It is only bad when the cash is wasted.",
        ],
        checkpoint: {
          id: "l1-2-c2",
          question: "A company doubles its share count to fund a new factory. What happened to existing owners?",
          options: [
            "They each own a smaller percentage of the company",
            "They automatically lost money",
            "Their shares were taken away",
            "Nothing changed for them at all",
          ],
          answer: 0,
          explain:
            "Their percentage fell — that is dilution. Whether they are worse off depends entirely on whether the factory earns more than it cost.",
        },
      },
    ],
    recap: [
      "Growth has to be funded before it pays off.",
      "Debt must be repaid on schedule; share capital never has to be repaid.",
      "Listing lets owners sell to each other without touching company cash.",
      "Issuing new shares dilutes existing owners — acceptable only if the money is well spent.",
    ],
    finalQuiz: {
      id: "l1-2-final",
      question: "Which situation makes selling shares more sensible than borrowing?",
      options: [
        "The company wants the cheapest possible funding in a good year",
        "The plan is risky and fixed repayments could sink the company if it fails",
        "The company wants to avoid having any owners",
        "Interest rates have just fallen",
      ],
      answer: 1,
      explain:
        "Share capital has no repayment schedule, so it suits uncertain plans. Debt is cheaper when things go well but unforgiving when they do not.",
    },
  },

  {
    slug: "how-a-market-sets-a-price",
    levelId: 1,
    order: 3,
    title: "How a market sets a price",
    goal: "Explain what a share price is actually telling you at any given moment.",
    minutes: 7,
    difficulty: "intro",
    steps: [
      {
        heading: "A price is just the last agreement",
        body: [
          "A share price is not a valuation handed down by an authority. It is simply the price at which the most recent buyer and seller agreed to trade.",
          "That is all. One buyer, one seller, one moment. The next trade could happen at a different price a second later.",
        ],
      },
      {
        heading: "Buyers and sellers must disagree",
        body: [
          "Every trade needs someone who thinks the share is worth holding and someone who thinks it is worth selling. Both looked at the same company and reached opposite conclusions.",
          "So a price is not the market's confident answer. It is the point where disagreement clears.",
        ],
        checkpoint: {
          id: "l1-3-c1",
          question: "What does today's share price actually represent?",
          options: [
            "The company's true worth, calculated by the exchange",
            "The price the most recent buyer and seller agreed on",
            "The total value of everything the company owns",
            "A price guaranteed to be available tomorrow",
          ],
          answer: 1,
          explain:
            "A quoted price is the last trade, nothing more. It is the point where one buyer and one seller cleared their disagreement.",
        },
      },
      {
        heading: "Prices move on expectations, not on news alone",
        body: [
          "Beginners expect good news to lift a price and bad news to sink it. Often it works the other way, and the reason is expectations.",
          "If everyone already expects strong results, that expectation is in the price before the announcement. Merely meeting it changes nothing. What moves a price is the gap between what people expected and what actually happened.",
        ],
        example: {
          company: "lumen",
          title: "Lumen Labs reports growth and the price falls",
          rows: [
            { label: "Growth investors expected", value: "30%" },
            { label: "Growth reported", value: "22%" },
            { label: "Price reaction", value: "Down" },
          ],
          note: "22% growth is a good year in isolation. It still disappointed, because the price already assumed 30%. Always ask what was expected, not just what happened.",
        },
        checkpoint: {
          id: "l1-3-c2",
          question: "A company reports higher profits, and the share price drops. What most likely happened?",
          options: [
            "The market made an error that will correct itself",
            "The results were good, but weaker than the market had expected",
            "Higher profits normally push prices down",
            "The report must have been fabricated",
          ],
          answer: 1,
          explain:
            "Prices already contain expectations. Results below expectation can disappoint even when the absolute numbers look healthy.",
        },
      },
      {
        heading: "Price and value are not the same word",
        body: [
          "Price is what the last trade cleared at. Value is what the business is actually worth, based on the cash it can produce over its life.",
          "They drift apart constantly — that is what makes analysis worth doing. If price always equalled value, there would be nothing to study.",
        ],
      },
      {
        heading: "Why prices jump around so much",
        body: [
          "The underlying business changes slowly. A grocery chain does not become 3% better or worse between Tuesday and Wednesday.",
          "The price does move that much, because it reflects the mood, needs and expectations of whoever happened to be trading. Short-term movement is mostly opinion. Long-term movement tends to follow profits.",
        ],
      },
    ],
    recap: [
      "A price is the most recent agreement between one buyer and one seller.",
      "Every trade requires two people to reach opposite conclusions.",
      "Prices react to the gap between expectation and outcome, not to news alone.",
      "Price is what you pay; value is what the business is worth. They differ.",
    ],
    finalQuiz: {
      id: "l1-3-final",
      question: "Why can a share price move sharply on a day when nothing about the business changed?",
      options: [
        "The exchange recalculates values every morning",
        "Prices reflect the expectations and needs of whoever is trading, which shift faster than businesses do",
        "Company profits genuinely change day to day",
        "Prices are set by government rules",
      ],
      answer: 1,
      explain:
        "Businesses change slowly; the crowd's expectations change quickly. Short-run prices track sentiment, long-run prices track profits.",
    },
  },

  {
    slug: "risk-return-tradeoff",
    levelId: 1,
    order: 4,
    title: "Risk, return and the trade-off",
    goal: "Judge whether an expected return is worth the risk being taken to earn it.",
    minutes: 7,
    difficulty: "intro",
    steps: [
      {
        heading: "Risk is not the same as danger",
        body: [
          "In everyday speech, risk means something bad might happen. In investing it means something more specific: the range of outcomes is wide and you cannot know in advance which one you will get.",
          "A savings account has a narrow range — you know roughly what you will end up with. A single small company has a very wide one. That width is the risk.",
        ],
      },
      {
        heading: "Why higher returns demand higher risk",
        body: [
          "Nobody will pay you extra for taking a risk-free position, because anyone can take it.",
          "You are paid more only for accepting outcomes other people would rather avoid. The extra expected return is the fee the market pays you for tolerating uncertainty.",
        ],
        checkpoint: {
          id: "l1-4-c1",
          question: "Someone offers an investment with high returns and no risk of loss. What should you conclude?",
          options: [
            "It is a rare opportunity worth acting on quickly",
            "The claim is not credible — returns are compensation for risk",
            "It is fine as long as the paperwork looks official",
            "High returns always mean the manager is skilled",
          ],
          answer: 1,
          explain:
            "Extra return exists because someone must be paid to bear uncertainty. A promise of high return with no risk removes the reason the return would exist at all.",
        },
      },
      {
        heading: "Expected return is an average, not a promise",
        body: [
          "If an investment has an expected return of 12% a year, that does not mean 12% each year. It means the average across many possible futures lands near 12%.",
          "Real years arrive one at a time: up 30%, down 15%, up 5%. The average is a description of the spread, never a schedule.",
        ],
        example: {
          company: "coral",
          title: "Two paths to the same average",
          rows: [
            { label: "Coral & Co: three years", value: "+11%, +9%, +13%" },
            { label: "A small miner: three years", value: "+60%, −40%, +45%" },
            { label: "Roughly equal average", value: "about +11%" },
          ],
          note: "Similar averages, completely different experiences. If you would have sold in the −40% year, the average was never available to you.",
        },
      },
      {
        heading: "The risk that matters is the one you will act on",
        body: [
          "The technical measure of risk is how much returns bounce around. The practical measure is different: how much movement can you sit through without abandoning your plan?",
          "An investment you sell in a panic at the bottom has delivered you a loss, whatever its long-run average was. Choosing a level of risk you can actually hold is part of the decision.",
        ],
        checkpoint: {
          id: "l1-4-c2",
          question: "Why does an investment's long-run average return often not reach the investor?",
          options: [
            "Averages are usually miscalculated",
            "Investors frequently sell during the bad stretches and miss the recovery",
            "Long-run returns only apply to professionals",
            "Companies quietly change the figures",
          ],
          answer: 1,
          explain:
            "The average assumes you held the whole way through. Selling at the low converts a temporary decline into a permanent one.",
        },
      },
    ],
    recap: [
      "Risk means a wide range of possible outcomes, not certain disaster.",
      "Extra return is the fee for accepting uncertainty others avoid.",
      "Expected return describes an average across futures, not a yearly schedule.",
      "The useful question is how much movement you can hold without selling.",
    ],
    finalQuiz: {
      id: "l1-4-final",
      question: "Two investments have the same expected return, but one swings far more. What is the sensible conclusion?",
      options: [
        "Choose the calmer one, since you are not being paid extra for the swings",
        "Choose the volatile one, because volatility creates returns",
        "They are identical in every way that matters",
        "Neither is worth holding",
      ],
      answer: 0,
      explain:
        "Risk is worth taking when it comes with extra expected return. Equal return for more turbulence is a worse deal.",
    },
  },

  {
    slug: "diversification-plain-terms",
    levelId: 1,
    order: 5,
    title: "Diversification in plain terms",
    goal: "Explain why spreading money reduces risk without necessarily reducing return.",
    minutes: 7,
    difficulty: "intro",
    steps: [
      {
        heading: "One company can fail for reasons you cannot see",
        body: [
          "However carefully you research a business, some risks are invisible from outside: a fire, a fraud, a court ruling, a key customer walking away.",
          "No amount of study removes these. They are the price of holding any single company.",
        ],
      },
      {
        heading: "Spreading turns disasters into dents",
        body: [
          "If everything you own sits in one company and that company collapses, you lose everything.",
          "If it is one of twenty holdings, the same collapse costs you a twentieth. The event was equally bad; its effect on you was not.",
        ],
        example: {
          company: "ironvale",
          title: "The same bad news, two portfolios",
          rows: [
            { label: "Ironvale falls", value: "−50%" },
            { label: "Portfolio A — Ironvale only", value: "−50%" },
            { label: "Portfolio B — 1 of 20 holdings", value: "−2.5%" },
          ],
          note: "Diversification did not stop the fall. It changed a portfolio-ending event into a bad week.",
        },
        checkpoint: {
          id: "l1-5-c1",
          question: "What does diversification actually protect you from?",
          options: [
            "Every kind of loss, including a general market fall",
            "Disasters specific to one company or industry",
            "Making poor decisions",
            "Prices falling in the short term",
          ],
          answer: 1,
          explain:
            "Spreading removes company-specific risk. It cannot remove market-wide risk, since a broad decline pulls almost everything down together.",
        },
      },
      {
        heading: "Different, not just numerous",
        body: [
          "Owning twenty companies is not diversification if all twenty do the same thing. Twenty grocery chains all suffer together when food prices spike.",
          "What you want is holdings that respond differently to the same event — a software firm, a bank, a manufacturer, a consumer brand.",
        ],
        checkpoint: {
          id: "l1-5-c2",
          question: "Which portfolio is better diversified?",
          options: [
            "Ten grocery retailers",
            "Four companies across retail, software, banking and manufacturing",
            "Twenty companies from one industry",
            "One company researched very thoroughly",
          ],
          answer: 1,
          explain:
            "Diversification depends on holdings reacting differently to the same shock. Ten businesses in one industry mostly share a single fate.",
        },
      },
      {
        heading: "The limits of spreading",
        body: [
          "Diversification is not free of trade-offs. Spread far enough and your result converges on the market's average — big winners get diluted along with the losers.",
          "It also cannot protect you when everything falls together, which is exactly what happens in a serious market decline. It handles company disasters, not market weather.",
        ],
      },
    ],
    recap: [
      "Every individual company carries risks research cannot reveal.",
      "Spreading converts a single catastrophe into a survivable dent.",
      "Holdings must react differently, not merely be numerous.",
      "Diversification handles company-specific risk, never market-wide falls.",
    ],
    finalQuiz: {
      id: "l1-5-final",
      question: "Why can diversification reduce risk without reducing expected return?",
      options: [
        "Because more companies always earn more",
        "Because individual disasters partly cancel out, while the average return of the holdings is unchanged",
        "Because spreading eliminates market declines",
        "Because diversified portfolios avoid losses entirely",
      ],
      answer: 1,
      explain:
        "You keep the average return of what you hold, but the unpredictable company-specific swings partly offset each other. That is the rare free improvement in investing.",
    },
  },
];
