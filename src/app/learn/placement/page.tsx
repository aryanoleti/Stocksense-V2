import type { Metadata } from "next";
import { PlacementQuiz } from "@/components/learn/PlacementQuiz";

export const metadata: Metadata = {
  title: "Where should you begin? — StockSense Learn",
  description: "A short placement quiz that suggests which levels of the course to take.",
};

export default function PlacementPage() {
  return <PlacementQuiz />;
}
