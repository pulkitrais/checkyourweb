// ---------------------------------------------------------------------------
// Browser Security Audit Library
// ---------------------------------------------------------------------------
// Pure TypeScript module — all browser API access is guarded with
// `typeof window !== "undefined"` and try/catch for SSR safety.
// ---------------------------------------------------------------------------

export type CheckStatus = "secure" | "warning" | "at-risk";

export interface SecurityCheck {
  id: string;
  category: string;
  name: string;
  status: CheckStatus;
  value: string;
  description: string;
  recommendation?: string;
  weight: number;
}

export interface BrowserSecurityResult {
  checks: SecurityCheck[];
  score: number; // 0–100
  timestamp: Date;
}

// ---- helpers ---------------------------------------------------------------

interface BrowserInfo {
  name: string;
  version: number;
  fullVersion: string;
  os: string;
}

function detectBrowser(): BrowserInfo {
  const unknown: BrowserInfo = {
    name: "Unknown",
    version: 0,
    fullVersion: "Unknown",
    os: "Unknown",
  };

  if (typeof window === "undefined" || !navigator?.userAgent) return unknown;

  const ua = navigator.userAgent;

  // OS detection
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X") || ua.includes("Macintosh")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (ua.includes("CrOS")) os = "Chrome OS";

  // Browser detection – order matters (Edge & Opera include "Chrome")
  let name = "Unknown";
  let fullVersion = "Unknown";

  if (ua.includes("Edg/")) {
    name = "Edge";
    fullVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? "Unknown";
  } else if (ua.includes("OPR/") || ua.includes("Opera")) {
    name = "Opera";
    fullVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] ?? "Unknown";
  } else if (ua.includes("Chrome/") && !ua.includes("Chromium")) {
    name = "Chrome";
    fullVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "Unknown";
  } else if (ua.includes("Firefox/")) {
    name = "Firefox";
    fullVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "Unknown";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    name = "Safari";
    fullVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? "Unknown";
  }

  const version = parseInt(fullVersion, 10) || 0;

  return { name, version, fullVersion, os };
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ---- individual checks -----------------------------------------------------

function checkBrowserDetection(): SecurityCheck {
  const info = detectBrowser();
  const value = `${info.name} ${info.fullVersion} on ${info.os}`;

  return {
    id: "browser-detection",
    category: "Browser",
    name: "Browser Detection",
    status: info.name === "Unknown" ? "warning" : "secure",
    value,
    description: `Detected browser: ${value}.`,
    weight: 2,
  };
}

function checkHTTPS(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "https-status",
      category: "Connection",
      name: "HTTPS Status",
      status: "warning",
      value: "Unknown (SSR)",
      description: "Cannot determine protocol during server-side rendering.",
      weight: 15,
    };
  }

  const isSecure = location.protocol === "https:";
  return {
    id: "https-status",
    category: "Connection",
    name: "HTTPS Status",
    status: isSecure ? "secure" : "at-risk",
    value: isSecure ? "HTTPS" : "HTTP",
    description: isSecure
      ? "Your connection is encrypted with HTTPS."
      : "Your connection is NOT encrypted. Data can be intercepted.",
    recommendation: isSecure
      ? undefined
      : "Always use HTTPS. Avoid entering sensitive data on HTTP pages.",
    weight: 15,
  };
}

function checkOutdatedBrowser(): SecurityCheck {
  const info = detectBrowser();

  const thresholds: Record<
    string,
    { latest: number; warning: number; atRisk: number }
  > = {
    Chrome: { latest: 136, warning: 130, atRisk: 115 },
    Firefox: { latest: 138, warning: 130, atRisk: 110 },
    Edge: { latest: 136, warning: 130, atRisk: 115 },
    Safari: { latest: 18, warning: 17, atRisk: 16 },
    Opera: { latest: 118, warning: 110, atRisk: 100 },
  };

  const t = thresholds[info.name];

  if (!t) {
    return {
      id: "outdated-browser",
      category: "Browser",
      name: "Outdated Browser Detection",
      status: "warning",
      value: `${info.name} ${info.fullVersion}`,
      description: `Unable to assess update status for ${info.name}.`,
      recommendation: "Ensure your browser is kept up-to-date.",
      weight: 12,
    };
  }

  let status: CheckStatus;
  let description: string;

  if (info.version >= t.latest) {
    status = "secure";
    description = `${info.name} ${info.fullVersion} is up-to-date.`;
  } else if (info.version >= t.warning) {
    status = "warning";
    description = `${info.name} ${info.fullVersion} is slightly outdated.`;
  } else {
    status = "at-risk";
    description = `${info.name} ${info.fullVersion} is significantly outdated and may have known vulnerabilities.`;
  }

  return {
    id: "outdated-browser",
    category: "Browser",
    name: "Outdated Browser Detection",
    status,
    value: `${info.name} ${info.fullVersion}`,
    description,
    recommendation:
      status !== "secure"
        ? `Update ${info.name} to the latest version for security patches and new features.`
        : undefined,
    weight: 12,
  };
}

