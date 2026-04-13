"use client";

import * as React from "react";
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  FileText,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  scanFile,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE,
  formatFileSize,
  type ScanResult,
} from "@/lib/virus-scanner";

type Phase = "idle" | "scanning" | "done" | "error";

const SCAN_STEPS = [
  "Validating file…",
  "Computing hash…",
  "Checking database…",
  "Verifying file type…",
  "Analyzing content…",
  "Compiling results…",
];

function stepFromProgress(progress: number): string {
  if (progress < 10) return SCAN_STEPS[0];
  if (progress < 40) return SCAN_STEPS[1];
  if (progress < 50) return SCAN_STEPS[2];
  if (progress < 60) return SCAN_STEPS[3];
  if (progress < 90) return SCAN_STEPS[4];
  return SCAN_STEPS[5];
}

function verdictConfig(verdict: ScanResult["verdict"]) {
  switch (verdict) {
    case "clean":
      return {
        icon: CheckCircle,
        label: "Clean",
        border: "border-gray-300 dark:border-gray-700",
        bg: "bg-gray-50 dark:bg-gray-900",
        text: "text-gray-700 dark:text-gray-300",
        badge: "success" as const,
      };
    case "suspicious":
      return {
        icon: AlertTriangle,
        label: "Suspicious",
        border: "border-gray-400 dark:border-gray-600",
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        badge: "warning" as const,
      };
    case "malicious":
      return {
        icon: XCircle,
        label: "Malicious",
        border: "border-gray-900 dark:border-gray-100",
        bg: "bg-gray-100 dark:bg-gray-900",
        text: "text-gray-900 dark:text-gray-100",
        badge: "destructive" as const,
      };
  }
}

export function VirusScannerTab() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function reset() {
    setPhase("idle");
    setProgress(0);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
      );
      return;
    }

    setPhase("scanning");
    setProgress(0);
    setResult(null);

    try {
      const data = await scanFile(file, (p) => setProgress(p));
      setResult(data);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      setPhase("error");
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  async function copyHash() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.sha256Hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  async function exportPDF() {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("Virus Scan Report", pageWidth / 2, 20, { align: "center" });

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
    y += 10;

    doc.setFontSize(10);
    const lines = [
      `File: ${result.fileName}`,
      `Size: ${formatFileSize(result.fileSize)}`,
      `Type: ${result.fileType}`,
      `SHA-256: ${result.sha256Hash}`,
      `Magic Bytes Match: ${result.magicBytesMatch ? "Yes" : "No"}`,
      `Scan Duration: ${result.scanDuration}ms`,
    ];
    for (const line of lines) {
      doc.text(line, 14, y);
      y += 7;
    }

    if (result.heuristicFlags.length > 0) {
      y += 4;
      doc.setFontSize(12);
      doc.text("Heuristic Flags", 14, y);
      y += 7;
      doc.setFontSize(10);
      for (const flag of result.heuristicFlags) {
        doc.text(`• ${flag}`, 18, y);
        y += 6;
      }
    }

    y += 4;
    doc.setFontSize(12);
    doc.text("Details", 14, y);
    y += 7;
    doc.setFontSize(9);
    for (const detail of result.details) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(`• ${detail}`, 18, y, { maxWidth: pageWidth - 36 });
      y += 6;
    }

    doc.save(`virus-scan-${Date.now()}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Upload area – shown when idle or error */}
      {(phase === "idle" || phase === "error") && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-all duration-200 ${
              dragOver
                ? "border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-900"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            <Upload
              className={`h-12 w-12 ${
                dragOver
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />
            <div className="text-center">
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                Drag &amp; drop a file here, or click to upload
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Supported:{" "}
                {SUPPORTED_EXTENSIONS.join(", ")} — Max{" "}
                {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={SUPPORTED_EXTENSIONS.join(",")}
            onChange={onFileChange}
          />

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Scanning progress */}
      {phase === "scanning" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scanning…</CardTitle>
            <CardDescription>{stepFromProgress(progress)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <div className="flex flex-col gap-1">
              {SCAN_STEPS.map((step, i) => {
                const stepThresholds = [0, 10, 40, 50, 60, 90];
                const active = progress >= stepThresholds[i];
                return (
                  <p
                    key={step}
                    className={`text-sm transition-colors ${
                      active
                        ? "font-medium text-gray-900 dark:text-gray-100"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {active ? "✓" : "○"} {step}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {phase === "done" && result && (
        <>
          {(() => {
            const cfg = verdictConfig(result.verdict);
            const Icon = cfg.icon;
            return (
              <Card className={`${cfg.border} ${cfg.bg}`}>
                <CardHeader>
                  <CardTitle
                    className={`flex items-center gap-2 text-xl ${cfg.text}`}
                  >
                    <Icon className="h-6 w-6" />
                    {cfg.label}
                  </CardTitle>
                  <CardDescription>
                    Scanned in {result.scanDuration}ms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File info grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        File Name
                      </p>
                      <p className="text-sm font-medium break-all">
                        {result.fileName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Size
                      </p>
                      <p className="text-sm font-medium">
                        {formatFileSize(result.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Type
                      </p>
                      <p className="text-sm font-medium">{result.fileType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Magic Bytes
                      </p>
                      <p className="text-sm font-medium">
                        {result.magicBytesMatch ? (
                          <Badge variant="success">Match</Badge>
                        ) : (
                          <Badge variant="warning">Mismatch</Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* SHA-256 */}
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      SHA-256 Hash
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 truncate rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                        {result.sha256Hash}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyHash}
                        aria-label="Copy hash"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {copied && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">Copied!</span>
                      )}
                    </div>
                  </div>

                  {/* Heuristic flags */}
                  {result.heuristicFlags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Heuristic Flags
                      </p>
                      <ul className="mt-1 space-y-1">
                        {result.heuristicFlags.map((flag) => (
                          <li
                            key={flag}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Details */}
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Details
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {result.details.map((d, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          • {d}
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
              Scan Another File
            </Button>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          This is a client-side scanner for quick checks only. It analyses files
          locally in your browser and does not upload any data. For comprehensive
          protection, use a dedicated antivirus solution.
        </AlertDescription>
      </Alert>
    </div>
  );
}
