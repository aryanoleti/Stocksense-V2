import { getMarketNews } from "@/services/news.service";
import { NewsFeed } from "@/components/news/news-feed";

export const metadata = { title: "Market News" };
export const revalidate = 300;

export default async function NewsPage() {
  const articles = await getMarketNews();
  return <NewsFeed initialArticles={articles} />;
}
