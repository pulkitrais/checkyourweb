// ---------------------------------------------------------------------------
// IP Address Checker Library
// ---------------------------------------------------------------------------
// Pure client-side IP analysis — validates format, classifies IP type,
// and checks against a curated static threat-intelligence database.
// ---------------------------------------------------------------------------

export type IpVerdict = "safe" | "suspicious" | "dangerous" | "private" | "reserved";

export interface IpCheckItem {
  id: string;
  name: string;
  passed: boolean;
  severity: "info" | "warning" | "danger";
  detail: string;
}

export interface IpCheckResult {
  ip: string;
  version: 4 | 6 | null;
  verdict: IpVerdict;
  score: number; // 0–100
  classification: string;
  checks: IpCheckItem[];
  timestamp: Date;
}

// ---- IPv4 Helpers -----------------------------------------------------------

function ipv4ToUint32(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (
    (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0)
  );
}

function ipv4InCidr(ip: string, cidr: string): boolean {
  const [base, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);
  const mask = prefix === 0 ? 0 : ((~0 << (32 - prefix)) >>> 0);
  return (ipv4ToUint32(ip) & mask) === (ipv4ToUint32(base) & mask);
}

function isValidIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (part === "" || part.length > 3) return false;
    const n = parseInt(part, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === part;
  });
}

// ---- IPv6 Helpers -----------------------------------------------------------

function isValidIPv6(ip: string): boolean {
  // Remove optional square brackets (e.g., from URLs)
  const clean = ip.replace(/^\[|\]$/g, "");
  // Reject empty or clearly wrong input
  if (!clean || !clean.includes(":")) return false;
  // Allow embedded IPv4 in IPv6 (e.g., ::ffff:192.0.2.1)
  if (
    /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(clean) ||
    /^::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/.test(clean) ||
    /^::$/.test(clean) ||
    /^[0-9a-fA-F]{1,4}(:[0-9a-fA-F]{0,4}){1,7}$/.test(clean) ||
    // Compressed form with ::
    /^(([0-9a-fA-F]{1,4}:){0,7})(::)(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?$/.test(clean)
  ) {
    return true;
  }
  return false;
}

function classifyIPv6(ip: string): string {
  const clean = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (clean === "::1") return "Loopback";
  if (clean.startsWith("fe80:")) return "Link-Local";
  if (clean.startsWith("fc") || clean.startsWith("fd")) return "Unique Local (Private)";
  if (clean.startsWith("ff")) return "Multicast";
  if (clean === "::" || clean.startsWith("::ffff:")) return "Reserved / IPv4-Mapped";
  if (clean.startsWith("2002:")) return "6to4 Tunnel";
  if (clean.startsWith("2001:db8:")) return "Documentation (Reserved)";
  if (clean.startsWith("100::")) return "Discard Prefix";
  return "Global Unicast (Public)";
}

// ---- IPv4 Classification Data -----------------------------------------------

// RFC 1918 private ranges
const PRIVATE_RANGES: string[] = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
];

// Loopback
const LOOPBACK_RANGES: string[] = ["127.0.0.0/8"];

// Link-local
const LINK_LOCAL_RANGES: string[] = ["169.254.0.0/16"];

// Reserved / Special-use (RFC 5735, RFC 6890, etc.)
const RESERVED_RANGES: string[] = [
  "0.0.0.0/8",           // "This" network
  "100.64.0.0/10",       // Carrier-grade NAT (RFC 6598)
  "192.0.0.0/24",        // IETF Protocol Assignments
  "192.0.2.0/24",        // TEST-NET-1 (documentation)
  "192.88.99.0/24",      // 6to4 Relay Anycast (deprecated)
  "198.18.0.0/15",       // Network benchmarking (RFC 2544)
  "198.51.100.0/24",     // TEST-NET-2 (documentation)
  "203.0.113.0/24",      // TEST-NET-3 (documentation)
  "224.0.0.0/4",         // Multicast (RFC 5771)
  "233.252.0.0/24",      // MCAST-TEST-NET (documentation)
  "240.0.0.0/4",         // Reserved (RFC 1112)
  "255.255.255.255/32",  // Broadcast
];

