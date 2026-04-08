"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { brandStory, pageIntros } from "@/lib/mock-data";

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`surface panel ${className}`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}

export function QueryMessage({ message }: { message: string }) {
  return <p className="section-copy">{message}</p>;
}

export function PageHeader({ page }: { page: keyof typeof pageIntros }) {
  const intro = pageIntros[page];

  return (
    <div className="topbar surface panel">
      <div>
        <div className="eyebrow">
          <Sparkles size={14} />
          AI-guided progress
        </div>
        <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 16 }}>
          {intro.title}
        </h1>
        <p className="section-copy">{intro.copy}</p>
      </div>

      <div className="topbar-actions">
        <div className="pill">Target role: {brandStory.target}</div>
        <div className="pill">Streak: {brandStory.streak}</div>
      </div>
    </div>
  );
}

export function getRewriteDiffHints(currentBullet: string, rewrittenBullet: string) {
  const hints: string[] = [];

  if (
    /responsible for|worked on|helped with|involved in/i.test(currentBullet) &&
    !/responsible for|worked on|helped with|involved in/i.test(rewrittenBullet)
  ) {
    hints.push("Stronger action verb");
  }

  if (!/\d/.test(currentBullet) && /\d/.test(rewrittenBullet)) {
    hints.push("Added measurable outcome");
  }

  if (rewrittenBullet.length > currentBullet.length + 20) {
    hints.push("More context");
  }

  if (hints.length === 0) {
    hints.push("Sharper phrasing");
  }

  return hints;
}
