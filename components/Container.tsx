import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  width?: "reading" | "card" | "wide";
  className?: string;
};

const WIDTH_MAP = {
  reading: "max-w-[720px]",
  card: "max-w-[1080px]",
  wide: "max-w-[1280px]",
} as const;

export function Container({
  children,
  width = "card",
  className = "",
}: ContainerProps) {
  return (
    <div className={`mx-auto px-6 ${WIDTH_MAP[width]} ${className}`}>
      {children}
    </div>
  );
}
