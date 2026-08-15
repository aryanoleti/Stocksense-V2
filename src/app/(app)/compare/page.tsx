import { CompareWorkbench } from "@/components/compare/CompareWorkbench";
import { FeatureGate } from "@/components/learn/FeatureGate";

export const metadata = { title: "Compare Desk — StockSense" };

/* Gated on Level 4, which is about comparing two companies without letting
   the choice of metric decide the answer in advance. */
export default function ComparePage() {
  return (
    <FeatureGate feature="compare">
      <CompareWorkbench />
    </FeatureGate>
  );
}
