import type { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionTitle({
  children,
  eyebrow,
  align = "left",
  className = "",
}: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center" : "";

  return (
    <div className={`mb-8 ${alignClass} ${className}`}>
      {eyebrow && (
        <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-2 font-medium">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl md:text-3xl">{children}</h2>
    </div>
  );
}
