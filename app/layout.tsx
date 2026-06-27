import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  title: {
    default: "StockSense - Smart Stock Market Platform",
    template: "%s | StockSense",
  },
  description: "Real-time stock data, AI insights, portfolio simulator, and market news for Indian and global markets.",
  keywords: ["stocks", "NSE", "BSE", "Nifty", "Sensex", "portfolio", "trading", "India"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
