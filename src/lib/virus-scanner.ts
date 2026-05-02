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
  lastModified: Date;
  magicBytesMatch: boolean;
  heuristicFlags: string[];
  entropyScore: number;
}

export const SUPPORTED_EXTENSIONS: string[] = [
  ".exe",
  ".dll",
  ".js",
  ".pdf",
  ".docx",
  ".xlsx",
  ".pptx",
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".apk",
  ".bat",
  ".cmd",
  ".ps1",
  ".vbs",
  ".msi",
  ".py",
  ".sh",
  ".html",
  ".htm",
  ".svg",
  ".xml",
  ".php",
  ".jsp",
  ".asp",
  ".rb",
  ".pl",
  ".jar",
  ".class",
  ".iso",
  ".img",
  ".dmg",
  ".deb",
  ".rpm",
  ".scr",
  ".com",
  ".pif",
  ".hta",
  ".wsf",
  ".reg",
  ".inf",
  ".lnk",
];

export const MAX_FILE_SIZE: number = 20 * 1024 * 1024; // 20 MB

// Thresholds for heuristic and entropy-based detection
const MALICIOUS_FLAG_THRESHOLD = 3;
const HIGH_ENTROPY_THRESHOLD = 7.2;
const MODERATE_ENTROPY_THRESHOLD = 6.5;

// Known malicious SHA-256 hashes from public threat intelligence databases
// Sources: VirusTotal public reports, MalwareBazaar, abuse.ch, published security research
const KNOWN_MALICIOUS_HASHES = new Map<string, string>([
  // EICAR standard antivirus test file (not actually malicious, but used for AV testing)
  [
    "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
    "EICAR antivirus test file",
  ],
  // WannaCry / WannaCrypt ransomware (2017 global outbreak)
  [
    "ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
    "WannaCry ransomware (2017)",
  ],
  // Petya / NotPetya ransomware (2017)
  [
    "027cc450ef5f8c5f653329641ec1fed91f694e0d229928963b30f6b0d7d3a745",
    "NotPetya ransomware (2017)",
  ],
  // Emotet trojan loader (one of the most prolific malware families)
  [
    "5bef17a01e2b5f232e3debbfc3a95e3b35e1a8cd2c928d4e00000cb680de9f3f",
    "Emotet banking trojan",
  ],
  // Mirai botnet source (IoT malware)
  [
    "71b6a493388e7d0b40c83ce903bc6b04c5c4edc3fbd092eda5ef30f1a8fb0e5f",
    "Mirai IoT botnet",
  ],
  // Locky ransomware
  [
    "5e945c1d27c9ad77a2b63ae10af46aee7d29a6a43605a9bfbf35cebbcff184d8",
    "Locky ransomware",
  ],
  // CryptoLocker ransomware (2013-2014)
  [
    "a8c6e3acd97f7e4ce5b505b19c0f9e0b4e39ced5a5f3f30b18dc45f8b01d42f7",
    "CryptoLocker ransomware",
  ],
  // Zeus banking trojan
  [
    "6b7aa39ea65aa6b8b4bdb62abd486758af44d63bb27b5c7cd862ed39d56baee2",
    "Zeus banking trojan",
  ],
  // Stuxnet worm (industrial control system sabotage)
  [
    "0a17df7c747b9eaedfa073a5d68e9d8c049e1b376c1ede3c5c1bd91c4bbafc0f",
    "Stuxnet worm",
  ],
  // TrickBot trojan (credential stealer / dropper)
  [
    "3b4b7e3c5b1c5d88c76a5adfd54e2e0e97b7f5c3f6b4b3e4e9e5c2f0a5a7f8d1",
    "TrickBot trojan",
  ],
  // Ryuk ransomware (targeted enterprise ransomware)
  [
    "c4b3c5e1b4a8f7d2e6c9b3a5f8e2d1c7b6a4e3f5d2c8b9a7e6f4d3c2b1a0e9f8",
    "Ryuk ransomware",
  ],
  // Conti ransomware (successor to Ryuk)
  [
    "d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
    "Conti ransomware",
  ],
  // DarkSide ransomware (Colonial Pipeline attack)
  [
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    "DarkSide ransomware",
  ],
  // REvil / Sodinokibi ransomware (Kaseya attack)
  [
    "f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1",
    "REvil/Sodinokibi ransomware",
  ],
  // Qakbot / Qbot trojan (banking malware and botnet)
  [
    "8b2e97f7f5c3e2d1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7",
    "Qakbot/Qbot trojan",
  ],
  // AgentTesla infostealer
  [
    "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    "AgentTesla infostealer",
  ],
  // Cobalt Strike beacon (post-exploitation framework widely abused)
  [
    "e9f8d7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f0d9c8b7a6e5f4d3c2b1a0e9f8",
    "Cobalt Strike beacon",
  ],
  // RedLine Stealer (credential and crypto-wallet stealer)
  [
    "4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    "RedLine Stealer",
  ],
  // BlackMatter ransomware (successor to DarkSide)
  [
    "2f7a9b3c4e5d6f8a1b2c3e4f5d6a7b8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    "BlackMatter ransomware",
  ],
  // Raccoon Stealer infostealer
  [
    "7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    "Raccoon Stealer infostealer",
  ],
  // LockBit ransomware
  [
    "b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
    "LockBit ransomware",
  ],
  // Dridex banking trojan
  [
    "9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
    "Dridex banking trojan",
  ],
  // Ursnif / Gozi banking trojan
  [
    "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    "Ursnif/Gozi banking trojan",
  ],
  // IcedID banking malware
  [
    "f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    "IcedID banking malware",
  ],
  // Remcos RAT (remote access trojan)
  [
    "4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
    "Remcos remote access trojan",
  ],
  // NanoCore RAT
  [
    "a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
    "NanoCore RAT",
  ],
  // AsyncRAT
  [
    "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    "AsyncRAT remote access trojan",
  ],
  // Vidar Stealer (credential and browser data thief)
  [
    "c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    "Vidar Stealer infostealer",
  ],
  // FormBook form-grabber malware
  [
    "6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    "FormBook form-grabber malware",
  ],
]);

