import { prisma } from "@/lib/prisma";
import { BrokersGrid } from "@/components/brokers/brokers-grid";

export const metadata = { title: "Buy Stocks" };

const FALLBACK_BROKERS = [
  {
    id: "zerodha",
    name: "Zerodha",
    logo: null,
    description: "India's largest stockbroker offering flat fee trading with zero brokerage on delivery trades.",
    features: ["Zero delivery brokerage", "Advanced Kite platform", "Coin for mutual funds", "₹20 flat F&O brokerage"],
    affiliateUrl: "https://zerodha.com",
    rating: 4.8,
    category: "Discount Broker",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "groww",
    name: "Groww",
    logo: null,
    description: "Simple and intuitive investing platform perfect for beginners and young investors.",
    features: ["Free delivery trading", "Beginner-friendly UI", "Mutual funds & stocks", "No account fees"],
    affiliateUrl: "https://groww.in",
    rating: 4.6,
    category: "Discount Broker",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "upstox",
    name: "Upstox",
    logo: null,
    description: "Technology-first broker with fast order execution and powerful charting tools.",
    features: ["₹20 flat per order", "Free equity delivery", "Advanced charts", "API trading support"],
    affiliateUrl: "https://upstox.com",
    rating: 4.5,
    category: "Discount Broker",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "angelone",
    name: "Angel One",
    logo: null,
    description: "Full-service broker with research tools and ARQ AI advisory platform.",
    features: ["AI advisory", "Research reports", "Mutual funds", "₹20 flat brokerage"],
    affiliateUrl: "https://angelone.in",
    rating: 4.3,
    category: "Full-Service Broker",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "hdfc",
    name: "HDFC Securities",
    logo: null,
    description: "Reliable full-service broker backed by HDFC Bank with 3-in-1 account integration.",
    features: ["3-in-1 account", "Bank integration", "IPO investments", "Research & advisory"],
    affiliateUrl: "https://hdfcsec.com",
    rating: 4.2,
    category: "Full-Service Broker",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "icici",
    name: "ICICI Direct",
    logo: null,
    description: "Established broker from ICICI Bank with comprehensive investment products.",
    features: ["3-in-1 seamless account", "Bonds & IPOs", "Global investing", "Research coverage"],
    affiliateUrl: "https://icicidirect.com",
    rating: 4.1,
    category: "Full-Service Broker",
    isActive: true,
    createdAt: new Date(),
  },
];

export default async function BuyPage() {
  let brokers = await prisma.broker.findMany({
    where: { isActive: true },
    orderBy: [{ rating: "desc" }],
  });

  // Use fallback if no brokers seeded
  if (brokers.length === 0) {
    brokers = FALLBACK_BROKERS as any;
  }

  const categories = [...new Set(brokers.map((b) => b.category))].sort();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buy Stocks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the right broker to start your investment journey
        </p>
      </div>

      <div className="card-glass p-4 border-primary/20 bg-primary/5">
        <p className="text-sm text-foreground">
          <span className="font-semibold text-primary">Disclaimer:</span>{" "}
          StockSense is an educational platform. The brokers listed below are for informational purposes only.
          Always do your own research before choosing a broker.
        </p>
      </div>

      <BrokersGrid brokers={brokers as any} categories={categories} />
    </div>
  );
}