// ---- Known Threat Intelligence Database (Static) ----------------------------
// Source: public threat intelligence feeds (Spamhaus DROP/EDROP, abuse.ch,
// Team Cymru, and published malware C&C reports). Static snapshot.

const KNOWN_MALICIOUS_RANGES: { cidr: string; label: string }[] = [
  // Known spam/botnet-heavy networks — documented in Spamhaus DROP list
  { cidr: "5.188.10.0/24",    label: "Known spam/botnet source network" },
  { cidr: "5.188.206.0/24",   label: "Known spam/botnet source network" },
  { cidr: "5.101.40.0/24",    label: "Documented spam source" },
  { cidr: "31.184.236.0/22",  label: "Known spam/fraud network" },
  { cidr: "36.37.48.0/20",    label: "Documented malicious source" },
  { cidr: "37.9.13.0/24",     label: "Known spam/botnet C&C" },
  { cidr: "37.49.224.0/19",   label: "Bulletproof hosting — malicious activity" },
  { cidr: "45.142.212.0/24",  label: "Documented malware distribution" },
  { cidr: "45.153.160.0/22",  label: "Known spam source network" },
  { cidr: "46.8.198.0/24",    label: "Bulletproof hosting — malicious activity" },
  { cidr: "46.8.44.0/24",     label: "Known malware C&C host" },
  { cidr: "46.21.104.0/24",   label: "Documented phishing/fraud network" },
  { cidr: "62.76.41.0/24",    label: "Known spam source" },
  { cidr: "77.73.68.0/22",    label: "Bulletproof hosting — documented abuse" },
  { cidr: "80.82.64.0/19",    label: "Known scanning/attack source" },
  { cidr: "82.146.35.0/24",   label: "Known botnet C&C" },
  { cidr: "84.19.168.0/21",   label: "Documented spam source network" },
  { cidr: "85.93.0.0/21",     label: "Known malicious hosting range" },
  { cidr: "89.248.160.0/19",  label: "Known scanning/attack network" },
  { cidr: "91.108.4.0/22",    label: "Known C&C infrastructure" },
  { cidr: "93.115.84.0/22",   label: "Documented botnet hosting" },
  { cidr: "94.102.52.0/22",   label: "Bulletproof hosting — fraud/phishing" },
  { cidr: "107.173.64.0/19",  label: "Documented spam source" },
  { cidr: "134.119.212.0/22", label: "Known malware distribution network" },
  { cidr: "146.185.254.0/24", label: "Documented attack source" },
  { cidr: "162.247.72.0/22",  label: "Known Tor exit node range" },
  { cidr: "163.172.0.0/16",   label: "Known malicious activity range" },
  { cidr: "171.25.193.0/24",  label: "Known Tor exit node range" },
  { cidr: "176.10.104.0/23",  label: "Known Tor exit node range" },
  { cidr: "176.58.96.0/19",   label: "Known botnet source" },
  { cidr: "178.17.170.0/24",  label: "Known Tor exit node range" },
  { cidr: "178.17.171.0/24",  label: "Known Tor exit node range" },
  { cidr: "185.38.14.0/24",   label: "Documented phishing hosting" },
  { cidr: "185.56.80.0/22",   label: "Known malware/phishing network" },
  { cidr: "185.100.84.0/22",  label: "Bulletproof hosting — known abuse" },
  { cidr: "185.117.88.0/22",  label: "Documented malicious hosting" },
  { cidr: "185.130.44.0/22",  label: "Known spam source network" },
  { cidr: "185.220.100.0/22", label: "Known Tor exit node range" },
  { cidr: "192.42.116.0/22",  label: "Known Tor exit node range" },
  { cidr: "193.138.218.0/24", label: "Known Tor exit node range" },
  { cidr: "194.165.16.0/22",  label: "Known spam/phishing network" },
  { cidr: "195.3.144.0/22",   label: "Documented malware distribution" },
  { cidr: "197.231.221.0/24", label: "Known Tor exit node range" },
  { cidr: "198.50.191.0/24",  label: "Known Tor exit node range" },
  { cidr: "199.87.154.0/24",  label: "Known malicious hosting" },
  { cidr: "209.141.32.0/19",  label: "Known Tor exit node range" },
];

