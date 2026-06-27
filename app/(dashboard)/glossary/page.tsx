import { prisma } from "@/lib/prisma";
import { GlossaryGrid } from "@/components/glossary/glossary-grid";

export const metadata = { title: "Glossary" };

export default async function GlossaryPage() {
  const terms = await prisma.glossaryTerm.findMany({
    orderBy: { term: "asc" },
  });

  const categories = [...new Set(terms.map((t) => t.category))].sort();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financial Glossary</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Master the language of investing with {terms.length} financial terms
        </p>
      </div>

      <GlossaryGrid terms={terms} categories={categories} />
    </div>
  );
}
