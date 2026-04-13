# 🛡️ CheckYourWeb

**Instant Browser Security Check + Private Virus Scanner — All in Your Browser**

CheckYourWeb is a modern, production-ready web application that performs comprehensive browser security audits and client-side virus/malware scanning. Everything runs 100% in your browser — no data is ever sent to any server.

---

## ✨ Features

### 🔒 Browser Security Audit
- **Browser Detection** — Identifies browser name, version, and operating system
- **HTTPS Status** — Verifies secure connection
- **Outdated Browser Detection** — Checks against known latest versions of Chrome, Firefox, Edge, and Safari
- **Cookie Security** — Analyzes cookie settings and flags
- **Do Not Track / Global Privacy Control** — Checks privacy signal headers
- **WebRTC Leak Risk** — Detects potential IP leak through WebRTC
- **Mixed Content Detection** — Identifies HTTP/HTTPS mixed content risks
- **Permission Summary** — Audits camera, microphone, location, and notification permissions
- **Fingerprint Resistance Score** — Evaluates browser fingerprinting exposure
- **Service Worker Detection** — Checks for service worker support
- **localStorage Availability** — Validates storage access

### 🦠 Virus & Malware Scanner
- **SHA-256 Hash Calculation** — Uses Web Crypto API for file hashing
- **Known Malware Database** — Checks against EICAR test virus + well-known malware hashes
- **Magic Byte Verification** — Validates file types against their binary signatures
- **Heuristic Analysis** — Scans scripts for suspicious patterns (eval, obfuscation, download cradles, crypto mining)
- **PDF Report Generation** — Download professional scan reports using jsPDF
- Supports: `.exe`, `.dll`, `.js`, `.pdf`, `.docx`, `.zip`, `.apk`, `.bat`, `.cmd`, `.ps1`, `.vbs`, `.msi`, `.py`, `.sh`, `.html`
- File size limit: 20 MB

### 🎨 UI & Design
- Modern, premium security-themed design with deep blues, greens, and cyan/purple accents
- Dark/Light mode with system preference detection and manual toggle
- Fully responsive (mobile-first + desktop)
- Animated security score gauge
- Professional drag-and-drop file upload
- Color-coded status badges (🟢 Secure, 🟡 Warning, 🔴 At Risk)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pulkitrais/checkyourweb.git
   cd checkyourweb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
checkyourweb/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard with security audit + virus scanner
│   │   ├── how-it-works/
│   │   │   └── page.tsx          # Educational page explaining all checks
│   │   ├── privacy/
│   │   │   └── page.tsx          # Privacy policy
│   │   ├── globals.css           # Global styles + Tailwind config
│   │   ├── layout.tsx            # Root layout with metadata + theme
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # Reusable UI components (Button, Card, Badge, etc.)
│   │   ├── browser-security-tab.tsx  # Browser security audit tab
│   │   ├── virus-scanner-tab.tsx     # Virus scanner tab
│   │   ├── security-score.tsx        # Circular score gauge
│   │   ├── header.tsx                # Site header with navigation
│   │   ├── footer.tsx                # Site footer
│   │   ├── theme-toggle.tsx          # Dark/light mode toggle
│   │   └── client-layout.tsx         # Client-side layout wrapper
│   └── lib/
│       ├── browser-security.ts   # Browser security audit logic
│       ├── virus-scanner.ts      # File scanning & heuristic analysis
│       ├── theme-provider.tsx    # Theme context provider
│       └── utils.ts              # Utility functions (cn)
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🔐 Privacy & Security

- **100% Client-Side** — All security checks and file scans run entirely in your browser
- **Zero Data Collection** — No analytics, tracking, or data transmission
- **No Server Communication** — Files are never uploaded; hashes are computed locally
- **Minimal Storage** — Only theme preference is saved to localStorage
- **Open Source** — Full transparency into how every check works

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Beautiful, consistent icons |
| [jsPDF](https://github.com/parallax/jsPDF) | Client-side PDF generation |
| [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) | SHA-256 hash computation |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Deploy — no configuration needed!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify** — Use the Next.js plugin
- **AWS Amplify** — Native Next.js support
- **Docker** — Use the official Next.js Docker example

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## ⚠️ Disclaimer

CheckYourWeb is a **client-side security tool** designed for quick checks and educational purposes. It should **not** be used as a replacement for dedicated antivirus/anti-malware software, professional security audits, or enterprise security solutions.

The virus scanner uses hash matching and basic heuristic analysis. For comprehensive malware detection, always use a full-featured antivirus solution.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for a safer web**
