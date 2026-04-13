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
  Link2,
  Shield,
  FileSearch,
  BarChart3,
  ShieldCheck,
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
    "Learn how CheckYourWeb performs browser security audits, virus scanning, and URL safety checks, all within your browser.",
};

const browserChecks = [
  {
    icon: Globe,
    title: "Browser Detection & Version Check",
    description:
      "Identifies your browser type and version, then cross-references it against the latest stable release. Running an outdated browser exposes you to known vulnerabilities that attackers actively exploit.",
  },
  {
    icon: Lock,
    title: "HTTPS / Connection Security",
    description:
      "Verifies that your connection uses HTTPS with a valid TLS certificate. Without encrypted transport, any data you send — passwords, credit cards, messages — can be intercepted by anyone on the same network.",
  },
  {
    icon: Cookie,
    title: "Cookie Security Analysis",
    description:
      "Inspects your browser cookies for missing security flags such as Secure, HttpOnly, and SameSite. Misconfigured cookies are a top vector for session hijacking and cross-site request forgery attacks.",
  },
  {
    icon: EyeOff,
    title: "Do Not Track & Global Privacy Control",
    description:
      "Checks whether your browser sends the Do Not Track (DNT) header and the newer Global Privacy Control (GPC) signal. These headers tell websites you prefer not to be tracked across the web.",
  },
  {
    icon: Radio,
    title: "WebRTC Leak Detection",
    description:
      "Tests whether WebRTC APIs can expose your real IP address even when using a VPN. This common leak can reveal your true location and identity to websites without your knowledge.",
  },
  {
    icon: Camera,
    title: "Permission Audit",
    description:
      "Audits browser permissions for your camera, microphone, location, and notifications. Overly permissive settings let websites access sensitive hardware without explicit consent each time.",
  },
  {
    icon: Fingerprint,
    title: "Fingerprint Resistance Score",
    description:
      "Evaluates how unique your browser fingerprint is by analyzing canvas, WebGL, audio context, and font enumeration. A unique fingerprint lets trackers identify you even without cookies.",
  },
  {
    icon: Cpu,
    title: "Service Worker Detection",
    description:
      "Detects any active service workers registered in your browser. While legitimate for offline apps, rogue service workers can intercept network requests and serve malicious content.",
  },
  {
    icon: AlertTriangle,
    title: "Mixed Content Risk",
    description:
      "Scans for insecure HTTP resources loaded on HTTPS pages. Mixed content weakens your encrypted connection and can allow attackers to inject malicious scripts or images.",
  },
  {
    icon: ShieldCheck,
    title: "Content Security Policy",
    description:
      "Checks if the page implements a Content Security Policy (CSP). CSP is a powerful defense against XSS and data injection attacks by controlling which resources can be loaded.",
  },
  {
    icon: EyeOff,
    title: "Referrer Policy",
    description:
      "Verifies that a strict Referrer Policy is in place to prevent leaking sensitive URL information to third-party sites when navigating away from a page.",
  },
] as const;

const scannerSteps = [
  {
    icon: FileDigit,
    title: "SHA-256 Hash Computation",
    description:
      "Your file is hashed locally using the Web Crypto API to produce a unique SHA-256 fingerprint. This hash is computed entirely in your browser — the file never leaves your device.",
  },
  {
    icon: Database,
    title: "Known Malware Hash Database",
    description:
      "The computed hash is compared against a bundled database of known malware signatures. If a match is found, the file is immediately flagged as malicious with details about the threat.",
  },
  {
    icon: FileType,
    title: "Magic Byte Verification",
    description:
      "The first bytes of the file are inspected to verify the actual file type matches its extension. This catches disguised executables — for example, an .exe renamed to .jpg.",
  },
  {
    icon: Code,
    title: "Heuristic Analysis for Scripts",
    description:
      "Script files are analyzed for 25+ suspicious patterns like obfuscated code, eval() calls, encoded payloads, registry modifications, and known exploit signatures. This catches novel threats that aren't yet in hash databases.",
  },
  {
    icon: BarChart3,
    title: "Entropy Analysis",
    description:
      "Shannon entropy is calculated to detect encrypted, packed, or obfuscated content. High-entropy executables are flagged as potentially dangerous, as malware authors often pack payloads to evade signature-based detection.",
  },
  {
    icon: CheckCircle,
    title: "Verdict Determination",
    description:
      "Results from all analysis stages are combined to produce a final verdict. Files are classified as Clean (no threats found), Suspicious (potential risk detected), or Malicious (confirmed threat). File last modified timestamps are also reported.",
  },
] as const;

