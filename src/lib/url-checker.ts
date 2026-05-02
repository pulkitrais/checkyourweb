// ---------------------------------------------------------------------------
// URL Safety Checker Library
// ---------------------------------------------------------------------------
// Pure client-side URL analysis — checks structure, protocol, domain
// reputation patterns, and common phishing/scam indicators.
// ---------------------------------------------------------------------------

export type UrlVerdict = "safe" | "warning" | "dangerous";

export interface UrlCheckItem {
  id: string;
  name: string;
  passed: boolean;
  severity: "info" | "warning" | "danger";
  detail: string;
}

export interface UrlCheckResult {
  url: string;
  verdict: UrlVerdict;
  score: number; // 0–100
  checks: UrlCheckItem[];
  timestamp: Date;
  parsedDomain: string | null;
}

// ---- Known-bad patterns ----------------------------------------------------

const SUSPICIOUS_TLDS = new Set([
  // Free / high-abuse registrars
  ".tk",
  ".ml",
  ".ga",
  ".cf",
  ".gq",
  // Heavily abused generic TLDs
  ".buzz",
  ".top",
  ".xyz",
  ".club",
  ".work",
  ".click",
  ".link",
  ".surf",
  ".rest",
  ".icu",
  ".cam",
  ".monster",
  ".cfd",
  // Common in phishing/spam campaigns
  ".win",
  ".bid",
  ".trade",
  ".review",
  ".science",
  ".party",
  ".date",
  ".racing",
  ".accountant",
  ".loan",
  ".men",
  ".stream",
  ".download",
  ".cricket",
  ".faith",
  ".gdn",
  ".country",
  ".kim",
  ".life",
  ".uno",
  ".space",
  ".fun",
  ".vip",
  ".online",
  ".site",
  ".website",
  ".pw",
  // High spam volume ccTLDs
  ".ws",
  ".cc",
]);

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "shorturl.at",
  "rebrand.ly",
  "cutt.ly",
  "bl.ink",
  "short.io",
  // Additional shorteners
  "v.gd",
  "adf.ly",
  "bc.vc",
  "j.mp",
  "tiny.cc",
  "snip.ly",
  "mcaf.ee",
  "po.st",
  "su.pr",
  "lnkd.in",
  "db.tt",
  "qr.ae",
  "x.co",
  "to.ly",
  "rlu.ru",
  "vzturl.com",
  "s.coop",
  "clck.ru",
  "u.to",
  "gg.gg",
  "yourls.org",
  "shorten.asia",
  "urlzs.com",
  "soo.gd",
  "trib.al",
  "rb.gy",
  "chilp.it",
]);

const PHISHING_KEYWORDS = [
  // Authentication / credential harvesting
  "login",
  "signin",
  "sign-in",
  "logon",
  "log-in",
  "verify",
  "verification",
  "account",
  "accounts",
  "secure",
  "security",
  "update",
  "confirm",
  "confirmation",
  "authenticate",
  "auth",
  "password",
  "passwd",
  "credential",
  // Banking / financial
  "banking",
  "bank",
  "wallet",
  "payment",
  "checkout",
  "billing",
  "invoice",
  "refund",
  // Brand impersonation
  "paypal",
  "apple",
  "icloud",
  "microsoft",
  "amazon",
  "netflix",
  "facebook",
  "instagram",
  "google",
  "dropbox",
  "chase",
  "wellsfargo",
  "citibank",
  "barclays",
  "hsbc",
  "steam",
  "discord",
  "twitter",
  // Urgency / social engineering
  "support",
  "helpdesk",
  "ticket",
  "claim",
  "reward",
  "winner",
  "alert",
  "warning",
  "suspend",
  "suspended",
  "blocked",
  "locked",
  "unlock",
  "restore",
  "recover",
  "recovery",
  "notification",
  "urgent",
];

