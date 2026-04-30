import type { ReactNode } from "react";

interface OfferLayoutProps {
  children: ReactNode;
  types: ReactNode;
  etypes: ReactNode;
}

export default function OfferDetailLayout({
  children,
  types,
  etypes,
}: OfferLayoutProps) {
  // Mobile-only pull up under the fixed header; desktop unchanged
  return (
    <div className="-mt-12 md:mt-0">
      {children}
      {types}
      {etypes}
    </div>
  );
}