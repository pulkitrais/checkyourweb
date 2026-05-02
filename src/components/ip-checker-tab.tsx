"use client";

import * as React from "react";
import {
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  RotateCcw,
  FileText,
  Info,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { checkIp, type IpCheckResult, type IpVerdict } from "@/lib/ip-checker";

function verdictConfig(verdict: IpVerdict) {
  switch (verdict) {
    case "safe":
      return {
        icon: CheckCircle,
        label: "Safe",
        border: "border-gray-300 dark:border-gray-700",
        bg: "bg-gray-50 dark:bg-gray-900",
        text: "text-gray-700 dark:text-gray-300",
        badgeVariant: "success" as const,
      };
    case "suspicious":
      return {
        icon: AlertTriangle,
        label: "Suspicious",
        border: "border-yellow-400 dark:border-yellow-600",
        bg: "bg-yellow-50 dark:bg-yellow-950",
        text: "text-yellow-700 dark:text-yellow-300",
        badgeVariant: "warning" as const,
      };
    case "dangerous":
      return {
        icon: XCircle,
        label: "Dangerous",
        border: "border-gray-900 dark:border-gray-100",
        bg: "bg-gray-100 dark:bg-gray-900",
        text: "text-gray-900 dark:text-gray-100",
        badgeVariant: "destructive" as const,
      };
    case "private":
      return {
        icon: Shield,
        label: "Private / Internal",
        border: "border-blue-300 dark:border-blue-700",
        bg: "bg-blue-50 dark:bg-blue-950",
        text: "text-blue-700 dark:text-blue-300",
        badgeVariant: "outline" as const,
      };
    case "reserved":
      return {
        icon: Info,
        label: "Reserved / Special",
        border: "border-gray-300 dark:border-gray-700",
        bg: "bg-gray-50 dark:bg-gray-900",
        text: "text-gray-600 dark:text-gray-400",
        badgeVariant: "outline" as const,
      };
  }
}

function severityIcon(severity: "info" | "warning" | "danger", passed: boolean) {
  if (passed) {
    return <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />;
  }
  switch (severity) {
    case "danger":
      return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />;
    case "warning":
      return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />;
    default:
      return <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />;
  }
}

const EXAMPLE_IPS = [
  "8.8.8.8",
  "1.1.1.1",
  "192.168.1.1",
  "10.0.0.1",
  "::1",
];

export function IpCheckerTab() {
  const [ip, setIp] = React.useState("");
  const [result, setResult] = React.useState<IpCheckResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setIp("");
    setResult(null);
    setError(null);
  }

  function handleCheck(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = ip.trim();
    if (!trimmed) {
      setError("Please enter an IP address to check.");
      return;
    }

    try {
      const data = checkIp(trimmed);
      setResult(data);
    } catch {
      setError("Failed to analyze the IP address. Please check the format and try again.");
    }
  }

  async function exportPDF() {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("IP Address Reputation Report", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(
      `Generated: ${result.timestamp.toLocaleString()}`,
      pageWidth / 2,
      28,
      { align: "center" },
    );

    let y = 42;
    doc.setFontSize(12);
    doc.text(`IP Address: ${result.ip}`, 14, y);
    y += 8;
    doc.text(`Version: IPv${result.version ?? "?"}`, 14, y);
    y += 8;
    doc.text(`Classification: ${result.classification}`, 14, y);
    y += 8;
    doc.text(`Verdict: ${result.verdict.toUpperCase()}`, 14, y);
    y += 8;
    doc.text(`Reputation Score: ${result.score} / 100`, 14, y);
    y += 12;

    doc.setFontSize(12);
    doc.text("Check Results", 14, y);
    y += 8;
    doc.setFontSize(9);

    for (const check of result.checks) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const status = check.passed ? "PASS" : "FAIL";
      doc.text(`[${status}] ${check.name}: ${check.detail}`, 14, y, {
        maxWidth: pageWidth - 28,
      });
      y += 8;
    }

    doc.save(`ip-check-${Date.now()}.pdf`);
  }

  return (
    <div className="space-y-6">
      {!result && (
        <>
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="Enter an IPv4 or IPv6 address (e.g., 8.8.8.8)"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-500 dark:focus:ring-gray-800"
                />
              </div>
              <Button type="submit" className="shrink-0">
                <Search className="mr-1.5 h-4 w-4" />
                Check IP
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <Globe className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-4 text-base font-medium text-gray-700 dark:text-gray-300">
              Enter any IPv4 or IPv6 address to check its reputation
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              We check for private ranges, reserved addresses, known malicious networks, Tor exit nodes, and more
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <p className="w-full text-xs font-medium uppercase text-gray-400 dark:text-gray-500">
                Try an example:
              </p>
              {EXAMPLE_IPS.map((exampleIp) => (
                <button
                  key={exampleIp}
                  onClick={() => setIp(exampleIp)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-mono text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
                >
                  {exampleIp}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {result && (
        <>
          {(() => {
            const cfg = verdictConfig(result.verdict);
            const Icon = cfg.icon;
            return (
              <Card className={`${cfg.border} ${cfg.bg}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-xl ${cfg.text}`}>
                    <Icon className="h-6 w-6" />
                    {cfg.label}
                  </CardTitle>
                  <CardDescription>
                    Reputation Score: {result.score} / 100
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* IP metadata */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        IP Address
                      </p>
                      <p className="font-mono text-sm font-medium">{result.ip}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Version
                      </p>
                      <p className="text-sm font-medium">
                        {result.version ? `IPv${result.version}` : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Classification
                      </p>
                      <Badge variant="outline" className="mt-0.5 font-normal">
                        {result.classification}
                      </Badge>
                    </div>
                  </div>

                  {/* Check results */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Security Checks ({result.checks.filter((c) => c.passed).length}/{result.checks.length} passed)
                    </p>
                    <ul className="space-y-1.5">
                      {result.checks.map((check) => (
                        <li key={check.id} className="flex items-start gap-2 text-sm">
                          {severityIcon(check.severity, check.passed)}
                          <span
                            className={
                              check.passed
                                ? "text-gray-600 dark:text-gray-400"
                                : "text-gray-900 dark:text-gray-100"
                            }
                          >
                            <span className="font-medium">{check.name}:</span>{" "}
                            {check.detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportPDF} variant="outline">
              <FileText />
              Download PDF Report
            </Button>
            <Button onClick={reset} variant="secondary">
              <RotateCcw />
              Check Another IP
            </Button>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          This IP checker uses a static threat-intelligence database and performs
          client-side analysis only. It does not make any external network requests.
          For real-time IP reputation, consider services like Shodan, VirusTotal,
          or AbuseIPDB. Private and reserved IP classifications are always accurate
          — threat reputation data reflects known entries at the time of the last update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
