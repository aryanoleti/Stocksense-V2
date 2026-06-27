import type { StockQuote } from "@/services/stock.service";

function formatCap(n?: number) {
  if (!n) return "—";
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function StockStats({ quote }: { quote: StockQuote }) {
  const stats = [
    { label: "Open", value: quote.open ? `₹${quote.open.toFixed(2)}` : "—" },
    { label: "Prev Close", value: quote.prevClose ? `₹${quote.prevClose.toFixed(2)}` : "—" },
    { label: "Day High", value: quote.high ? `₹${quote.high.toFixed(2)}` : "—" },
    { label: "Day Low", value: quote.low ? `₹${quote.low.toFixed(2)}` : "—" },
    { label: "52W High", value: quote.week52High ? `₹${quote.week52High.toFixed(2)}` : "—" },
    { label: "52W Low", value: quote.week52Low ? `₹${quote.week52Low.toFixed(2)}` : "—" },
    { label: "Market Cap", value: formatCap(quote.marketCap) },
    { label: "Volume", value: quote.volume ? quote.volume.toLocaleString("en-IN") : "—" },
    { label: "P/E Ratio", value: quote.pe ? quote.pe.toFixed(2) : "—" },
    { label: "EPS", value: quote.eps ? `₹${quote.eps.toFixed(2)}` : "—" },
  ];

  return (
    <div className="card-glass p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Key Statistics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-sm font-mono font-semibold text-foreground mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
