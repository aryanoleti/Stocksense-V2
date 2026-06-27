import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const userWithRole = {
    ...session.user,
    role: (session.user as any).role as string | undefined,
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={userWithRole} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={session.user!} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
