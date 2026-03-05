import nextDynamic from "next/dynamic";

import { getAnalyticsOverview } from "@/lib/analytics";

const Charts = nextDynamic(() => import("@/components/charts/Charts"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const overview = await getAnalyticsOverview();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-2 text-sm text-slate-500">Visual insights into team follow-through and task progress.</p>
      </header>

      <Charts overview={overview} />
    </main>
  );
}