const urlCheckerSteps = [
  {
    icon: Globe,
    title: "Protocol & Encryption Check",
    description:
      "Verifies whether the URL uses HTTPS for encrypted communication. HTTP URLs transmit data in plain text and are flagged as dangerous.",
  },
  {
    icon: Database,
    title: "Known Malicious Domain Check",
    description:
      "The domain is compared against a database of known malicious and phishing domains. A match immediately flags the URL as dangerous.",
  },
  {
    icon: Link2,
    title: "Structural Analysis",
    description:
      "Examines URL structure for red flags: IP-based addresses, excessive subdomains, non-standard ports, deceptive @ symbols, and suspiciously long URLs.",
  },
  {
    icon: Shield,
    title: "IDN Homograph Detection",
    description:
      "Detects internationalized domain names (IDN) containing non-ASCII characters that visually mimic legitimate domains — a common phishing technique.",
  },
  {
    icon: FileSearch,
    title: "Phishing Pattern Analysis",
    description:
      "Scans for brand-name impersonation in subdomains and credential-harvesting path patterns (login, verify, confirm) commonly used in phishing attacks.",
  },
  {
    icon: CheckCircle,
    title: "Safety Verdict",
    description:
      "All check results are combined with weighted scoring to produce a safety score (0–100) and a final verdict: Safe, Caution, or Dangerous.",
  },
] as const;

export default function HowItWorks() {
  return (
    <div className="flex flex-col">
      {/* ── Page Header ── */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <Badge className="border-white/20 bg-white/10 text-white">
            🔍 Under the Hood
          </Badge>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            How It Works
          </h1>
          <p className="max-w-2xl text-lg text-gray-400 sm:text-xl">
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
              We analyze eleven critical aspects of your browser configuration to
              give you a comprehensive security score.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {browserChecks.map((check) => (
              <Card
                key={check.title}
                className="border-gray-200 bg-white transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
              >
                <CardHeader>
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <check.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-gray-100 dark:text-gray-900">
                      {index + 1}
                    </div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
                    >
                      <step.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
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

      {/* ── URL Checker Section ── */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4">
              URL Checker
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              URL Safety Analysis
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Analyze any URL before clicking — our multi-layered checks detect
              phishing, malware distribution, and social engineering attacks.
            </p>
          </div>

          <div className="space-y-6">
            {urlCheckerSteps.map((step, index) => (
              <Card
                key={step.title}
                className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              >
                <CardContent className="flex items-start gap-5 pt-6">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-gray-100 dark:text-gray-900">
                      {index + 1}
                    </div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
                    >
                      <step.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
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
            <Badge variant="success">✓ Safe</Badge>
            <Badge variant="warning">⚠ Caution</Badge>
            <Badge variant="destructive">✕ Dangerous</Badge>
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
              },
              {
                icon: ServerOff,
                title: "No Server Communication",
                description:
                  "Zero network requests are made during scanning. Your results never leave your device.",
              },
              {
                icon: Trash2,
                title: "No Data Storage",
                description:
                  "We don't store scan results, files, or personal data. Close the tab and everything is gone.",
              },
              {
                icon: GitBranch,
                title: "Open Source",
                description:
                  "Our entire codebase is publicly available for audit. Verify our privacy claims yourself.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-gray-200 bg-white text-center transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
              >
                <CardHeader className="items-center">
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <item.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
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
      <section className="bg-gray-950 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Try? Start Your Security Scan
          </h2>
          <p className="text-lg text-gray-400">
            No sign-up, no downloads, no data collected. Just instant security
            insights.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-11 px-8 bg-white text-gray-900 shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            Start Security Scan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
