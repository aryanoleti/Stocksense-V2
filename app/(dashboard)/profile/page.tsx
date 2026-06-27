import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id ?? "" },
    select: {
      id: true, name: true, email: true, image: true, role: true,
      createdAt: true, emailVerified: true,
      _count: { select: { transactions: true, chatSessions: true } },
    },
  });

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session?.user?.id ?? "" },
    include: { holdings: true },
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>

      <ProfileForm user={user as any} portfolio={portfolio} />
    </div>
  );
}
