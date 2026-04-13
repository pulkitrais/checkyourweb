import Link from "next/link";
import {
  Shield,
  Eye,
  Globe,
  FileSearch,
  HardDrive,
  Users,
  RefreshCw,
  Mail,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Privacy Policy - CheckYourWeb",
  description:
    "CheckYourWeb privacy policy - everything runs locally in your browser with zero data collection.",
};

const sections = [
  {
    id: "introduction",
    icon: Shield,
    title: "1. Introduction",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    content: (
      <>
        <p>
          CheckYourWeb is committed to your privacy. This policy explains how
          our browser security audit and virus scanning tool handles (or, more
          accurately, <em>doesn&apos;t</em> handle) your data.
        </p>
        <p className="mt-3">
          Our core principle is simple:{" "}
          <strong>your data never leaves your browser.</strong> CheckYourWeb is
          designed as a fully client-side application. Every security check and
          file scan runs locally using JavaScript and standard Web APIs — no
          server-side processing, no cloud uploads, no data collection
          whatsoever.
        </p>
      </>
    ),
  },
  {
    id: "data-collection",
    icon: Eye,
    title: "2. Data Collection",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    content: (
      <>
        <p>
          <strong>We do NOT collect any data.</strong> This includes, but is not
          limited to:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
          <li>Personal information (name, email, IP address)</li>
          <li>Browser security scan results</li>
          <li>Files you scan for viruses</li>
          <li>File hashes, names, or metadata</li>
          <li>Browsing history or usage patterns</li>
          <li>Device information or telemetry</li>
        </ul>
        <p className="mt-3">
          We have no user accounts, no sign-up process, and no backend database.
          There is literally no mechanism in the application to collect or
          transmit your data.
        </p>
      </>
    ),
  },
  {
    id: "browser-security",
    icon: Globe,
    title: "3. Browser Security Checks",
    color: "text-green-400",
    bg: "bg-green-500/10",
    content: (
      <>
        <p>
          All browser security audits run entirely within your browser using
          standard Web APIs. The checks analyze your browser&apos;s
          configuration, security headers, privacy settings, and permission
          states.
        </p>
        <p className="mt-3">
          No network requests are made during the audit process. Results are
          computed locally and displayed in your browser. When you close the tab
          or navigate away, the results are discarded completely.
        </p>
      </>
    ),
  },
  {
    id: "file-scanning",
    icon: FileSearch,
    title: "4. File Scanning",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    content: (
      <>
        <p>
          <strong>Files are never uploaded anywhere.</strong> When you select a
          file for virus scanning, it is processed entirely in your browser:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            SHA-256 hashes are computed locally using the Web Crypto API
          </li>
          <li>
            Hash comparisons are performed against a bundled, client-side
            database
          </li>
          <li>
            Heuristic analysis runs via JavaScript in the browser&apos;s sandbox
          </li>
          <li>
            File contents are read into memory temporarily and released after
            scanning
          </li>
        </ul>
        <p className="mt-3">
          At no point does the file, its contents, its hash, or any metadata
          leave your device.
        </p>
      </>
    ),
  },
  {
    id: "cookies-storage",
    icon: HardDrive,
    title: "5. Cookies & Storage",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    content: (
      <>
        <p>
          We only use <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">localStorage</code>{" "}
          for a single purpose: saving your theme preference (light or dark
          mode). This is stored under the key{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">checkyourweb-theme</code>.
        </p>
        <p className="mt-3">
          We do not use cookies for tracking, analytics, advertising, or any
          other purpose. No session cookies, no authentication cookies, no
          third-party cookies.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    icon: Users,
    title: "6. Third-Party Services",
    color: "text-red-400",
    bg: "bg-red-500/10",
    content: (
      <>
        <p>
          <strong>
            We do not use any third-party analytics, tracking, or advertising
            services.
          </strong>{" "}
          This means:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
          <li>No Google Analytics or similar tracking tools</li>
          <li>No Facebook Pixel or social media trackers</li>
          <li>No advertising networks or retargeting scripts</li>
          <li>No CDN-hosted fonts or assets that could track requests</li>
          <li>No error reporting services that transmit user data</li>
        </ul>
        <p className="mt-3">
          The application is self-contained. All assets, scripts, and databases
          are bundled with the application and served directly.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "7. Changes to This Policy",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    content: (
      <p>
        If we make changes to this privacy policy, we will update it on this
        page and revise the &ldquo;Last updated&rdquo; date below. Since
        CheckYourWeb collects no data, changes are unlikely to be significant.
        We encourage you to review this page periodically for any updates.
      </p>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "8. Contact",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    content: (
      <>
        <p>
          If you have questions or concerns about this privacy policy or
          CheckYourWeb&apos;s privacy practices, you can reach us through our
          GitHub repository. We welcome issues, discussions, and pull requests.
        </p>
        <p className="mt-3">
          As an open-source project, our entire codebase is publicly available
          for review. You can verify every privacy claim we make by inspecting
          the source code yourself.
        </p>
      </>
    ),
  },
] as const;

export default function Privacy() {
  return (
    <div className="flex flex-col">
      {/* ── Page Header ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#7c3aed] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <Badge className="border-white/20 bg-white/10 text-white">
            🔒 Zero Data Collection
          </Badge>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-lg text-blue-100 sm:text-xl">
            CheckYourWeb is built on a simple promise — everything runs locally
            in your browser with absolutely zero data collection.
          </p>
          <p className="text-sm text-blue-200">Last updated: June 2025</p>
        </div>
      </section>

      {/* ── Policy Content ── */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="space-y-8">
            {sections.map((section) => (
              <Card
                key={section.id}
                id={section.id}
                className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${section.bg}`}
                    >
                      <section.icon
                        className={`h-5 w-5 ${section.color}`}
                      />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="prose-sm text-gray-600 leading-relaxed dark:text-gray-400">
                  {section.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#7c3aed] text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy You Can Trust
          </h2>
          <p className="text-lg text-blue-100">
            See our privacy-first approach in action. Run a security scan — no
            sign-up, no data collected.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-11 px-8 bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-colors"
          >
            Start Security Scan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
