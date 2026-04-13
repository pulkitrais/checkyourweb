import Link from "next/link";
import {
  Globe,
  Cookie,
  EyeOff,
  Radio,
  Camera,
  Fingerprint,
  Cpu,
  AlertTriangle,
  FileDigit,
  Database,
  FileType,
  Code,
  CheckCircle,
  ArrowRight,
  Lock,
  ServerOff,
  Trash2,
  GitBranch,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "How It Works - CheckYourWeb",
  description:
    "Learn how CheckYourWeb performs browser security audits and virus scanning, all within your browser.",
};

const browserChecks = [
  {
    icon: Globe,
    title: "Browser Detection & Version Check",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description:
      "Identifies your browser type and version, then cross-references it against the latest stable release. Running an outdated browser exposes you to known vulnerabilities that attackers actively exploit.",
  },
  {
    icon: Lock,
    title: "HTTPS / Connection Security",
    color: "text-green-400",
    bg: "bg-green-500/10",
    description:
      "Verifies that your connection uses HTTPS with a valid TLS certificate. Without encrypted transport, any data you send — passwords, credit cards, messages — can be intercepted by anyone on the same network.",
  },
  {
    icon: Cookie,
    title: "Cookie Security Analysis",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    description:
      "Inspects your browser cookies for missing security flags such as Secure, HttpOnly, and SameSite. Misconfigured cookies are a top vector for session hijacking and cross-site request forgery attacks.",
  },
  {
    icon: EyeOff,
    title: "Do Not Track & Global Privacy Control",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    description:
      "Checks whether your browser sends the Do Not Track (DNT) header and the newer Global Privacy Control (GPC) signal. These headers tell websites you prefer not to be tracked across the web.",
  },
  {
    icon: Radio,
    title: "WebRTC Leak Detection",
    color: "text-red-400",
    bg: "bg-red-500/10",
    description:
      "Tests whether WebRTC APIs can expose your real IP address even when using a VPN. This common leak can reveal your true location and identity to websites without your knowledge.",
  },
  {
    icon: Camera,
    title: "Permission Audit",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    description:
      "Audits browser permissions for your camera, microphone, location, and notifications. Overly permissive settings let websites access sensitive hardware without explicit consent each time.",
  },
  {
    icon: Fingerprint,
    title: "Fingerprint Resistance Score",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    description:
      "Evaluates how unique your browser fingerprint is by analyzing canvas, WebGL, audio context, and font enumeration. A unique fingerprint lets trackers identify you even without cookies.",
  },
  {
    icon: Cpu,
    title: "Service Worker Detection",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    description:
      "Detects any active service workers registered in your browser. While legitimate for offline apps, rogue service workers can intercept network requests and serve malicious content.",
  },
  {
    icon: AlertTriangle,
    title: "Mixed Content Risk",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    description:
      "Scans for insecure HTTP resources loaded on HTTPS pages. Mixed content weakens your encrypted connection and can allow attackers to inject malicious scripts or images.",
  },
] as const;

const scannerSteps = [
  {
    icon: FileDigit,
    title: "SHA-256 Hash Computation",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    description:
      "Your file is hashed locally using the Web Crypto API to produce a unique SHA-256 fingerprint. This hash is computed entirely in your browser — the file never leaves your device.",
  },
  {
    icon: Database,
    title: "Known Malware Hash Database",
    color: "text-red-400",
    bg: "bg-red-500/10",
    description:
      "The computed hash is compared against a bundled database of known malware signatures. If a match is found, the file is immediately flagged as malicious with details about the threat.",
  },
  {
    icon: FileType,
    title: "Magic Byte Verification",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description:
      "The first bytes of the file are inspected to verify the actual file type matches its extension. This catches disguised executables — for example, an .exe renamed to .jpg.",
  },
  {
    icon: Code,
    title: "Heuristic Analysis for Scripts",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    description:
      "Script files are analyzed for suspicious patterns like obfuscated code, eval() calls, encoded payloads, and known exploit signatures. This catches novel threats that aren't yet in hash databases.",
  },
  {
    icon: CheckCircle,
    title: "Verdict Determination",
    color: "text-green-400",
    bg: "bg-green-500/10",
    description:
      "Results from all analysis stages are combined to produce a final verdict. Files are classified as Clean (no threats found), Suspicious (potential risk detected), or Malicious (confirmed threat).",
  },
] as const;

export default function HowItWorks() {
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
            🔍 Under the Hood
          </Badge>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            How It Works
          </h1>
          <p className="max-w-2xl text-lg text-blue-100 sm:text-xl">
            CheckYourWeb runs every security check and virus scan directly in
            your browser using modern Web APIs. Nothing is ever sent to a
            server — your data stays on your device, always.
          </p>
        </div>
      </section>

      {/* ── Browser Security Checks ── */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4">
              Browser Audit
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Browser Security Checks
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              We analyze nine critical aspects of your browser configuration to
              give you a comprehensive security score.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {browserChecks.map((check) => (
              <Card
                key={check.title}
                className="border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
              >
                <CardHeader>
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${check.bg}`}
                  >
                    <check.icon className={`h-6 w-6 ${check.color}`} />
                  </div>
                  <CardTitle className="text-lg">{check.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {check.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Virus Scanner Section ── */}
      <section className="bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4">
              File Scanner
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Virus Scanning Process
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Our multi-layered scanning pipeline analyzes files entirely in your
              browser — nothing is ever uploaded.
            </p>
          </div>

          <div className="space-y-6">
            {scannerSteps.map((step, index) => (
              <Card
                key={step.title}
                className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              >
                <CardContent className="flex items-start gap-5 pt-6">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${step.bg}`}
                    >
                      <step.icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Verdict badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Possible verdicts:
            </span>
            <Badge variant="success">✓ Clean</Badge>
            <Badge variant="warning">⚠ Suspicious</Badge>
            <Badge variant="destructive">✕ Malicious</Badge>
          </div>
        </div>
      </section>

      {/* ── Privacy & Security Section ── */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4">
              Your Privacy
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Privacy & Security Guarantees
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              We built CheckYourWeb with a simple principle: your data is yours
              and yours alone.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Lock,
                title: "100% Browser-Based",
                description:
                  "Every check runs using JavaScript and Web APIs directly in your browser. No server-side processing.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
              {
                icon: ServerOff,
                title: "No Server Communication",
                description:
                  "Zero network requests are made during scanning. Your results never leave your device.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Trash2,
                title: "No Data Storage",
                description:
                  "We don't store scan results, files, or personal data. Close the tab and everything is gone.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                icon: GitBranch,
                title: "Open Source",
                description:
                  "Our entire codebase is publicly available for audit. Verify our privacy claims yourself.",
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-gray-200 bg-white text-center transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
              >
                <CardHeader className="items-center">
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${item.bg}`}
                  >
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#7c3aed] text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Try? Start Your Security Scan
          </h2>
          <p className="text-lg text-blue-100">
            No sign-up, no downloads, no data collected. Just instant security
            insights.
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