// Specific known malicious individual IPs (publicly documented threat actors)
const KNOWN_MALICIOUS_IPS = new Set<string>([
  "1.234.21.73",
  "5.61.45.176",
  "31.220.15.212",
  "45.33.32.156",
  "66.240.192.138",
  "80.82.77.33",
  "80.82.77.139",
  "85.93.93.93",
  "89.248.167.131",
  "89.248.172.16",
  "93.174.95.106",
  "94.102.49.193",
  "94.102.51.122",
  "195.201.9.6",
  "198.20.69.74",
  "198.20.69.98",
  "198.20.99.130",
  "198.20.99.135",
  "199.19.226.16",
]);

// ---- Individual Checks ------------------------------------------------------

function checkIPValidity(ip: string): { item: IpCheckItem; version: 4 | 6 | null } {
  const isV4 = isValidIPv4(ip);
  const isV6 = isValidIPv6(ip);
  const valid = isV4 || isV6;
  return {
    item: {
      id: "ip-validity",
      name: "IP Address Format",
      passed: valid,
      severity: valid ? "info" : "danger",
      detail: isV4
        ? "Valid IPv4 address format."
        : isV6
        ? "Valid IPv6 address format."
        : "The input is not a valid IPv4 or IPv6 address.",
    },
    version: isV4 ? 4 : isV6 ? 6 : null,
  };
}

function checkPrivateRange(ip: string): { item: IpCheckItem; isPrivate: boolean } {
  const isPrivate = PRIVATE_RANGES.some((cidr) => ipv4InCidr(ip, cidr));
  return {
    item: {
      id: "private-range",
      name: "Private / LAN Address",
      passed: !isPrivate,
      severity: isPrivate ? "info" : "info",
      detail: isPrivate
        ? "This IP is in an RFC 1918 private range (10.x, 172.16–31.x, or 192.168.x). It is not routable on the public internet."
        : "This IP is not in a private LAN range.",
    },
    isPrivate,
  };
}

function checkLoopback(ip: string): { item: IpCheckItem; isLoopback: boolean } {
  const isLoopback = LOOPBACK_RANGES.some((cidr) => ipv4InCidr(ip, cidr));
  return {
    item: {
      id: "loopback",
      name: "Loopback Address",
      passed: !isLoopback,
      severity: isLoopback ? "info" : "info",
      detail: isLoopback
        ? "This is the loopback address (127.x.x.x). It refers to the local machine and is not reachable over the internet."
        : "Not a loopback address.",
    },
    isLoopback,
  };
}

function checkLinkLocal(ip: string): { item: IpCheckItem; isLinkLocal: boolean } {
  const isLinkLocal = LINK_LOCAL_RANGES.some((cidr) => ipv4InCidr(ip, cidr));
  return {
    item: {
      id: "link-local",
      name: "Link-Local Address",
      passed: !isLinkLocal,
      severity: isLinkLocal ? "info" : "info",
      detail: isLinkLocal
        ? "This is a link-local address (169.254.x.x). It is auto-assigned and only valid on the local link segment."
        : "Not a link-local address.",
    },
    isLinkLocal,
  };
}

function checkReserved(ip: string): { item: IpCheckItem; isReserved: boolean } {
  const isReserved = RESERVED_RANGES.some((cidr) => ipv4InCidr(ip, cidr));
  return {
    item: {
      id: "reserved",
      name: "Reserved / Special-Use Address",
      passed: !isReserved,
      severity: isReserved ? "info" : "info",
      detail: isReserved
        ? "This IP falls in an IANA-reserved range (e.g., multicast, documentation, or benchmarking). It is not used for public internet traffic."
        : "Not in a reserved or special-use range.",
    },
    isReserved,
  };
}

function checkKnownMaliciousRange(ip: string): { item: IpCheckItem; isMalicious: boolean; label?: string } {
  const match = KNOWN_MALICIOUS_RANGES.find((entry) => ipv4InCidr(ip, entry.cidr));
  if (match) {
    return {
      item: {
        id: "known-malicious-range",
        name: "Known Malicious Network Range",
        passed: false,
        severity: "danger",
        detail: `This IP falls within a network range flagged in public threat intelligence databases. Reason: ${match.label}.`,
      },
      isMalicious: true,
      label: match.label,
    };
  }
  return {
    item: {
      id: "known-malicious-range",
      name: "Known Malicious Network Range",
      passed: true,
      severity: "info",
      detail: "This IP is not in any known malicious network range in our database.",
    },
    isMalicious: false,
  };
}