function checkCookieSecurity(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "cookie-security",
      category: "Privacy",
      name: "Cookie Security",
      status: "warning",
      value: "Unknown (SSR)",
      description: "Cannot check cookies during server-side rendering.",
      weight: 5,
    };
  }

  const enabled = navigator.cookieEnabled;
  return {
    id: "cookie-security",
    category: "Privacy",
    name: "Cookie Security",
    status: enabled ? "warning" : "secure",
    value: enabled ? "Enabled" : "Disabled",
    description: enabled
      ? "Cookies are enabled. HttpOnly and Secure flags cannot be verified client-side."
      : "Cookies are disabled. Some sites may not work correctly.",
    recommendation:
      "Ensure cookies use HttpOnly, Secure, and SameSite attributes. Consider blocking third-party cookies.",
    weight: 5,
  };
}

function checkDoNotTrack(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "do-not-track",
      category: "Privacy",
      name: "Do Not Track",
      status: "warning",
      value: "Unknown (SSR)",
      description: "Cannot check DNT during server-side rendering.",
      weight: 4,
    };
  }

  const dnt = navigator.doNotTrack;
  const isEnabled = dnt === "1";

  return {
    id: "do-not-track",
    category: "Privacy",
    name: "Do Not Track",
    status: isEnabled ? "secure" : "warning",
    value: isEnabled ? "Enabled" : "Not set",
    description: isEnabled
      ? "Do Not Track is enabled, signaling your tracking preference to websites."
      : "Do Not Track is not set. Websites may track your activity.",
    recommendation: isEnabled
      ? undefined
      : "Enable Do Not Track in your browser settings, though note not all sites honor it.",
    weight: 4,
  };
}

function checkGlobalPrivacyControl(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "global-privacy-control",
      category: "Privacy",
      name: "Global Privacy Control",
      status: "warning",
      value: "Unknown (SSR)",
      description: "Cannot check GPC during server-side rendering.",
      weight: 5,
    };
  }

  // globalPrivacyControl is not yet in the standard TS Navigator type
  const gpc = (navigator as unknown as Record<string, unknown>).globalPrivacyControl;
  const isEnabled = gpc === true || gpc === "1";

  return {
    id: "global-privacy-control",
    category: "Privacy",
    name: "Global Privacy Control",
    status: isEnabled ? "secure" : "warning",
    value: isEnabled ? "Enabled" : "Not set",
    description: isEnabled
      ? "Global Privacy Control is enabled. Sites are legally required to honor this in some jurisdictions."
      : "Global Privacy Control is not set. Consider enabling it for stronger privacy.",
    recommendation: isEnabled
      ? undefined
      : "Enable Global Privacy Control in your browser or install a supporting extension.",
    weight: 5,
  };
}

function checkWebRTCLeak(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "webrtc-leak",
      category: "Privacy",
      name: "WebRTC Leak Risk",
      status: "warning",
      value: "Unknown (SSR)",
      description: "Cannot check WebRTC during server-side rendering.",
      weight: 6,
    };
  }

  const hasWebRTC =
    typeof RTCPeerConnection !== "undefined" ||
    typeof (window as unknown as Record<string, unknown>).webkitRTCPeerConnection !==
      "undefined";

  return {
    id: "webrtc-leak",
    category: "Privacy",
    name: "WebRTC Leak Risk",
    status: hasWebRTC ? "warning" : "secure",
    value: hasWebRTC ? "Available (potential leak)" : "Not available",
    description: hasWebRTC
      ? "WebRTC is available and could potentially leak your real IP address even through a VPN."
      : "WebRTC is not available, reducing IP leak risk.",
    recommendation: hasWebRTC
      ? "Consider disabling WebRTC or using a browser extension to prevent leaks. Use a VPN that protects against WebRTC leaks."
      : undefined,
    weight: 6,
  };
}

