import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
};

const BASE =
  "inline-block px-7 py-3 text-base font-medium transition-opacity duration-150 select-none";

const VARIANT_CLASSES = {
  primary: "bg-brand-navy text-paper hover:opacity-85",
  secondary:
    "border border-brand-navy text-brand-navy hover:bg-brand-navy/5",
} as const;

export function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  className = "",
  onClick,
}: ButtonProps) {
  const cls = `${BASE} ${VARIANT_CLASSES[variant]} ${className}`;

  if (href) {
    const isExternal = /^https?:\/\//i.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
