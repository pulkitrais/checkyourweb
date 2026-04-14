"use client";

import * as React from "react";
import {
  Link2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  RotateCcw,
  FileText,
  ExternalLink,
  Info,
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
import { checkUrl, type UrlCheckResult, type UrlVerdict } from "@/lib/url-checker";

function verdictConfig(verdict: UrlVerdict) {
  switch (verdict) {
    case "safe":
      return {
        icon: CheckCircle,
        label: "Safe",
        border: "border-gray-300 dark:border-gray-700",
        bg: "bg-gray-50 dark:bg-gray-900",
        text: "text-gray-700 dark:text-gray-300",
        badge: "success" as const,
      };
    case "warning":
      return {
        icon: AlertTriangle,
        label: "Caution",
        border: "border-gray-400 dark:border-gray-600",
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        badge: "warning" as const,
      };
    case "dangerous":
      return {
        icon: XCircle,
        label: "Dangerous",
        border: "border-gray-900 dark:border-gray-100",
        bg: "bg-gray-100 dark:bg-gray-900",
        text: "text-gray-900 dark:text-gray-100",
        badge: "destructive" as const,
      };
  }
}

function severityIcon(severity: "info" | "warning" | "danger", passed: boolean) {
  if (passed) {
    return <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />;
  }
  switch (severity) {
    case "danger":
      return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-900 dark:text-gray-100" />;
    case "warning":
      return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />;
    default:
      return <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />;
  }
}

export function UrlCheckerTab() {
  const [url, setUrl] = React.useState("");
  const [result, setResult] = React.useState<UrlCheckResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setUrl("");
    setResult(null);
    setError(null);
  }

  function handleCheck(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL to check.");
      return;
    }

    try {
      const data = checkUrl(trimmed);
      setResult(data);
    } catch {
      setError("Failed to analyze the URL. Please check the format and try again.");
    }
  }

  async function exportPDF() {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("URL Safety Report", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(
      `Generated: ${result.timestamp.toLocaleString()}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );

    let y = 42;
    doc.setFontSize(12);
    doc.text(`Verdict: ${result.verdict.toUpperCase()}`, 14, y);
    y += 8;
    doc.text(`Safety Score: ${result.score} / 100`, 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`URL: ${result.url}`, 14, y, { maxWidth: pageWidth - 28 });
    y += 7;
    if (result.parsedDomain) {
      doc.text(`Domain: ${result.parsedDomain}`, 14, y);
      y += 7;
    }

    y += 4;
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
      y += 7;
    }

    doc.save(`url-check-${Date.now()}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* URL input — always shown unless viewing results */}
      {!result && (
        <>
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter a URL to check (e.g., https://example.com)"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-500 dark:focus:ring-gray-800"
                />
              </div>
              <Button type="submit" className="shrink-0">
                <Search className="mr-1.5 h-4 w-4" />
                Check URL
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
            <Link2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-4 text-base font-medium text-gray-700 dark:text-gray-300">
              Paste any URL above to analyze its safety
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              We check for HTTPS, phishing indicators, malicious domains, homograph attacks, and more
            </p>
          </div>
        </>
      )}

      {/* Results */}
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
                    Safety Score: {result.score} / 100
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* URL info */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        URL Analyzed
                      </p>
                      <p className="text-sm font-medium break-words">{result.url}</p>
                    </div>
                    {result.parsedDomain && (
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                          Domain
                        </p>
                        <p className="flex items-center gap-1 text-sm font-medium">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {result.parsedDomain}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Check results */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Security Checks ({result.checks.filter((c) => c.passed).length}/{result.checks.length} passed)
                    </p>
                    <ul className="space-y-1.5">
                      {result.checks.map((check) => (
                        <li
                          key={check.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          {severityIcon(check.severity, check.passed)}
                          <span className={check.passed ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}>
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
              Check Another URL
            </Button>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          This URL checker performs client-side static analysis only. It does not
          visit the URL or make any network requests. For comprehensive protection,
          verify URLs with multiple sources before clicking.
        </AlertDescription>
      </Alert>
    </div>
  );
}