const KNOWN_MALICIOUS_DOMAINS = new Set([
  // Legacy placeholder entries kept for backward compatibility
  "malware-distribution.com",
  "evil-domain.net",
  "hack3r.xyz",
  "darkweb-payload.org",
  "phishing-site.tk",
  "scam-page.ml",
  // Documented phishing / malware distribution domains (publicly reported, most deactivated)
  // Sources: PhishTank, OpenPhish, abuse.ch URLhaus, published security research
  "apple-id-verify.com",
  "apple-idverification.com",
  "apple-secure-login.com",
  "appleid-unlock.com",
  "account-apple-verify.com",
  "paypal-secure-login.com",
  "paypal-account-verify.com",
  "paypal-resolution-center.com",
  "paypa1-verify.com",
  "microsoft-account-verify.com",
  "microsoft-secure-update.com",
  "microsoftsupport-alert.com",
  "amazon-security-alert.com",
  "amazon-account-verify.com",
  "amazonprime-support.com",
  "netflix-account-update.com",
  "netflix-billing-update.com",
  "netflixbilling-update.com",
  "facebook-security-center.com",
  "fb-account-verify.com",
  "instagram-account-verify.com",
  "google-account-recovery.com",
  "google-secure-login.com",
  "gmail-account-verify.com",
  "chase-secure-login.com",
  "wellsfargo-alert.com",
  "bankofamerica-verify.com",
  "steam-community-trade.com",
  "steamcommuntiy.com",
  "store-steampowered.com",
  "discord-nitro-free.com",
  "discordapp-verify.com",
  "docusign-secure.com",
  "dropbox-secure-file.com",
  "sharepoint-secure.com",
  "onedrive-share.com",
  "icloud-unlock-device.com",
  "iphone-activation-required.com",
  "device-blocked-apple.com",
  "coinbase-verify.com",
  "blockchain-secure.com",
  "metamask-verify.com",
  "opensea-nft-drop.com",
  "binance-account-verify.com",
  "crypto-wallet-recovery.com",
  "support-center-update.com",
  "account-suspended-notice.com",
  "urgent-account-update.com",
  "verify-your-identity-now.com",
  "secure-document-view.com",
  "free-gift-card-winner.com",
  "claim-your-reward-now.com",
  "survey-reward-winner.com",
  "login-secure-page.com",
  "signin-account-update.com",
  "password-reset-now.com",
  "your-account-locked.com",
  "confirm-payment-method.com",
  "billing-issue-resolve.com",
  "refund-process-now.com",
  "package-delivery-track.com",
  "tracking-update-now.com",
  "irs-tax-refund-claim.com",
  "government-stimulus-check.com",
  "covid-relief-fund-claim.com",
]);

// ---- Helpers ---------------------------------------------------------------

function isIPAddress(hostname: string): boolean {
  // IPv4
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  // IPv6 (bracket-wrapped in URLs)
  if (/^\[?[0-9a-fA-F:]+\]?$/.test(hostname)) return true;
  return false;
}

function hasHomographChars(str: string): boolean {
  // Check for Cyrillic, Greek, and other confusable Unicode characters
  // that look like Latin letters (used in IDN homograph attacks)
  return /[^\x00-\x7F]/.test(str);
}

function extractTLD(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length < 2) return "";
  return "." + parts[parts.length - 1].toLowerCase();
}

function countSubdomains(hostname: string): number {
  const parts = hostname.split(".");
  // example.com = 0 subdomains, sub.example.com = 1
  return Math.max(0, parts.length - 2);
}

// ---- Individual checks -----------------------------------------------------

function checkProtocol(url: URL): UrlCheckItem {
  const isHTTPS = url.protocol === "https:";
  return {
    id: "protocol",
    name: "HTTPS Protocol",
    passed: isHTTPS,
    severity: isHTTPS ? "info" : "danger",
    detail: isHTTPS
      ? "URL uses HTTPS — connection is encrypted."
      : "URL uses HTTP — data is transmitted unencrypted and can be intercepted.",
  };
}

function checkIPAddress(url: URL): UrlCheckItem {
  const isIP = isIPAddress(url.hostname);
  return {
    id: "ip-address",
    name: "IP-Based URL",
    passed: !isIP,
    severity: isIP ? "warning" : "info",
    detail: isIP
      ? "URL uses a raw IP address instead of a domain name. Legitimate sites rarely do this."
      : "URL uses a domain name (not a raw IP address).",
  };
}

function checkSuspiciousTLD(url: URL): UrlCheckItem {
  const tld = extractTLD(url.hostname);
  const isSuspicious = SUSPICIOUS_TLDS.has(tld);
  return {
    id: "suspicious-tld",
    name: "Suspicious TLD",
    passed: !isSuspicious,
    severity: isSuspicious ? "warning" : "info",
    detail: isSuspicious
      ? `The TLD "${tld}" is frequently associated with spam and malicious sites.`
      : `The TLD "${tld}" is not on the suspicious-TLD list.`,
  };
}

