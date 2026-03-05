import Link from "next/link";

import { DashboardStat } from "@/lib/types";

type DashboardCardsProps = {
  stats: DashboardStat[];
};

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const cardBody = (
          <>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {stat.value}
            </p>
            {stat.helperText ? (
              <p className="mt-1 text-xs text-slate-400">{stat.helperText}</p>
            ) : null}
          </>
        );

        if (stat.href) {
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {cardBody}
            </Link>
          );
        }

        return (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {cardBody}
          </article>
        );
      })}
    </section>
  );
}
