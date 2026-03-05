"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meetings", label: "Meetings" },
  { href: "/tasks", label: "Tasks" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
          FocusFlow
        </Link>

        <ul className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                    isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
