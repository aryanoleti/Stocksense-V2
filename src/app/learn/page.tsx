import type { Metadata } from "next";
import { LearnHome } from "@/components/learn/LearnHome";

export const metadata: Metadata = {
  title: "Learn to read a company — StockSense",
  description:
    "A seven-level course for beginners: shares, company accounts, financial ratios, portfolio building and staying rational in a falling market. Educational only, using invented companies.",
};

export default function LearnPage() {
  return <LearnHome />;
}
