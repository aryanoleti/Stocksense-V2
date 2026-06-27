import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Glossary terms
  await prisma.glossaryTerm.createMany({
    skipDuplicates: true,
    data: [
      { term: "P/E Ratio", definition: "Price-to-Earnings ratio. A valuation metric calculated by dividing the stock price by earnings per share.", category: "Valuation", example: "If a stock trades at ₹100 and EPS is ₹5, P/E = 20x" },
      { term: "EPS", definition: "Earnings Per Share. The portion of a company's profit allocated to each outstanding share.", category: "Fundamentals", example: "Net profit of ₹100Cr ÷ 10Cr shares = ₹10 EPS" },
      { term: "Market Cap", definition: "Total market value of a company's outstanding shares. Price × Total Shares.", category: "Fundamentals", example: "Share price ₹500 × 10Cr shares = ₹5,000 Cr market cap" },
      { term: "SIP", definition: "Systematic Investment Plan. Investing a fixed amount regularly in mutual funds.", category: "Investment", example: "₹5,000 per month in a Nifty index fund" },
      { term: "LTCG", definition: "Long Term Capital Gains. Profit from assets held over 1 year. Taxed at 10% above ₹1 lakh in India.", category: "Taxation" },
      { term: "STCG", definition: "Short Term Capital Gains. Profit from equity assets held under 1 year. Taxed at 15% in India.", category: "Taxation" },
      { term: "Nifty 50", definition: "NSE's benchmark index tracking the 50 largest companies by market cap listed on NSE.", category: "Indices" },
      { term: "Sensex", definition: "BSE's benchmark index of 30 well-established companies listed on Bombay Stock Exchange.", category: "Indices" },
      { term: "RSI", definition: "Relative Strength Index. A momentum oscillator measuring speed and change of price movements (0-100).", category: "Technical Analysis" },
      { term: "SMA", definition: "Simple Moving Average. The average stock price over a specified number of periods.", category: "Technical Analysis" },
      { term: "Bull Market", definition: "A market condition where prices are rising or expected to rise by 20% or more.", category: "Market Concepts" },
      { term: "Bear Market", definition: "A market condition where prices have fallen 20% or more from recent highs.", category: "Market Concepts" },
      { term: "FII", definition: "Foreign Institutional Investors. Overseas entities investing in Indian financial markets.", category: "Market Participants" },
      { term: "DII", definition: "Domestic Institutional Investors. Indian entities like mutual funds and insurance companies investing in markets.", category: "Market Participants" },
      { term: "Repo Rate", definition: "Rate at which RBI lends money to commercial banks. Affects loan rates and market liquidity.", category: "Macroeconomics" },
      { term: "IPO", definition: "Initial Public Offering. A private company's first sale of stock to the public.", category: "Corporate Actions" },
      { term: "Dividend", definition: "Portion of company profits distributed to shareholders, usually quarterly or annually.", category: "Returns" },
      { term: "Demat Account", definition: "Dematerialized account that holds securities in electronic form. Required to trade in India.", category: "Trading Basics" },
    ],
  });

  // Brokers
  await prisma.broker.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "Zerodha",
        description: "India's largest discount broker with zero brokerage on equity delivery trades.",
        features: ["₹0 delivery brokerage", "Kite trading platform", "Coin for mutual funds", "CDSL DP"],
        affiliateUrl: "https://zerodha.com",
        rating: 4.8,
        category: "Discount Broker",
      },
      {
        name: "Groww",
        description: "Simple and beginner-friendly platform for stocks, mutual funds, and US stocks.",
        features: ["Zero commission MF", "US Stocks", "Fixed deposits", "Simple UI"],
        affiliateUrl: "https://groww.in",
        rating: 4.5,
        category: "Discount Broker",
      },
      {
        name: "Upstox",
        description: "RKSV backed broker with advanced charting and low brokerage fees.",
        features: ["₹20/trade F&O", "Advanced charts", "MTF available", "API trading"],
        affiliateUrl: "https://upstox.com",
        rating: 4.4,
        category: "Discount Broker",
      },
    ],
  });

  console.log("✅ Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
