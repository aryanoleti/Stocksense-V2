"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface Props {
  simulator: React.ReactNode;
  myHoldings: React.ReactNode;
}

export function PortfolioTabs({ simulator, myHoldings }: Props) {
  return (
    <Tabs.Root defaultValue="simulator" className="space-y-6">
      <Tabs.List className="inline-flex bg-muted rounded-lg p-1 gap-1">
        <Tabs.Trigger
          value="simulator"
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
            "text-muted-foreground hover:text-foreground",
            "data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          )}
        >
          Simulator
        </Tabs.Trigger>
        <Tabs.Trigger
          value="my-holdings"
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
            "text-muted-foreground hover:text-foreground",
            "data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          )}
        >
          My Holdings
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="simulator">{simulator}</Tabs.Content>
      <Tabs.Content value="my-holdings">{myHoldings}</Tabs.Content>
    </Tabs.Root>
  );
}
