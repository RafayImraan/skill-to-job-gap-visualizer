"use client";

export function DashboardSectionLoading({ message }: { message: string }) {
  return (
    <div className="surface panel" style={{ minHeight: 220, display: "grid", alignItems: "center" }}>
      <p className="section-copy" style={{ margin: 0 }}>
        {message}
      </p>
    </div>
  );
}
