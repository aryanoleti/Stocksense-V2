import { notFound } from "next/navigation";
import { StockDetailView } from "@/components/stock/StockDetailView";
import { UNIVERSE, lookupInstrument } from "@/lib/universe";
import { NIFTY_50 } from "@/lib/mock-data";

// A safe path segment — skip any exotic symbols that can't be a clean URL/file.
const SAFE = /^[A-Za-z0-9._-]+$/;

export async function generateStaticParams() {
  // Every listed instrument (stocks + ETFs) gets a detail page, so search,
  // recently-viewed and the simulator never land on a 404.
  const symbols = new Set<string>([
    ...NIFTY_50.map((s) => s.symbol),
    ...UNIVERSE.map((s) => s.symbol),
  ]);
  return Array.from(symbols)
    .filter((s) => SAFE.test(s))
    .map((symbol) => ({ symbol }));
}

type Props = { params: Promise<{ symbol: string }> };

export default async function StockDetailPage({ params }: Props) {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw).toUpperCase();
  const inst = lookupInstrument(symbol);
  const curated = NIFTY_50.find((s) => s.symbol === symbol);
  if (!inst && !curated) notFound();

  return (
    <StockDetailView
      symbol={symbol}
      name={inst?.name ?? curated!.name}
      industry={inst?.industry ?? curated?.sector}
      kind={inst?.kind ?? "stock"}
    />
  );
}
