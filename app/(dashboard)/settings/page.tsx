import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();

  const prefs = await prisma.userPreferences.findUnique({
    where: { userId: session?.user?.id ?? "" },
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your StockSense experience
        </p>
      </div>

      <SettingsForm
        preferences={prefs || {
          theme: "dark",
          currency: "INR",
          defaultExchange: "NSE",
          notifications: true,
          aiSuggestions: true,
        }}
      />
    </div>
  );
}