function checkJavaScriptEnabled(): SecurityCheck {
  return {
    id: "javascript-enabled",
    category: "Browser",
    name: "JavaScript Enabled",
    status: "secure",
    value: "Enabled",
    description:
      "JavaScript is enabled (this audit itself runs via JavaScript).",
    weight: 1,
  };
}

function checkLocalStorage(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "localstorage",
      category: "Storage",
      name: "localStorage Available",
      status: "warning",
      value: "Unknown (SSR)",
      description: "Cannot check localStorage during server-side rendering.",
      weight: 3,
    };
  }

  let available = false;
  try {
    const key = "__cyw_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    available = true;
  } catch {
    available = false;
  }

  return {
    id: "localstorage",
    category: "Storage",
    name: "localStorage Available",
    status: available ? "secure" : "warning",
    value: available ? "Available" : "Blocked / Unavailable",
    description: available
      ? "localStorage is available. Sites can store data locally in your browser."
      : "localStorage is blocked or unavailable. Some sites may not function correctly.",
    recommendation:
      "Be mindful that sites can store tracking data in localStorage. Clear it periodically.",
    weight: 3,
  };
}

function checkServiceWorkers(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "service-workers",
      category: "Browser",
      name: "Service Workers",
      status: "warning",
      value: "Unknown (SSR)",
      description:
        "Cannot check Service Worker support during server-side rendering.",
      weight: 2,
    };
  }

  const supported = "serviceWorker" in navigator;

  return {
    id: "service-workers",
    category: "Browser",
    name: "Service Workers",
    status: supported ? "secure" : "warning",
    value: supported ? "Supported" : "Not supported",
    description: supported
      ? "Service Workers are supported, enabling offline functionality and push notifications."
      : "Service Workers are not supported. Some progressive web-app features will not work.",
    weight: 2,
  };
}

function checkMixedContent(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "mixed-content",
      category: "Connection",
      name: "Mixed Content Risk",
      status: "warning",
      value: "Unknown (SSR)",
      description:
        "Cannot check mixed content risk during server-side rendering.",
      weight: 8,
    };
  }

  const isHTTPS = location.protocol === "https:";

  return {
    id: "mixed-content",
    category: "Connection",
    name: "Mixed Content Risk",
    status: isHTTPS ? "secure" : "at-risk",
    value: isHTTPS ? "Low risk (HTTPS)" : "High risk (HTTP)",
    description: isHTTPS
      ? "Page is served over HTTPS, so the browser will block most mixed content automatically."
      : "Page is served over HTTP. All resources are transmitted unencrypted and are vulnerable to interception.",
    recommendation: isHTTPS
      ? undefined
      : "Migrate to HTTPS to protect against mixed-content attacks.",
    weight: 8,
  };
}

async function checkPermissions(): Promise<SecurityCheck> {
  if (!isBrowser() || !navigator.permissions?.query) {
    return {
      id: "permissions",
      category: "Privacy",
      name: "Permission Status",
      status: "warning",
      value: "Permissions API not available",
      description: "The Permissions API is not supported in this browser.",
      weight: 5,
    };
  }

  const permissionNames: PermissionName[] = [
    "camera" as PermissionName,
    "microphone" as PermissionName,
    "geolocation" as PermissionName,
    "notifications" as PermissionName,
  ];

  const results: string[] = [];
  let grantedCount = 0;

  for (const name of permissionNames) {
    try {
      const result = await navigator.permissions.query({ name });
      results.push(`${name}: ${result.state}`);
      if (result.state === "granted") grantedCount++;
    } catch {
      results.push(`${name}: unsupported`);
    }
  }

  const value = results.join(", ");
  let status: CheckStatus = "secure";
  if (grantedCount >= 3) status = "at-risk";
  else if (grantedCount >= 1) status = "warning";

  return {
    id: "permissions",
    category: "Privacy",
    name: "Permission Status",
    status,
    value,
    description:
      grantedCount === 0
        ? "No sensitive permissions are currently granted."
        : `${grantedCount} sensitive permission(s) granted. Review which sites have access.`,
    recommendation:
      grantedCount > 0
        ? "Review and revoke unnecessary permissions in your browser settings."
        : undefined,
    weight: 5,
  };
}

