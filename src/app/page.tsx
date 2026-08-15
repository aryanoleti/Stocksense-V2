import type { Metadata } from "next";
import { LearnHome } from "@/components/learn/LearnHome";

/* The home screen is the course. Visitors land in Learn before anything else,
   so the first thing the product offers is an explanation rather than a chart. */
export const metadata: Metadata = {
  title: "Learn to read a company — StockSense",
  description:
    "A free seven-level course for beginners: shares, company accounts, financial ratios, portfolio building and staying rational in a falling market. Educational only, using invented companies.",
};

export default function HomePage() {
  return <LearnHome />;
}