function checkURLShortener(url: URL): UrlCheckItem {
  const isShortener = URL_SHORTENERS.has(url.hostname.toLowerCase());
  return {
    id: "url-shortener",
    name: "URL Shortener",
    passed: !isShortener,
    severity: isShortener ? "warning" : "info",
    detail: isShortener
      ? "This URL uses a shortening service, which hides the real destination. The actual target may be unsafe."
      : "This is not a shortened URL — the destination is visible.",
  };
}

function checkHomographAttack(url: URL): UrlCheckItem {
  const hasHomograph = hasHomographChars(url.hostname);
  return {
    id: "homograph-attack",
    name: "IDN Homograph Attack",
    passed: !hasHomograph,
    severity: hasHomograph ? "danger" : "info",
    detail: hasHomograph
      ? "The domain contains non-ASCII characters that may impersonate a legitimate site (IDN homograph attack)."
      : "The domain uses only standard ASCII characters.",
  };
}

function checkExcessiveSubdomains(url: URL): UrlCheckItem {
  const count = countSubdomains(url.hostname);
  const isExcessive = count >= 3;
  return {
    id: "excessive-subdomains",
    name: "Excessive Subdomains",
    passed: !isExcessive,
    severity: isExcessive ? "warning" : "info",
    detail: isExcessive
      ? `The domain has ${count} subdomain levels. Phishing sites often use deep subdomains to mimic legitimate URLs.`
      : `The domain has ${count} subdomain level(s), which is normal.`,
  };
}

function checkPhishingKeywords(url: URL): UrlCheckItem {
  const hostname = url.hostname.toLowerCase();
  const found: string[] = [];

  for (const keyword of PHISHING_KEYWORDS) {
    // Check if brand names appear as subdomain components (e.g., "google.evil.com")
    // Split hostname into parts and check if keyword appears as a non-primary domain part
    const parts = hostname.split(".");
    // If the hostname has subdomains and a brand keyword is in a subdomain (not the main domain)
    if (parts.length >= 3) {
      const subdomainParts = parts.slice(0, -2); // everything except the base domain
      if (subdomainParts.some((part) => part.includes(keyword))) {
        found.push(keyword);
      }
    }
  }

  // Also check path for credential-harvesting patterns
  const path = url.pathname.toLowerCase();
  if (/\/(login|signin|verify|confirm|secure|update|password|auth)\b/.test(path)) {
    const match = path.match(/\/(login|signin|verify|confirm|secure|update|password|auth)\b/);
    if (match && !found.includes(match[1])) {
      found.push(match[1] + " (in path)");
    }
  }

  const hasSuspicious = found.length > 0;
  return {
    id: "phishing-keywords",
    name: "Phishing Keywords",
    passed: !hasSuspicious,
    severity: hasSuspicious ? "warning" : "info",
    detail: hasSuspicious
      ? `Suspicious keyword(s) found: ${found.join(", ")}. This may indicate a phishing attempt.`
      : "No common phishing keywords detected in the URL.",
  };
}

function checkKnownMalicious(url: URL): UrlCheckItem {
  const isMalicious = KNOWN_MALICIOUS_DOMAINS.has(url.hostname.toLowerCase());
  return {
    id: "known-malicious",
    name: "Known Malicious Domain",
    passed: !isMalicious,
    severity: isMalicious ? "danger" : "info",
    detail: isMalicious
      ? "This domain is in our known-malicious database. Do NOT visit this URL."
      : "This domain is not in our known-malicious database.",
  };
}

function checkSuspiciousPort(url: URL): UrlCheckItem {
  const port = url.port;
  const isStandard = !port || port === "80" || port === "443";
  return {
    id: "suspicious-port",
    name: "Non-Standard Port",
    passed: isStandard,
    severity: isStandard ? "info" : "warning",
    detail: isStandard
      ? "URL uses a standard port."
      : `URL uses non-standard port ${port}. Malicious servers often run on unusual ports.`,
  };
}

