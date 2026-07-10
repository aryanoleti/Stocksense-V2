import { LiveDot } from "@/components/ui/Badge";
import { InstrumentBrowser } from "@/components/market/InstrumentBrowser";

export default function StocksPage() {
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            Stocks
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Every NSE-listed stock</h1>
          <p className="mt-1 text-[13.5px] text-(--color-fg-muted)">
            2,350+ listed equities with live prices. Filter by index membership or industry, search by name or symbol.
          </p>
        </div>
        <LiveDot />
      </header>
      <InstrumentBrowser kind="stock" />
    </div>
  );
}
