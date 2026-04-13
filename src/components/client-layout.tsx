"use client";

import { ThemeProvider } from "@/lib/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </ThemeProvider>
  );
}
