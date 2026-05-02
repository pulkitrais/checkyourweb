"use client";

import Link from "next/link";
import { ShieldCheck, Search, Lock, ArrowRight, Zap, CheckCircle, Link2, Globe } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ShieldCheck,
    title: "Browser Security Audit",
    description:
      "Comprehensive analysis of your browser's security settings, privacy features, and vulnerability exposure with 17 in-depth checks.",
  },
  {
    icon: Search,
    title: "Virus & Malware Scanner",
    description:
      "Upload files for instant client-side scanning using hash matching, heuristic analysis, and entropy detection.",
  },
  {
    icon: Link2,
    title: "URL Safety Checker",
    description:
      "Analyze any URL for phishing indicators, malicious domains, homograph attacks, and suspicious patterns — before you click.",
  },
  {
    icon: Globe,
    title: "IP Address Checker",
    description:
      "Look up any IPv4 or IPv6 address to check its reputation, detect known malicious ranges, Tor exit nodes, and classify private vs. public addresses.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Everything runs locally in your browser. We never collect, store, or transmit your data.",
  },
] as const;

const steps = [
  {
    number: "1",
    title: "Click Start Scan",
    description: "Hit the scan button — no sign-up, no installation, no permissions needed.",
    icon: Zap,
  },
  {
    number: "2",
    title: "Get Instant Results",
    description:
      "Your browser runs every check locally and returns a detailed security report in seconds.",
    icon: CheckCircle,
  },
  {
    number: "3",
    title: "Take Action",
    description:
      "Follow clear, actionable recommendations to harden your browser and protect your privacy.",
    icon: ArrowRight,
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 sm:py-32 lg:py-40">
          {/* Animated shield icon */}
          <div className="animate-pulse-ring flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Instant Browser Security Check{" "}
            <span className="text-gray-400">
              + Virus Scanner + URL &amp; IP Checker
            </span>
          </h1>

          <p className="max-w-xl text-lg text-gray-400 sm:text-xl">
            All in Your Browser — 100% Private, Zero Data Sent
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-gray-900 shadow-lg hover:bg-gray-100"
              )}
            >
              Start Security Scan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/20 text-white hover:bg-white/10"
              )}
            >
              Learn More
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Badge className="border-white/20 bg-white/10 text-white">🔒 100% Private</Badge>
            <Badge className="border-white/20 bg-white/10 text-white">
              🖥️ Runs in Your Browser
            </Badge>
            <Badge className="border-white/20 bg-white/10 text-white">🚫 No Data Sent</Badge>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything You Need to Stay Safe
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Powerful security tools that respect your privacy — all running right in your browser.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-gray-200 bg-white transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
              >
                <CardHeader>
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <feature.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Three simple steps to a safer browsing experience.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white shadow-sm dark:bg-gray-100 dark:text-gray-900">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="bg-gray-950 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:py-28">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Check Your Security?
          </h2>
          <p className="text-lg text-gray-400">
            No sign-up required. Your data never leaves your device.
          </p>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white text-gray-900 shadow-lg hover:bg-gray-100"
            )}
          >
            Start Free Scan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