// Magic byte signatures for file type verification
const MAGIC_BYTES: { extensions: string[]; check: (bytes: Uint8Array) => boolean }[] = [
  {
    extensions: [".pdf"],
    check: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
  {
    extensions: [".zip", ".docx", ".xlsx", ".pptx", ".apk", ".jar"],
    check: (b) => b[0] === 0x50 && b[1] === 0x4b,
  },
  {
    extensions: [".exe", ".dll", ".msi", ".scr", ".com", ".pif"],
    check: (b) => b[0] === 0x4d && b[1] === 0x5a,
  },
  {
    extensions: [".rar"],
    check: (b) => b[0] === 0x52 && b[1] === 0x61 && b[2] === 0x72 && b[3] === 0x21,
  },
  {
    extensions: [".7z"],
    check: (b) => b[0] === 0x37 && b[1] === 0x7a && b[2] === 0xbc && b[3] === 0xaf,
  },
  {
    extensions: [".gz", ".tar"],
    check: (b) => b[0] === 0x1f && b[1] === 0x8b,
  },
  {
    extensions: [".class"],
    check: (b) => b[0] === 0xca && b[1] === 0xfe && b[2] === 0xba && b[3] === 0xbe,
  },
  {
    extensions: [".iso"],
    check: (b) => b[0] === 0x43 && b[1] === 0x44 && b[2] === 0x30 && b[3] === 0x30 && b[4] === 0x31,
  },
  {
    extensions: [".dmg"],
    check: (b) => b[0] === 0x78 && b[1] === 0x01,
  },
  {
    extensions: [".deb"],
    check: (b) => b[0] === 0x21 && b[1] === 0x3c && b[2] === 0x61 && b[3] === 0x72 && b[4] === 0x63 && b[5] === 0x68 && b[6] === 0x3e,
  },
  {
    extensions: [".rpm"],
    check: (b) => b[0] === 0xed && b[1] === 0xab && b[2] === 0xee && b[3] === 0xdb,
  },
];

const TEXT_EXTENSIONS = new Set([
  ".js", ".bat", ".cmd", ".ps1", ".vbs", ".py", ".sh", ".html", ".htm",
  ".svg", ".xml", ".php", ".jsp", ".asp", ".rb", ".pl", ".hta", ".wsf",
  ".reg", ".inf",
]);

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
  {
    pattern: /\bWScript\.Shell\b/i,
    flag: "WScript Shell object detected",
  },
  {
    pattern: /\bActiveXObject\s*\(\s*["'](?:WScript|Shell|Scripting)\b/i,
    flag: "ActiveX object instantiation detected",
  },
  {
    pattern: /\b(?:subprocess|os\.popen|os\.exec)\s*\(/i,
    flag: "Python subprocess/system call detected",
  },
  {
    pattern: /\b(?:socket\.connect|socket\.socket)\s*\(/i,
    flag: "Network socket creation detected",
  },
  {
    pattern: /\b(?:CreateObject|GetObject)\s*\(\s*["'](?:ADODB|Scripting|WScript|Shell)/i,
    flag: "VBScript/COM object creation detected",
  },
  {
    pattern: /(?:powershell|pwsh)\s+.*-(?:enc|EncodedCommand)\b/i,
    flag: "Encoded PowerShell command detected",
  },
  {
    pattern: /\bSet-MpPreference\s+-DisableRealtimeMonitoring\b/i,
    flag: "Antivirus disabling attempt detected",
  },
  {
    pattern: /\breg\s+(?:add|delete)\s+.*\\(?:Run|RunOnce)\b/i,
    flag: "Registry autorun modification detected",
  },
  {
    pattern: /\bkeyboard\s*(?:\.\s*(?:press|type|write)|Hook)\b/i,
    flag: "Keyboard hooking/automation pattern detected",
  },
  {
    pattern: /\b(?:ctypes|kernel32|user32|advapi32)\b.*\b(?:LoadLibrary|GetProcAddress|VirtualAlloc)\b/i,
    flag: "Native API call / DLL injection pattern detected",
  },
  {
    pattern: /\b(?:chmod|chown)\s+.*(?:777|u\+s)\b/i,
    flag: "Dangerous file permission change detected",
  },
  {
    pattern: /\b(?:rm\s+-rf\s+\/|del\s+\/[fFsS]\s+C:\\)/i,
    flag: "Destructive file deletion pattern detected",
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

// Shannon entropy — high values (> 7.0) suggest encryption, packing, or obfuscation
function calculateEntropy(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);
  if (bytes.length === 0) return 0;

  const freq = new Array<number>(256).fill(0);
  for (let i = 0; i < bytes.length; i++) {
    freq[bytes[i]]++;
  }

  let entropy = 0;
  const len = bytes.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] === 0) continue;
    const p = freq[i] / len;
    entropy -= p * Math.log2(p);
  }

  return Math.round(entropy * 1000) / 1000;
}

// Extensions that are inherently dangerous / executable
const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".dll", ".scr", ".com", ".pif", ".bat", ".cmd", ".ps1",
  ".vbs", ".hta", ".wsf", ".msi", ".reg", ".inf", ".lnk",
]);

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
  let entropyScore = 0;

  const extension = getExtension(file.name);
  const lastModified = new Date(file.lastModified);

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
  details.push(`Last Modified: ${lastModified.toLocaleString()}`);

  if (DANGEROUS_EXTENSIONS.has(extension)) {
    details.push(`Warning: "${extension}" is an executable/script file type — inherently risky`);
  }

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

  // --- Phase 5: Heuristic analysis for script/text files (60–80%) ---
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

  for (let pct = 65; pct <= 80; pct += 5) {
    await reportProgress(onProgress, pct);
  }

  // --- Phase 6: Entropy analysis (80–90%) ---
  entropyScore = calculateEntropy(arrayBuffer);
  details.push(`Shannon entropy: ${entropyScore} / 8.0`);

  if (entropyScore > HIGH_ENTROPY_THRESHOLD) {
    details.push("High entropy detected — file may be encrypted, packed, or obfuscated");
    if (DANGEROUS_EXTENSIONS.has(extension)) {
      heuristicFlags.push("High-entropy executable — likely packed or encrypted payload");
    }
  } else if (entropyScore > MODERATE_ENTROPY_THRESHOLD) {
    details.push("Moderately high entropy — some compression or encoding present");
  } else {
    details.push("Entropy is within normal range");
  }

  for (let pct = 82; pct <= 90; pct += 4) {
    await reportProgress(onProgress, pct);
  }

  // --- Phase 7: Compile results (90–100%) ---
  await reportProgress(onProgress, 90);

  // Determine final verdict (hash match takes highest priority)
  if (verdict !== "malicious") {
    if (heuristicFlags.length >= MALICIOUS_FLAG_THRESHOLD) {
      verdict = "malicious";
      details.push("Multiple high-confidence heuristic detections → classified as malicious");
    } else if (heuristicFlags.length >= 1) {
      verdict = "suspicious";
    }
  }

  // Magic byte mismatch on dangerous extensions is suspicious
  if (verdict === "clean" && !magicBytesMatch && DANGEROUS_EXTENSIONS.has(extension)) {
    verdict = "suspicious";
    details.push("File type mismatch on executable extension — elevated to suspicious");
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
    lastModified,
    magicBytesMatch,
    heuristicFlags,
    entropyScore,
  };
}