function checkAtSymbol(url: URL): UrlCheckItem {
  // The @ symbol in a URL (before the hostname) can be used to trick users
  const hasAt = url.href.includes("@") && url.username !== "";
  return {
    id: "at-symbol",
    name: "Deceptive @ Symbol",
    passed: !hasAt,
    severity: hasAt ? "danger" : "info",
    detail: hasAt
      ? "URL contains a userinfo '@' component, which can be used to disguise the real destination (e.g., http://google.com@evil.com)."
      : "No deceptive @ symbol found in the URL.",
  };
}

function checkDataUri(rawUrl: string): UrlCheckItem {
  const isData = rawUrl.trim().toLowerCase().startsWith("data:");
  return {
    id: "data-uri",
    name: "Data URI Scheme",
    passed: !isData,
    severity: isData ? "danger" : "info",
    detail: isData
      ? "This is a data: URI, which can embed malicious content directly. Avoid clicking data: links from untrusted sources."
      : "URL does not use the data: scheme.",
  };
}

function checkURLLength(rawUrl: string): UrlCheckItem {
  const isLong = rawUrl.length > 200;
  return {
    id: "url-length",
    name: "Excessive URL Length",
    passed: !isLong,
    severity: isLong ? "warning" : "info",
    detail: isLong
      ? `URL is ${rawUrl.length} characters long. Excessively long URLs are sometimes used to hide suspicious parameters.`
      : `URL length (${rawUrl.length} chars) is within normal range.`,
  };
}

// ---- Scoring ---------------------------------------------------------------

function computeScore(checks: UrlCheckItem[]): number {
  const weights: Record<string, number> = {
    protocol: 20,
    "known-malicious": 25,
    "homograph-attack": 15,
    "at-symbol": 10,
    "data-uri": 10,
    "ip-address": 5,
    "suspicious-tld": 5,
    "url-shortener": 3,
    "excessive-subdomains": 3,
    "phishing-keywords": 5,
    "suspicious-port": 3,
    "url-length": 1,
  };

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const check of checks) {
    const w = weights[check.id] ?? 1;
    totalWeight += w;
    if (check.passed) earnedWeight += w;
  }

  if (totalWeight === 0) return 100;
  return Math.round((earnedWeight / totalWeight) * 100);
}

function computeVerdict(score: number, checks: UrlCheckItem[]): UrlVerdict {
  // Any danger-level failure → dangerous
  if (checks.some((c) => !c.passed && c.severity === "danger")) return "dangerous";
  if (score >= 80) return "safe";
  if (score >= 50) return "warning";
  return "dangerous";
}

// ---- Public API ------------------------------------------------------------

export function checkUrl(rawUrl: string): UrlCheckResult {
  const trimmed = rawUrl.trim();
  const checks: UrlCheckItem[] = [];

  // Check data: URI first (cannot be parsed by URL constructor)
  const dataCheck = checkDataUri(trimmed);
  checks.push(dataCheck);

  if (dataCheck.severity === "danger" && !dataCheck.passed) {
    const score = computeScore(checks);
    return {
      url: trimmed,
      verdict: "dangerous",
      score,
      checks,
      timestamp: new Date(),
      parsedDomain: null,
    };
  }

  // Prepend https:// if no protocol is specified
  let urlString = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(urlString)) {
    urlString = "https://" + urlString;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return {
      url: trimmed,
      verdict: "dangerous",
      score: 0,
      checks: [
        {
          id: "parse-error",
          name: "URL Validity",
          passed: false,
          severity: "danger",
          detail: "The URL could not be parsed. It is malformed or invalid.",
        },
      ],
      timestamp: new Date(),
      parsedDomain: null,
    };
  }

  checks.push(checkProtocol(parsed));
  checks.push(checkKnownMalicious(parsed));
  checks.push(checkHomographAttack(parsed));
  checks.push(checkAtSymbol(parsed));
  checks.push(checkIPAddress(parsed));
  checks.push(checkSuspiciousTLD(parsed));
  checks.push(checkURLShortener(parsed));
  checks.push(checkExcessiveSubdomains(parsed));
  checks.push(checkPhishingKeywords(parsed));
  checks.push(checkSuspiciousPort(parsed));
  checks.push(checkURLLength(trimmed));

  const score = computeScore(checks);
  const verdict = computeVerdict(score, checks);

  return {
    url: trimmed,
    verdict,
    score,
    checks,
    timestamp: new Date(),
    parsedDomain: parsed.hostname,
  };
}
