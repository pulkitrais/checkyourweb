"use client";

import * as React from "react";

interface SecurityScoreProps {
  score: number;
  loading?: boolean;
}

function scoreColor(score: number) {
  if (score >= 75) return { stroke: "#404040", text: "text-gray-700 dark:text-gray-300" };
  if (score >= 50) return { stroke: "#737373", text: "text-gray-500 dark:text-gray-400" };
  return { stroke: "#171717", text: "text-gray-900 dark:text-gray-100" };
}

function scoreLabel(score: number) {
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

export function SecurityScore({ score, loading = false }: SecurityScoreProps) {
  const [displayed, setDisplayed] = React.useState(0);

  React.useEffect(() => {
    if (loading) {
      setDisplayed(0);
      return;
    }

    const target = Math.round(Math.max(0, Math.min(100, score)));
    if (displayed === target) return;

    const step = target > displayed ? 1 : -1;
    const timer = setTimeout(() => setDisplayed((p) => p + step), 12);
    return () => clearTimeout(timer);
  }, [score, loading, displayed]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = loading ? 0 : (displayed / 100) * circumference;
  const dashOffset = circumference - progress;
  const { stroke, text } = scoreColor(displayed);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={loading ? "currentColor" : stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={
              loading
                ? "animate-pulse text-gray-300 dark:text-gray-700"
                : "transition-all duration-200"
            }
          />
        </svg>
        {/* Centered score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <span className="text-sm font-medium text-gray-400">
              Scanning…
            </span>
          ) : (
            <>
              <span className={`text-3xl font-bold ${text}`}>{displayed}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                / 100
              </span>
            </>
          )}
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Security Score
      </p>
      {!loading && (
        <span
          className={`text-xs font-medium ${text}`}
        >
          {scoreLabel(displayed)}
        </span>
      )}
    </div>
  );
}