function checkFingerprintResistance(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "fingerprint-resistance",
      category: "Privacy",
      name: "Fingerprint Resistance",
      status: "warning",
      value: "Unknown (SSR)",
      description:
        "Cannot assess fingerprinting risk during server-side rendering.",
      weight: 8,
    };
  }

  let exposurePoints = 0;
  const details: string[] = [];

  // Canvas fingerprinting
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      exposurePoints++;
      details.push("Canvas: exposed");
    } else {
      details.push("Canvas: blocked");
    }
  } catch {
    details.push("Canvas: blocked");
  }

  // WebGL renderer info
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        exposurePoints++;
        details.push(`WebGL renderer: ${renderer}`);
      } else {
        details.push("WebGL renderer: hidden");
      }
    } else {
      details.push("WebGL: not available");
    }
  } catch {
    details.push("WebGL: blocked");
  }

  // AudioContext
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as Record<string, unknown>).webkitAudioContext;
    if (AudioCtx) {
      exposurePoints++;
      details.push("AudioContext: available");
    } else {
      details.push("AudioContext: not available");
    }
  } catch {
    details.push("AudioContext: blocked");
  }

  let status: CheckStatus;
  if (exposurePoints === 0) status = "secure";
  else if (exposurePoints <= 1) status = "warning";
  else status = "at-risk";

  return {
    id: "fingerprint-resistance",
    category: "Privacy",
    name: "Fingerprint Resistance",
    status,
    value: `${exposurePoints}/3 vectors exposed`,
    description: `Browser fingerprinting exposure: ${details.join("; ")}.`,
    recommendation:
      exposurePoints > 0
        ? "Use a privacy-focused browser or extensions that block canvas, WebGL, and AudioContext fingerprinting."
        : undefined,
    weight: 8,
  };
}

function checkThirdPartyCookies(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "third-party-cookies",
      category: "Privacy",
      name: "Third-party Cookies",
      status: "warning",
      value: "Unknown (SSR)",
      description:
        "Cannot check third-party cookie status during server-side rendering.",
      weight: 5,
    };
  }

  // We cannot definitively test third-party cookie blocking from a first-party
  // context, but we can report cookie access and advise.
  let cookieAccess = false;
  try {
    const testKey = "__cyw_3p_test__";
    document.cookie = `${testKey}=1;SameSite=None;Secure`;
    cookieAccess = document.cookie.includes(testKey);
    // Clean up
    document.cookie = `${testKey}=;expires=${new Date(0).toUTCString()};SameSite=None;Secure`;
  } catch {
    cookieAccess = false;
  }

  return {
    id: "third-party-cookies",
    category: "Privacy",
    name: "Third-party Cookies",
    status: cookieAccess ? "warning" : "secure",
    value: cookieAccess
      ? "Cookies writable (third-party may be allowed)"
      : "Cookies restricted",
    description: cookieAccess
      ? "Cookies can be set. Third-party cookies may still be allowed by your browser."
      : "Cookie access appears restricted, which may indicate third-party cookies are blocked.",
    recommendation:
      "Block third-party cookies in your browser settings for better privacy.",
    weight: 5,
  };
}

function checkScreenResolution(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "screen-resolution",
      category: "Privacy",
      name: "Screen Resolution Tracking",
      status: "warning",
      value: "Unknown (SSR)",
      description:
        "Cannot check screen info during server-side rendering.",
      weight: 3,
    };
  }

  const width = screen.width;
  const height = screen.height;
  const pixelRatio = window.devicePixelRatio ?? 1;
  const value = `${width}×${height} @ ${pixelRatio}x`;

  // Unusual / very specific resolutions contribute more to fingerprinting
  const isCommon =
    (width === 1920 && height === 1080) ||
    (width === 1366 && height === 768) ||
    (width === 1536 && height === 864) ||
    (width === 1440 && height === 900) ||
    (width === 2560 && height === 1440) ||
    (width === 3840 && height === 2160);

  return {
    id: "screen-resolution",
    category: "Privacy",
    name: "Screen Resolution Tracking",
    status: isCommon ? "warning" : "at-risk",
    value,
    description: isCommon
      ? `Your screen resolution (${value}) is common, providing some anonymity.`
      : `Your screen resolution (${value}) is relatively unique and can aid fingerprinting.`,
    recommendation:
      "Consider using a privacy browser that spoofs screen resolution, or resize your window to a common size.",
    weight: 3,
  };
}