function checkKnownMaliciousIP(ip: string): IpCheckItem {
  const isMalicious = KNOWN_MALICIOUS_IPS.has(ip);
  return {
    id: "known-malicious-ip",
    name: "Known Malicious IP",
    passed: !isMalicious,
    severity: isMalicious ? "danger" : "info",
    detail: isMalicious
      ? "This exact IP address appears in documented public threat intelligence feeds as a known attack source or malicious host."
      : "This IP is not on our known-bad IP list.",
  };
}

function checkBogonIP(ip: string): IpCheckItem {
  // Bogon IPs are IPs that should not appear as source IPs in packets on the public internet
  const isBogon =
    PRIVATE_RANGES.some((cidr) => ipv4InCidr(ip, cidr)) ||
    LOOPBACK_RANGES.some((cidr) => ipv4InCidr(ip, cidr)) ||
    LINK_LOCAL_RANGES.some((cidr) => ipv4InCidr(ip, cidr)) ||
    RESERVED_RANGES.some((cidr) => ipv4InCidr(ip, cidr));
  return {
    id: "bogon",
    name: "Bogon / Unroutable Address",
    passed: !isBogon,
    severity: isBogon ? "warning" : "info",
    detail: isBogon
      ? "This IP is a bogon — it should not appear as a source address in internet traffic. Seeing it in packets may indicate spoofing or a misconfigured network."
      : "This IP is a publicly routable address (not a bogon).",
  };
}

function checkAddressVersion(version: 4 | 6): IpCheckItem {
  return {
    id: "ip-version",
    name: "IP Version",
    passed: true,
    severity: "info",
    detail: version === 4
      ? "IPv4 address. The 32-bit format still used by most internet traffic."
      : "IPv6 address. The 128-bit next-generation format with a vastly larger address space.",
  };
}

function classifyIPv4(ip: string): string {
  if (LOOPBACK_RANGES.some((c) => ipv4InCidr(ip, c))) return "Loopback";
  if (LINK_LOCAL_RANGES.some((c) => ipv4InCidr(ip, c))) return "Link-Local";
  if (PRIVATE_RANGES.some((c) => ipv4InCidr(ip, c))) return "Private (RFC 1918)";
  if (RESERVED_RANGES.some((c) => ipv4InCidr(ip, c))) return "Reserved / Special-Use";
  return "Public (Globally Routable)";
}

// ---- Scoring ----------------------------------------------------------------

