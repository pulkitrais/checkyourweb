export type ScanVerdict = "clean" | "suspicious" | "malicious";

export interface ScanResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  sha256Hash: string;
  verdict: ScanVerdict;
  details: string[];
  scanDuration: number;
  timestamp: Date;
  magicBytesMatch: boolean;
  heuristicFlags: string[];
}

export const SUPPORTED_EXTENSIONS: string[] = [
  ".exe",
  ".dll",
  ".js",
  ".pdf",
  ".docx",
  ".zip",
  ".apk",
  ".bat",
  ".cmd",
  ".ps1",
  ".vbs",
  ".msi",
  ".py",
  ".sh",
  ".html",
];

export const MAX_FILE_SIZE: number = 20 * 1024 * 1024; // 20 MB

// Known malicious SHA-256 hashes from public threat intelligence databases
const KNOWN_MALICIOUS_HASHES = new Map<string, string>([
  [
    "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
    "EICAR test file",
  ],
  [
    "ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
    "WannaCry ransomware",
  ],
  [
    "027cc450ef5f8c5f653329641ec1fed91f694e0d229928963b30f6b0d7d3a745",
    "Petya/NotPetya ransomware",
  ],
  [
    "5bef17a01e2b5f232e3debbfc3a95e3b35e1a8cd2c928d4e00000cb680de9f3f",
    "Emotet trojan",
  ],
  [
    "71b6a493388e7d0b40c83ce903bc6b04c5c4edc3fbd092eda5ef30f1a8fb0e5f",
    "Mirai botnet",
  ],
  [
    "5e945c1d27c9ad77a2b63ae10af46aee7d29a6a43605a9bfbf35cebbcff184d8",
    "Locky ransomware",
  ],
  [
    "a8c6e3acd97f7e4ce5b505b19c0f9e0b4e39ced5a5f3f30b18dc45f8b01d42f7",
    "CryptoLocker ransomware",
  ],
  [
    "6b7aa39ea65aa6b8b4bdb62abd486758af44d63bb27b5c7cd862ed39d56baee2",
    "Zeus trojan",
  ],
  [
    "0a17df7c747b9eaedfa073a5d68e9d8c049e1b376c1ede3c5c1bd91c4bbafc0f",
    "Stuxnet worm",
  ],
]);

