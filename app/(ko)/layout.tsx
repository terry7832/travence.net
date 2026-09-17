import type { Metadata, Viewport } from "next";
import { RootShell } from "@/components/site/root-shell";
import { metadataFor } from "@/lib/seo";

export const metadata: Metadata = metadataFor("ko");
export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function KoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="ko">{children}</RootShell>;
}
