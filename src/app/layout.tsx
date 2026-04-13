import type { Metadata } from "next";
import { ClientLayout } from "@/components/client-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "CheckYourWeb - Browser Security Auditor & Virus Scanner",
  description:
    "Scan your browser for security vulnerabilities, privacy risks, and malware — 100% private, runs entirely in your browser, no data sent.",
  openGraph: {
    title: "CheckYourWeb - Browser Security Auditor & Virus Scanner",
    description:
      "Scan your browser for security vulnerabilities, privacy risks, and malware — 100% private, runs entirely in your browser, no data sent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("checkyourweb-theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
