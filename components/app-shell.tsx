"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { navItems, topNavItems } from "@/lib/mock-data";
import { logout, useAuthSession } from "@/lib/api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthSession();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Continue with logout regardless
    }
    router.push("/auth/sign-in");
    router.refresh();
  }

  return (
    <>
      <div className="app-layout">
        <motion.aside
          className="sidebar surface"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="sidebar-brand">
            <div className="eyebrow">
              <Sparkles size={14} />
              AI Career OS
            </div>
            <h2 className="sidebar-title">Skill-to-Job Gap Visualizer</h2>
            <p className="section-copy">A flagship dashboard that explains exactly why shortlists are slipping.</p>
            <div className="tag-row" style={{ marginTop: 16 }}>
              <span className="pill">{auth.data?.authenticated ? auth.data?.user?.name ?? "Signed in" : "Sign in to continue"}</span>
              {auth.data?.authenticated && (
                <button className="button-secondary" onClick={handleLogout} style={{ padding: "10px 16px" }}>
                  Log out
                </button>
              )}
            </div>
          </div>

          <nav className="nav-list">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className={`nav-link${active ? " active" : ""}`}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="surface panel" style={{ marginTop: 24 }}>
            <div className="row-between">
              <div>
                <div className="muted">Momentum</div>
                <div className="stat-value" style={{ fontSize: "1.8rem", marginTop: 4 }}>
                  12 days
                </div>
              </div>
              <Flame color="var(--amber)" />
            </div>
            <p className="section-copy">Keep the streak alive to unlock roadmap XP multipliers and milestone boosts.</p>
          </div>
        </motion.aside>

        <main className="content-stack">{children}</main>
      </div>

      <nav className="mobile-nav surface">
        {topNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={active ? "active" : ""}>
              <Icon size={18} />
              <span>{label.replace("Public ", "")}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
