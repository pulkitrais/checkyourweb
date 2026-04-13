"use client";

import * as React from "react";
import {
  RefreshCw,
  Download,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { SecurityScore } from "@/components/security-score";
import {
  runBrowserSecurityAudit,
  type BrowserSecurityResult,
  type CheckStatus,
} from "@/lib/browser-security";

function statusBadge(status: CheckStatus) {
  switch (status) {
    case "secure":
      return <Badge variant="success">Secure</Badge>;
    case "warning":
      return <Badge variant="warning">Warning</Badge>;
    case "at-risk":
      return <Badge variant="destructive">At Risk</Badge>;
  }
}

export function BrowserSecurityTab() {
  const [result, setResult] = React.useState<BrowserSecurityResult | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const runAudit = React.useCallback(async () => {
    setLoading(true);
    setResult(null);
    setProgress(0);

    // Animate progress while the audit runs
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 4, 90));
    }, 80);

    try {
      const data = await runBrowserSecurityAudit();
      clearInterval(interval);
      setProgress(100);
      setResult(data);
    } catch {
      clearInterval(interval);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    runAudit();
  }, [runAudit]);

  const nonSecureChecks = result?.checks.filter(
    (c) => c.status !== "secure"
  ) ?? [];

  function exportJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `browser-security-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("Browser Security Report", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(
      `Generated: ${result.timestamp.toLocaleString()}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );

    doc.setFontSize(14);
    doc.text(`Overall Score: ${result.score} / 100`, 14, 42);

    let y = 55;
    doc.setFontSize(12);
    doc.text("Category", 14, y);
    doc.text("Check", 55, y);
    doc.text("Status", 130, y);
    doc.text("Value", 160, y);
    y += 2;
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    doc.setFontSize(9);
    for (const check of result.checks) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(check.category, 14, y);
      doc.text(check.name, 55, y, { maxWidth: 70 });
      doc.text(check.status.toUpperCase(), 130, y);
      doc.text(check.value, 160, y, { maxWidth: 40 });
      y += 7;
    }

    if (nonSecureChecks.length > 0) {
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.text("Recommendations", 14, y);
      y += 8;
      doc.setFontSize(9);
      for (const check of nonSecureChecks) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        if (check.recommendation) {
          doc.text(`• ${check.name}: ${check.recommendation}`, 14, y, {
            maxWidth: pageWidth - 28,
          });
          y += 7;
        }
      }
    }

    doc.save(`browser-security-${Date.now()}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={runAudit} disabled={loading} variant="outline">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Running Audit…" : "Re-run Audit"}
        </Button>
        <Button
          onClick={exportJSON}
          disabled={!result}
          variant="outline"
          size="sm"
        >
          <Download />
          Export JSON
        </Button>
        <Button
          onClick={exportPDF}
          disabled={!result}
          variant="outline"
          size="sm"
        >
          <FileText />
          Export PDF
        </Button>
      </div>

      {/* Loading progress */}
      {loading && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analyzing browser security settings…
          </p>
          <Progress value={progress} />
        </div>
      )}

      {/* Results table */}
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Audit Results
              </CardTitle>
              <CardDescription>
                {result.checks.length} checks completed at{" "}
                {result.timestamp.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Check</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Value
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Recommendation
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.checks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">
                        {check.category}
                      </TableCell>
                      <TableCell>{check.name}</TableCell>
                      <TableCell>{statusBadge(check.status)}</TableCell>
                      <TableCell className="hidden max-w-48 truncate md:table-cell">
                        {check.value}
                      </TableCell>
                      <TableCell className="hidden max-w-64 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                        {check.recommendation ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Score */}
          <div className="flex justify-center py-4">
            <SecurityScore score={result.score} />
          </div>

          {/* Recommendations */}
          {nonSecureChecks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  {nonSecureChecks.length} item
                  {nonSecureChecks.length === 1 ? "" : "s"} need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {nonSecureChecks.map((check) => (
                    <li
                      key={check.id}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                    >
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {check.name}{" "}
                          <span className="ml-1">
                            {statusBadge(check.status)}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {check.recommendation ?? check.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