function checkContentSecurityPolicy(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "content-security-policy",
      category: "Connection",
      name: "Content Security Policy",
      status: "warning",
      value: "Unknown (SSR)",
      description:
        "Cannot check CSP during server-side rendering.",
      weight: 7,
    };
  }

  // Check for CSP meta tag in the document
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const hasCSP = !!cspMeta;

  return {
    id: "content-security-policy",
    category: "Connection",
    name: "Content Security Policy",
    status: hasCSP ? "secure" : "warning",
    value: hasCSP ? "Present (meta tag)" : "Not detected",
    description: hasCSP
      ? "A Content Security Policy is set, which helps prevent XSS and data injection attacks."
      : "No Content Security Policy meta tag detected. CSP may still be set via HTTP headers (not detectable client-side).",
    recommendation: hasCSP
      ? undefined
      : "Implement a strict Content Security Policy to mitigate XSS and injection attacks.",
    weight: 7,
  };
}

function checkReferrerPolicy(): SecurityCheck {
  if (!isBrowser()) {
    return {
      id: "referrer-policy",
      category: "Privacy",
      name: "Referrer Policy",
      status: "warning",
      value: "Unknown (SSR)",
      description:
        "Cannot check Referrer Policy during server-side rendering.",
      weight: 4,
    };
  }

  const rpMeta = document.querySelector('meta[name="referrer"]');
  const hasRP = !!rpMeta;
  const rpValue = rpMeta?.getAttribute("content") ?? "";
  const isStrict = ["no-referrer", "same-origin", "strict-origin", "strict-origin-when-cross-origin"].includes(rpValue.toLowerCase());

  if (!hasRP) {
    return {
      id: "referrer-policy",
      category: "Privacy",
      name: "Referrer Policy",
      status: "warning",
      value: "Not detected (meta tag)",
      description: "No Referrer Policy meta tag detected. The browser default may leak referrer information to third parties.",
      recommendation: "Set a strict Referrer Policy (e.g., strict-origin-when-cross-origin) to limit data leakage.",
      weight: 4,
    };
  }

  return {
    id: "referrer-policy",
    category: "Privacy",
    name: "Referrer Policy",
    status: isStrict ? "secure" : "warning",
    value: rpValue || "Set but empty",
    description: isStrict
      ? `Referrer Policy is set to "${rpValue}", which limits referrer information leakage.`
      : `Referrer Policy is set to "${rpValue}", which may still leak referrer data.`,
    recommendation: isStrict
      ? undefined
      : 'Consider using a stricter policy like "strict-origin-when-cross-origin" or "no-referrer".',
    weight: 4,
  };
}

// ---- scoring ---------------------------------------------------------------

function calculateScore(checks: SecurityCheck[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const check of checks) {
    totalWeight += check.weight;
    switch (check.status) {
      case "secure":
        weightedSum += check.weight * 1;
        break;
      case "warning":
        weightedSum += check.weight * 0.5;
        break;
      case "at-risk":
        weightedSum += check.weight * 0;
        break;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100);
}

// ---- public API ------------------------------------------------------------

export async function runBrowserSecurityAudit(): Promise<BrowserSecurityResult> {
  // Run synchronous checks
  const syncChecks: SecurityCheck[] = [
    checkBrowserDetection(),
    checkHTTPS(),
    checkOutdatedBrowser(),
    checkCookieSecurity(),
    checkDoNotTrack(),
    checkGlobalPrivacyControl(),
    checkWebRTCLeak(),
    checkJavaScriptEnabled(),
    checkLocalStorage(),
    checkServiceWorkers(),
    checkMixedContent(),
    checkFingerprintResistance(),
    checkThirdPartyCookies(),
    checkScreenResolution(),
    checkContentSecurityPolicy(),
    checkReferrerPolicy(),
  ];

  // Run async checks
  const permissionCheck = await checkPermissions();

  const checks = [...syncChecks, permissionCheck];
  const score = calculateScore(checks);

  return {
    checks,
    score,
    timestamp: new Date(),
  };
}