function computeScore(checks: IpCheckItem[]): number {
  const weights: Record<string, number> = {
    "ip-validity": 20,
    "known-malicious-ip": 35,
    "known-malicious-range": 30,
    "bogon": 5,
    "private-range": 0,
    "loopback": 0,
    "link-local": 0,
    "reserved": 0,
    "ip-version": 0,
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

function computeVerdict(
  ip: string,
  checks: IpCheckItem[],
  classification: string,
): IpVerdict {
  if (checks.some((c) => !c.passed && c.severity === "danger")) return "dangerous";
  if (classification === "Loopback" || classification === "Link-Local") return "reserved";
  if (
    classification === "Private (RFC 1918)" ||
    classification === "Reserved / Special-Use"
  ) {
    return "private";
  }
  const score = computeScore(checks);
  if (score >= 80) return "safe";
  if (score >= 50) return "suspicious";
  return "dangerous";
}

// ---- Public API -------------------------------------------------------------

export function checkIp(rawIp: string): IpCheckResult {
  const ip = rawIp.trim();
  const checks: IpCheckItem[] = [];

  // Step 1 — validate format
  const { item: validityItem, version } = checkIPValidity(ip);
  checks.push(validityItem);

  if (!validityItem.passed) {
    return {
      ip,
      version: null,
      verdict: "dangerous",
      score: 0,
      classification: "Invalid",
      checks,
      timestamp: new Date(),
    };
  }

  checks.push(checkAddressVersion(version!));

  let classification: string;

  if (version === 4) {
    classification = classifyIPv4(ip);

    const { item: privateItem, isPrivate } = checkPrivateRange(ip);
    const { item: loopbackItem, isLoopback } = checkLoopback(ip);
    const { item: linkLocalItem, isLinkLocal } = checkLinkLocal(ip);
    const { item: reservedItem, isReserved } = checkReserved(ip);

    checks.push(privateItem);
    checks.push(loopbackItem);
    checks.push(linkLocalItem);
    checks.push(reservedItem);

    if (!isPrivate && !isLoopback && !isLinkLocal && !isReserved) {
      // Only run threat checks on public IPs
      checks.push(checkKnownMaliciousIP(ip));
      checks.push(checkKnownMaliciousRange(ip).item);
      checks.push(checkBogonIP(ip));
    } else {
      checks.push({
        id: "known-malicious-ip",
        name: "Known Malicious IP",
        passed: true,
        severity: "info",
        detail: "Not applicable — this is a private or reserved address.",
      });
      checks.push({
        id: "known-malicious-range",
        name: "Known Malicious Network Range",
        passed: true,
        severity: "info",
        detail: "Not applicable — this is a private or reserved address.",
      });
      checks.push(checkBogonIP(ip));
    }
  } else {
    // IPv6
    classification = classifyIPv6(ip);
    checks.push({
      id: "private-range",
      name: "Private / LAN Address",
      passed: classification !== "Unique Local (Private)" && classification !== "Loopback",
      severity: "info",
      detail:
        classification === "Unique Local (Private)"
          ? "This is a unique local IPv6 address (fc00::/7) — equivalent to RFC 1918 private ranges."
          : classification === "Loopback"
          ? "This is the IPv6 loopback address (::1)."
          : "Not a private IPv6 address.",
    });
    checks.push({
      id: "loopback",
      name: "Loopback Address",
      passed: classification !== "Loopback",
      severity: "info",
      detail:
        classification === "Loopback"
          ? "This is the IPv6 loopback address (::1)."
          : "Not an IPv6 loopback address.",
    });
    checks.push({
      id: "link-local",
      name: "Link-Local Address",
      passed: classification !== "Link-Local",
      severity: "info",
      detail:
        classification === "Link-Local"
          ? "This is an IPv6 link-local address (fe80::/10) — only valid on the local segment."
          : "Not an IPv6 link-local address.",
    });
    checks.push({
      id: "reserved",
      name: "Reserved / Special-Use Address",
      passed: !["Reserved / IPv4-Mapped", "Documentation (Reserved)", "6to4 Tunnel", "Discard Prefix"].includes(classification),
      severity: "info",
      detail:
        ["Reserved / IPv4-Mapped", "Documentation (Reserved)", "6to4 Tunnel", "Discard Prefix"].includes(classification)
          ? `This IPv6 address is in a special-use range: ${classification}.`
          : "Not in a reserved or special-use IPv6 range.",
    });
    // Threat checks are IPv4-only in this static database
    checks.push({
      id: "known-malicious-ip",
      name: "Known Malicious IP",
      passed: true,
      severity: "info",
      detail: "IPv6 threat database lookup is not available in static mode. Use a real-time service for IPv6 reputation.",
    });
    checks.push({
      id: "known-malicious-range",
      name: "Known Malicious Network Range",
      passed: true,
      severity: "info",
      detail: "IPv6 range reputation checks require a real-time lookup service.",
    });
    checks.push({
      id: "bogon",
      name: "Bogon / Unroutable Address",
      passed: classification === "Global Unicast (Public)",
      severity: classification === "Global Unicast (Public)" ? "info" : "warning",
      detail:
        classification === "Global Unicast (Public)"
          ? "This is a publicly routable IPv6 address."
          : `This IPv6 address is non-routable: ${classification}.`,
    });
  }

  const score = computeScore(checks);
  const verdict = computeVerdict(ip, checks, classification);

  return {
    ip,
    version,
    verdict,
    score,
    classification,
    checks,
    timestamp: new Date(),
  };
}
