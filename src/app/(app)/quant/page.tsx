import { QuantWorkbench } from "@/components/quant/QuantWorkbench";
import { FeatureGate } from "@/components/learn/FeatureGate";

export const metadata = { title: "Quant Engine — StockSense" };

/* Gated on Level 3: the workbench reports P/E, EPS, ROE, debt-to-equity and
   margins, and those figures mislead anyone who has not been told what they
   can and cannot say. */
export default function QuantPage() {
  return (
    <FeatureGate feature="quant">
      <QuantWorkbench />
    </FeatureGate>
  );
}
