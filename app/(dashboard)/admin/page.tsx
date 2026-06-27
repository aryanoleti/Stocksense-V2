import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/");

  const [stats, recentUsers, brokers, glossaryCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, role: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.broker.findMany({ orderBy: { name: "asc" } }),
    prisma.glossaryTerm.count(),
  ]);

  const [txCount, chatCount, newsCount] = await Promise.all([
    prisma.transaction.count(),
    prisma.chatMessage.count(),
    prisma.newsCache.count(),
  ]);

  return (
    <AdminDashboard
      stats={{ users: stats, transactions: txCount, messages: chatCount, news: newsCount, glossary: glossaryCount }}
      recentUsers={recentUsers}
      brokers={brokers}
    />
  );
}
