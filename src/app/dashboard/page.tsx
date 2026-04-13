"use client";

import * as React from "react";
import { Shield, Bug } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SecurityScore } from "@/components/security-score";
import { BrowserSecurityTab } from "@/components/browser-security-tab";
import { VirusScannerTab } from "@/components/virus-scanner-tab";
import {
  runBrowserSecurityAudit,
  type BrowserSecurityResult,
} from "@/lib/browser-security";

export default function DashboardPage() {
  const [auditResult, setAuditResult] =
    React.useState<BrowserSecurityResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const data = await runBrowserSecurityAudit();
        if (!cancelled) {
          setAuditResult(data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Security Dashboard
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Audit your browser security and scan files for threats — 100% private,
          everything runs locally.
        </p>
      </div>

      {/* Top-level score */}
      <div className="mb-10 flex justify-center">
        <SecurityScore score={auditResult?.score ?? 0} loading={loading} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="browser-security">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browser-security">
            <Shield className="mr-1.5 h-4 w-4" />
            Browser Security
          </TabsTrigger>
          <TabsTrigger value="virus-scanner">
            <Bug className="mr-1.5 h-4 w-4" />
            Virus Scanner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browser-security">
          <BrowserSecurityTab />
        </TabsContent>

        <TabsContent value="virus-scanner">
          <VirusScannerTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}
