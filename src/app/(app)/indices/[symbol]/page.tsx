import { notFound } from "next/navigation";
import { INDICES } from "@/lib/mock-data";
import { IndexDetailView } from "@/components/market/IndexDetailView";

export function generateStaticParams() {
  return INDICES.map((i) => ({ symbol: i.symbol }));
}

type Props = { params: Promise<{ symbol: string }> };

export default async function IndexDetailPage({ params }: Props) {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw).toUpperCase();
  const index = INDICES.find((i) => i.symbol === symbol);
  if (!index) notFound();

  return <IndexDetailView symbol={index.symbol} name={index.name} base={index.base} />;
}