// Magic byte signatures for file type verification
const MAGIC_BYTES: { extensions: string[]; check: (bytes: Uint8Array) => boolean }[] = [
  {
    extensions: [".pdf"],
    check: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
  {
    extensions: [".zip", ".docx", ".xlsx", ".apk"],
    check: (b) => b[0] === 0x50 && b[1] === 0x4b,
  },
  {
    extensions: [".exe", ".dll", ".msi"],
    check: (b) => b[0] === 0x4d && b[1] === 0x5a,
  },
];

const TEXT_EXTENSIONS = new Set([".js", ".bat", ".cmd", ".ps1", ".vbs", ".py", ".sh", ".html"]);

// Suspicious patterns for heuristic analysis
const HEURISTIC_PATTERNS: { pattern: RegExp; flag: string }[] = [
  {
    pattern: /eval\s*\(\s*(?:unescape|atob|String\.fromCharCode|decodeURIComponent)\s*\(/i,
    flag: "Obfuscated eval() call detected",
  },
  {
    pattern: /document\.write\s*\(\s*(?:unescape|atob|decodeURIComponent)\s*\(/i,
    flag: "Encoded document.write() detected",
  },
  {
    pattern: /(?:[A-Za-z0-9+/]{500,}={0,2})/,
    flag: "Large Base64-encoded payload detected",
  },
  {
    pattern: /\b(?:IEX|Invoke-Expression)\b/i,
    flag: "PowerShell Invoke-Expression detected",
  },
  {
    pattern: /\bNet\.WebClient\b/i,
    flag: "PowerShell Net.WebClient detected",
  },
  {
    pattern: /\bDownloadString\b/i,
    flag: "PowerShell DownloadString detected",
  },
  {
    pattern: /cmd\s*(?:\/c|\.exe)\b/i,
    flag: "Command shell execution detected",
  },
  {
    pattern: /\b(?:exec|system|os\.system)\s*\(/i,
    flag: "Shell/system command execution detected",
  },
  {
    pattern: /\b(?:CoinHive|coinhive|cryptonight)\b/i,
    flag: "Crypto mining indicator detected",
  },
  {
    pattern: /\b(?:malware-distribution\.com|evil-domain\.net|hack3r\.xyz|darkweb-payload\.org)\b/i,
    flag: "Known malicious domain reference detected",
  },
  {
    pattern: /<iframe[^>]+(?:style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|width\s*:\s*0|height\s*:\s*0))/i,
    flag: "Hidden iframe injection detected",
  },
  {
    pattern: /on(?:keypress|keydown)\s*=[\s\S]*?XMLHttpRequest/i,
    flag: "Keylogger pattern detected",
  },
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(2))} ${units[i]}`;
}

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    throw new Error("Web Crypto API is not available for SHA-256 hashing");
  }
}

function verifyMagicBytes(headerBytes: Uint8Array, extension: string): boolean {
  if (TEXT_EXTENSIONS.has(extension)) {
    // Text files: verify content is valid UTF-8/ASCII
    return headerBytes.every((b) => b < 0x80 || (b >= 0xc0 && b <= 0xf7));
  }

  for (const entry of MAGIC_BYTES) {
    if (entry.extensions.includes(extension)) {
      return entry.check(headerBytes);
    }
  }

  // No magic byte rule for this extension — cannot disprove, treat as match
  return true;
}

function runHeuristicAnalysis(content: string): string[] {
  const flags: string[] = [];
  for (const { pattern, flag } of HEURISTIC_PATTERNS) {
    if (pattern.test(content)) {
      flags.push(flag);
    }
  }
  return flags;
}

async function reportProgress(
  onProgress: ((progress: number) => void) | undefined,
  value: number,
): Promise<void> {
  if (!onProgress) return;
  onProgress(Math.min(100, Math.round(value)));
  // Yield to the event loop so the UI can repaint
  await new Promise((resolve) => setTimeout(resolve, 30));
}

export async function scanFile(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ScanResult> {
  const startTime = performance.now();
  const details: string[] = [];
  let heuristicFlags: string[] = [];
  let verdict: ScanVerdict = "clean";
  let sha256Hash = "";
  let magicBytesMatch = true;

  const extension = getExtension(file.name);

  // --- Phase 1: Validate file size and type (0–10%) ---
  await reportProgress(onProgress, 0);

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${formatFileSize(file.size)}) exceeds the ${formatFileSize(MAX_FILE_SIZE)} limit`,
    );
  }

  if (extension && !SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error(`Unsupported file extension: ${extension}`);
  }

  details.push(`File: ${file.name} (${formatFileSize(file.size)})`);
  await reportProgress(onProgress, 10);

  // --- Phase 2: Read file and compute SHA-256 hash (10–40%) ---
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error("Failed to read file contents");
  }

  await reportProgress(onProgress, 25);

  try {
    sha256Hash = await computeSha256(arrayBuffer);
  } catch {
    details.push("Warning: SHA-256 hashing unavailable — hash-based detection skipped");
    sha256Hash = "unavailable";
  }

  details.push(`SHA-256: ${sha256Hash}`);
  await reportProgress(onProgress, 40);

  // --- Phase 3: Check hash against known malware database (40–50%) ---
  if (sha256Hash !== "unavailable") {
    const malwareName = KNOWN_MALICIOUS_HASHES.get(sha256Hash);
    if (malwareName) {
      verdict = "malicious";
      details.push(`Hash matches known malware: ${malwareName}`);
    }
  }
  await reportProgress(onProgress, 50);

  // --- Phase 4: Verify magic bytes (50–60%) ---
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 16));
  magicBytesMatch = verifyMagicBytes(headerBytes, extension);

  if (!magicBytesMatch) {
    details.push(
      `Magic bytes do not match expected signature for ${extension} files — possible file spoofing`,
    );
  } else {
    details.push("Magic bytes match expected file type");
  }
  await reportProgress(onProgress, 60);

  // --- Phase 5: Heuristic analysis for script/text files (60–90%) ---
  if (TEXT_EXTENSIONS.has(extension)) {
    try {
      const textContent = new TextDecoder("utf-8", { fatal: false }).decode(arrayBuffer);
      heuristicFlags = runHeuristicAnalysis(textContent);

      if (heuristicFlags.length > 0) {
        details.push(`Heuristic analysis found ${heuristicFlags.length} suspicious pattern(s)`);
      } else {
        details.push("Heuristic analysis: no suspicious patterns found");
      }
    } catch {
      details.push("Warning: heuristic analysis failed — file could not be decoded as text");
    }
  } else {
    details.push("Heuristic analysis: skipped (binary file)");
  }

  // Simulate realistic scanning delay across the 60-90% range
  for (let pct = 65; pct <= 90; pct += 5) {
    await reportProgress(onProgress, pct);
  }

  // --- Phase 6: Compile results (90–100%) ---
  await reportProgress(onProgress, 90);

  // Determine final verdict (hash match takes highest priority)
  if (verdict !== "malicious" && heuristicFlags.length >= 2) {
    verdict = "suspicious";
  }

  if (verdict === "clean" && !magicBytesMatch) {
    details.push("Note: file type mismatch is informational and does not affect verdict");
  }

  const scanDuration = Math.round(performance.now() - startTime);
  details.push(`Scan completed in ${scanDuration}ms`);

  await reportProgress(onProgress, 100);

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || extension || "unknown",
    sha256Hash,
    verdict,
    details,
    scanDuration,
    timestamp: new Date(),
    magicBytesMatch,
    heuristicFlags,
  };
}
